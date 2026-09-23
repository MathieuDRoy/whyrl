const GRAPH_API_BASE = 'https://graph.facebook.com/v21.0';

let warnedMissingCreds = false;

function getCreds(): { accessToken: string; pageId: string } | null {
  const accessToken = process.env.FB_PAGE_ACCESS_TOKEN;
  const pageId = process.env.FB_PAGE_ID;
  if (!accessToken || !pageId) {
    if (!warnedMissingCreds) {
      console.warn('[facebook] FB_PAGE_ACCESS_TOKEN/FB_PAGE_ID not set — skipping post');
      warnedMissingCreds = true;
    }
    return null;
  }
  return { accessToken, pageId };
}

export async function postCardToFacebook(imageUrl: string, caption: string): Promise<void> {
  const creds = getCreds();
  if (!creds) return;

  const res = await fetch(`${GRAPH_API_BASE}/${creds.pageId}/photos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ url: imageUrl, caption, access_token: creds.accessToken }),
  });
  const body: any = await res.json();
  if (!res.ok) throw new Error(`Graph API error: ${body?.error?.message ?? res.statusText}`);
}
