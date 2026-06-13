// In-memory store — cleared on restart/redeploy. Fine for a small test audience.
const tokens = new Set<string>();

export function addPushToken(token: string): void {
  tokens.add(token);
}

export function removePushToken(token: string): void {
  tokens.delete(token);
}

export function getPushTokens(): string[] {
  return [...tokens];
}
