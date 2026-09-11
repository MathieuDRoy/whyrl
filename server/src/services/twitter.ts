import { TwitterApi } from 'twitter-api-v2';
import { TrendCard } from '../types';

let client: TwitterApi | null = null;
let warnedMissingCreds = false;

function getClient(): TwitterApi | null {
  const { X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET } = process.env;
  if (!X_API_KEY || !X_API_SECRET || !X_ACCESS_TOKEN || !X_ACCESS_SECRET) {
    if (!warnedMissingCreds) {
      console.warn('[twitter] X_API_KEY/X_API_SECRET/X_ACCESS_TOKEN/X_ACCESS_SECRET not set — skipping tweet posting');
      warnedMissingCreds = true;
    }
    return null;
  }
  if (!client) {
    client = new TwitterApi({
      appKey: X_API_KEY,
      appSecret: X_API_SECRET,
      accessToken: X_ACCESS_TOKEN,
      accessSecret: X_ACCESS_SECRET,
    });
  }
  return client;
}

const TWEET_MAX_LENGTH = 280;

// No link in the tweet body - X's pay-as-you-go pricing charges $0.20/post
// for a post containing a URL versus $0.015 for plain text, over 13x more.
export function buildTweetText(card: TrendCard): string {
  const hashtags = card.hashtags.slice(0, 2).map((h) => `#${h}`).join(' ');
  const fixedLength = 2 + hashtags.length; // blank line + hashtags
  const summaryBudget = TWEET_MAX_LENGTH - fixedLength;
  const summary =
    card.summary.length > summaryBudget
      ? `${card.summary.slice(0, summaryBudget - 1).trimEnd()}…`
      : card.summary;
  return `${summary}\n\n${hashtags}`;
}

export async function postCardTweet(card: TrendCard): Promise<void> {
  const twitter = getClient();
  if (!twitter) return;
  await twitter.v2.tweet(buildTweetText(card));
}
