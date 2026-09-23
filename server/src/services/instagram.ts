const GRAPH_API_BASE = 'https://graph.facebook.com/v21.0';
const PUBLISH_POLL_ATTEMPTS = 5;
const PUBLISH_POLL_DELAY_MS = 2000;

let warnedMissingCreds = false;

function getCreds(): { accessToken: string; igUserId: string } | null {
  const accessToken = process.env.IG_ACCESS_TOKEN;
  const igUserId = process.env.IG_BUSINESS_ACCOUNT_ID;
  if (!accessToken || !igUserId) {
    if (!warnedMissingCreds) {
      console.warn('[instagram] IG_ACCESS_TOKEN/IG_BUSINESS_ACCOUNT_ID not set — skipping post');
      warnedMissingCreds = true;
    }
    return null;
  }
  return { accessToken, igUserId };
}

async function graphPost(path: string, params: Record<string, string>): Promise<any> {
  const res = await fetch(`${GRAPH_API_BASE}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
  });
  const body: any = await res.json();
  if (!res.ok) throw new Error(`Graph API error: ${body?.error?.message ?? res.statusText}`);
  return body;
}

async function graphGet(path: string, params: Record<string, string>): Promise<any> {
  const res = await fetch(`${GRAPH_API_BASE}/${path}?${new URLSearchParams(params)}`);
  const body: any = await res.json();
  if (!res.ok) throw new Error(`Graph API error: ${body?.error?.message ?? res.statusText}`);
  return body;
}

// A freshly created container can briefly report IN_PROGRESS even for a
// plain image (not just video) - publishing before it's FINISHED returns a
// "media ID is not available" error, so poll a few times before giving up.
async function waitUntilFinished(containerId: string, accessToken: string): Promise<void> {
  for (let i = 0; i < PUBLISH_POLL_ATTEMPTS; i++) {
    const { status_code } = await graphGet(containerId, { fields: 'status_code', access_token: accessToken });
    if (status_code === 'FINISHED') return;
    if (status_code === 'ERROR') throw new Error('Container processing failed');
    await new Promise((resolve) => setTimeout(resolve, PUBLISH_POLL_DELAY_MS));
  }
  throw new Error('Container did not finish processing in time');
}

export async function postCardToInstagram(imageUrl: string, caption: string): Promise<void> {
  const creds = getCreds();
  if (!creds) return;

  const { id: containerId } = await graphPost(`${creds.igUserId}/media`, {
    image_url: imageUrl,
    caption,
    access_token: creds.accessToken,
  });

  await waitUntilFinished(containerId, creds.accessToken);

  await graphPost(`${creds.igUserId}/media_publish`, {
    creation_id: containerId,
    access_token: creds.accessToken,
  });
}
