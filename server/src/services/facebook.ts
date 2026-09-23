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

// Posting to a Page's /photos endpoint needs a Page-scoped access token, not
// the System User token itself - using the System User token directly there
// gets rejected with a "publish_actions" deprecated-permission error, since
// that endpoint expects to be acting as the Page rather than as the user/
// system-user that manages it. Exchanging is a single extra call, and the
// result is cached since a Page token derived from a non-expiring System
// User token doesn't expire either.
let pageAccessToken: string | null = null;

async function getPageAccessToken(systemUserToken: string, pageId: string): Promise<string> {
  if (pageAccessToken) return pageAccessToken;

  const res = await fetch(
    `${GRAPH_API_BASE}/${pageId}?fields=access_token&access_token=${encodeURIComponent(systemUserToken)}`,
  );
  const body: any = await res.json();
  if (!res.ok || !body?.access_token) {
    throw new Error(`Graph API error (page token exchange): ${body?.error?.message ?? res.statusText}`);
  }
  pageAccessToken = body.access_token;
  return pageAccessToken as string;
}

export async function postCardToFacebook(imageUrl: string, caption: string): Promise<void> {
  const creds = getCreds();
  if (!creds) return;

  const token = await getPageAccessToken(creds.accessToken, creds.pageId);

  const res = await fetch(`${GRAPH_API_BASE}/${creds.pageId}/photos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ url: imageUrl, caption, access_token: token }),
  });
  const body: any = await res.json();
  if (!res.ok) throw new Error(`Graph API error: ${body?.error?.message ?? res.statusText}`);
}
