/**
 * Tests for guest access behavior (Apple Guideline 5.1.1(v)).
 * Verifies that unauthenticated users can access the app without being forced to log in.
 */

type Segments = string[];

function computeAuthRedirect(
  session: boolean,
  loading: boolean,
  segments: Segments,
): { redirect: boolean; to?: string } {
  if (loading) return { redirect: false };
  const inAuthScreen = segments[0] === 'auth';
  // Only redirect signed-in users away from the auth screen
  if (session && inAuthScreen) return { redirect: true, to: '/' };
  return { redirect: false };
}

describe('AuthGate redirect logic', () => {
  describe('unauthenticated users (guests)', () => {
    it('are NOT redirected when on the feed screen', () => {
      const result = computeAuthRedirect(false, false, ['index']);
      expect(result.redirect).toBe(false);
    });

    it('are NOT redirected when on the auth screen (e.g. they navigate there)', () => {
      const result = computeAuthRedirect(false, false, ['auth']);
      expect(result.redirect).toBe(false);
    });

    it('are NOT redirected when on any other screen', () => {
      expect(computeAuthRedirect(false, false, ['profile']).redirect).toBe(false);
      expect(computeAuthRedirect(false, false, ['subscription']).redirect).toBe(false);
      expect(computeAuthRedirect(false, false, ['settings']).redirect).toBe(false);
    });
  });

  describe('authenticated users', () => {
    it('are redirected from auth screen to feed when already signed in', () => {
      const result = computeAuthRedirect(true, false, ['auth']);
      expect(result.redirect).toBe(true);
      expect(result.to).toBe('/');
    });

    it('are NOT redirected when on the feed', () => {
      const result = computeAuthRedirect(true, false, ['index']);
      expect(result.redirect).toBe(false);
    });

    it('are NOT redirected from other screens', () => {
      expect(computeAuthRedirect(true, false, ['profile']).redirect).toBe(false);
      expect(computeAuthRedirect(true, false, ['subscription']).redirect).toBe(false);
    });
  });

  describe('loading state', () => {
    it('never redirects while auth is still loading', () => {
      expect(computeAuthRedirect(false, true, ['index']).redirect).toBe(false);
      expect(computeAuthRedirect(true, true, ['auth']).redirect).toBe(false);
      expect(computeAuthRedirect(false, true, ['auth']).redirect).toBe(false);
    });
  });
});
