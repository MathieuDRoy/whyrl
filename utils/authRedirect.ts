export type AuthRedirect = { redirect: false } | { redirect: true; to: '/' | '/auth' | '/onboarding' };

// Pure decision logic for AuthGate, kept in its own module (no RN/native
// imports) so both app/_layout.tsx and the test suite can import the exact
// same function instead of the test carrying a copy that can drift out of
// sync with it. Guideline 5.1.1(v) requires letting people use the app
// without an account, so a guest (!session) is only ever bounced off
// /onboarding (which needs one) - never off to /auth.
export function computeAuthRedirect(
  session: boolean,
  profile: boolean,
  loading: boolean,
  profileLoading: boolean,
  segments: readonly string[],
): AuthRedirect {
  if (loading || profileLoading) return { redirect: false };

  const inAuthScreen = segments[0] === 'auth';
  const inOnboarding = segments[0] === 'onboarding';

  if (!session) {
    if (inOnboarding) return { redirect: true, to: '/' };
    return { redirect: false };
  }
  if (!profile) {
    if (!inOnboarding) return { redirect: true, to: '/onboarding' };
    return { redirect: false };
  }
  if (inAuthScreen || inOnboarding) return { redirect: true, to: '/' };
  return { redirect: false };
}
