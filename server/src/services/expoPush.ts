const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const BATCH_SIZE = 100;

export async function sendPushNotifications(
  tokens: string[],
  title: string,
  body: string,
): Promise<void> {
  if (tokens.length === 0) return;

  for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
    const batch = tokens.slice(i, i + BATCH_SIZE);
    const messages = batch.map((to) => ({ to, title, body, sound: 'default' }));

    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(messages),
      });
      if (!res.ok) {
        console.warn(`[push] batch failed: ${res.status} ${res.statusText}`);
      }
    } catch (err: any) {
      console.warn('[push] send error:', err?.message);
    }
  }
}
