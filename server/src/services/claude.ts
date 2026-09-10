import Anthropic from '@anthropic-ai/sdk';
import { Category, RawPost, TrendCard } from '../types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a trend analysis engine for Whyrl, a news aggregator app.

Your job: given a list of raw news articles, extract and return the top trending stories as structured JSON.

Rules:
- Write each summary in 1–2 punchy sentences (max 40 words). Hook the reader immediately.
- Write details in 3–5 sentences with more context, numbers, and significance (max 120 words).
- trendingScore must be 1–100 (100 = extremely viral).
- hashtags: 2–4 relevant hashtags WITHOUT the # symbol.
- Assign each card to exactly one category from: politics, finance, sport, entertainment, tech, world.
- timestamp: ISO 8601 string. Use the PUBLISHED value from the source post(s) the card is based on (pick the most recent if multiple). Only fall back to current time if no post has a PUBLISHED value.
- tall: set to true for roughly 1 in 3 cards to create visual variety.
- Skip duplicates and low-quality posts (spam, memes with no news value).
- Return ONLY valid JSON. No markdown. No explanation.`;

const CARDS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['cards'],
  properties: {
    cards: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'title', 'summary', 'details', 'category', 'source', 'region', 'timestamp', 'trendingScore', 'hashtags', 'tall'],
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          summary: { type: 'string' },
          details: { type: 'string' },
          category: { type: 'string', enum: ['politics', 'finance', 'sport', 'entertainment', 'tech', 'world'] },
          source: { type: 'string', enum: ['newsapi'] },
          region: { type: 'string' },
          timestamp: { type: 'string' },
          trendingScore: { type: 'number' },
          hashtags: { type: 'array', items: { type: 'string' } },
          tall: { type: 'boolean' },
        },
      },
    },
  },
};

// Thrown when Claude's safety classifier declines the request outright
// (stop_reason "refusal") rather than erroring. Distinct from other failures
// so callers can retry with a narrower batch instead of giving up entirely.
class ClaudeRefusalError extends Error {
  constructor(public readonly category: string | null) {
    super(`Claude declined the request (category: ${category ?? 'unknown'})`);
  }
}

function buildUserMessage(topPosts: RawPost[], region: string, categories: Category[]): string {
  return `
Current time (UTC): ${new Date().toISOString()}
Region: ${region}
Requested categories: ${categories.join(', ')}

Raw posts to analyze (${topPosts.length} total):
${topPosts.map((p, i) => `[${i + 1}] SOURCE:${p.source} PUBLISHED:${p.publishedAt ?? 'unknown'}
TITLE: ${p.title}
BODY: ${p.body.slice(0, 300)}`).join('\n\n')}

Return up to 25 trend cards as JSON matching the schema. Use region "${region}" on all cards.`;
}

async function callClaude(
  topPosts: RawPost[],
  region: string,
  categories: Category[],
): Promise<TrendCard[]> {
  const userMessage = buildUserMessage(topPosts, region, categories);

  // Cast to any: SDK v0.40 types predate `thinking: adaptive` and `output_config`.
  // Both are supported by the API at runtime — this lets the build succeed until
  // the SDK ships updated type definitions.
  const response = await (client.messages.create as any)({
    model: 'claude-sonnet-4-6',
    max_tokens: 10000,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: userMessage }],
    output_config: {
      format: {
        type: 'json_schema',
        schema: CARDS_SCHEMA,
      },
    },
  });

  const usage = response.usage as any;
  console.log(
    `[Claude] tokens in=${usage.input_tokens} cache_read=${usage.cache_read_input_tokens ?? 0} out=${usage.output_tokens}`,
  );

  // A refusal is a normal 200 response with empty content, not a thrown error
  // (see stop_reason "refusal"). It's usually triggered by one article's
  // content tripping a safety classifier (e.g. a "bio" false-positive on a
  // disease-outbreak headline) rather than the request as a whole.
  if (response.stop_reason === 'refusal') {
    throw new ClaudeRefusalError(response.stop_details?.category ?? null);
  }

  const text = (response.content as any[]).find((b: any) => b.type === 'text') as any;
  if (!text) throw new Error('Claude returned no text block');

  const parsed = JSON.parse(text.text) as { cards: TrendCard[] };
  return parsed.cards;
}

// On a refusal, bisect the batch and retry each half independently instead
// of failing the whole request. This isolates the one poisoned article (the
// common case) so it's silently dropped instead of taking down every other
// story in the batch. Refused attempts aren't billed, so this is cheap.
async function analyzeBatch(
  posts: RawPost[],
  region: string,
  categories: Category[],
): Promise<TrendCard[]> {
  try {
    return await callClaude(posts, region, categories);
  } catch (err) {
    if (!(err instanceof ClaudeRefusalError)) throw err;

    if (posts.length <= 1) {
      console.warn(
        `[Claude] refusal (category: ${err.category ?? 'unknown'}) on single post — skipping: "${posts[0]?.title}"`,
      );
      return [];
    }

    console.warn(`[Claude] refusal (category: ${err.category ?? 'unknown'}) on batch of ${posts.length} — splitting`);
    const mid = Math.ceil(posts.length / 2);
    const [left, right] = await Promise.all([
      analyzeBatch(posts.slice(0, mid), region, categories),
      analyzeBatch(posts.slice(mid), region, categories),
    ]);
    return [...left, ...right];
  }
}

export async function analyzeTrends(
  posts: RawPost[],
  region: string,
  categories: Category[],
): Promise<TrendCard[]> {
  // Cap at 60 to keep the prompt size manageable; NewsAPI already returns
  // posts in relevance/recency order so no re-sorting is needed here.
  const topPosts = posts.slice(0, 60);
  return analyzeBatch(topPosts, region, categories);
}
