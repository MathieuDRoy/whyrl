import { useEffect } from 'react';
import { Text, TextInput } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MobileAds from 'react-native-google-mobile-ads';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { registerForPushNotifications } from '../services/pushNotifications';
import { AppProvider } from '../store/AppContext';
import { AuthProvider, useAuth } from '../store/AuthContext';
import { PurchaseProvider } from '../store/PurchaseContext';
import { theme } from '../constants/theme';

SplashScreen.preventAutoHideAsync();

(Text as any).defaultProps = (Text as any).defaultProps || {};
(Text as any).defaultProps.style = [{ fontFamily: theme.fonts.regular }, (Text as any).defaultProps.style];
(TextInput as any).defaultProps = (TextInput as any).defaultProps || {};
(TextInput as any).defaultProps.style = [{ fontFamily: theme.fonts.regular }, (TextInput as any).defaultProps.style];

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading, profile, profileLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading || profileLoading) return;

    const inAuthScreen = segments[0] === 'auth';
    const inOnboarding = segments[0] === 'onboarding';

    if (!session) {
      // Not signed in — must go to auth
      if (!inAuthScreen) router.replace('/auth');
    } else if (!profile) {
      // Signed in but no profile — complete onboarding first
      if (!inOnboarding) router.replace('/onboarding');
    } else {
      // Fully set up — go to feed if on auth/onboarding
      if (inAuthScreen || inOnboarding) router.replace('/');
    }
  }, [session, loading, profile, profileLoading, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  useEffect(() => {
    (async () => {
      await requestTrackingPermissionsAsync();
      MobileAds().initialize();
      registerForPushNotifications();
    })();
  }, []);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PurchaseProvider>
          <AppProvider>
            <StatusBar style="light" backgroundColor={theme.colors.bg} />
            <AuthGate>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: theme.colors.bg },
                  animation: 'slide_from_right',
                }}
              />
            </AuthGate>
          </AppProvider>
        </PurchaseProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
