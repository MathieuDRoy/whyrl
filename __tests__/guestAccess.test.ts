/**
 * Tests for guest access behavior (Apple Guideline 5.1.1(v)).
 * Verifies that unauthenticated users can access the app without being forced to log in.
 *
 * Imports the real decision function that app/_layout.tsx's AuthGate uses,
 * rather than a standalone copy, so a future change to the actual redirect
 * rules fails this suite instead of silently drifting past it.
 */
import { computeAuthRedirect } from '../utils/authRedirect';

describe('AuthGate redirect logic', () => {
  describe('guests (no session)', () => {
    it('are NOT redirected when on the feed screen', () => {
      expect(computeAuthRedirect(false, false, false, false, ['index']).redirect).toBe(false);
    });

    it('are NOT redirected when on the auth screen (e.g. they navigate there)', () => {
      expect(computeAuthRedirect(false, false, false, false, ['auth']).redirect).toBe(false);
    });

    it('are NOT redirected when on any other screen', () => {
      expect(computeAuthRedirect(false, false, false, false, ['profile']).redirect).toBe(false);
      expect(computeAuthRedirect(false, false, false, false, ['subscription']).redirect).toBe(false);
      expect(computeAuthRedirect(false, false, false, false, ['settings']).redirect).toBe(false);
    });

    it('are redirected away from onboarding, which requires an account', () => {
      const result = computeAuthRedirect(false, false, false, false, ['onboarding']);
      expect(result.redirect).toBe(true);
      expect(result).toMatchObject({ to: '/' });
    });
  });

  describe('signed in without a completed profile', () => {
    it('are redirected to onboarding from the feed', () => {
      const result = computeAuthRedirect(true, false, false, false, ['index']);
      expect(result.redirect).toBe(true);
      expect(result).toMatchObject({ to: '/onboarding' });
    });

    it('are NOT redirected while already on onboarding', () => {
      expect(computeAuthRedirect(true, false, false, false, ['onboarding']).redirect).toBe(false);
    });
  });

  describe('fully signed in (session + profile)', () => {
    it('are redirected from auth screen to feed', () => {
      const result = computeAuthRedirect(true, true, false, false, ['auth']);
      expect(result.redirect).toBe(true);
      expect(result).toMatchObject({ to: '/' });
    });

    it('are redirected from onboarding to feed', () => {
      const result = computeAuthRedirect(true, true, false, false, ['onboarding']);
      expect(result.redirect).toBe(true);
      expect(result).toMatchObject({ to: '/' });
    });

    it('are NOT redirected when on the feed', () => {
      expect(computeAuthRedirect(true, true, false, false, ['index']).redirect).toBe(false);
    });

    it('are NOT redirected from other screens', () => {
      expect(computeAuthRedirect(true, true, false, false, ['profile']).redirect).toBe(false);
      expect(computeAuthRedirect(true, true, false, false, ['subscription']).redirect).toBe(false);
    });
  });

  describe('loading state', () => {
    it('never redirects while auth or profile is still loading', () => {
      expect(computeAuthRedirect(false, false, true, false, ['index']).redirect).toBe(false);
      expect(computeAuthRedirect(true, false, false, true, ['auth']).redirect).toBe(false);
      expect(computeAuthRedirect(false, false, true, false, ['auth']).redirect).toBe(false);
    });
  });
});
