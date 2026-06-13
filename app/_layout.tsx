import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MobileAds from 'react-native-google-mobile-ads';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { registerForPushNotifications } from '../services/pushNotifications';
import { AppProvider } from '../store/AppContext';
import { AuthProvider, useAuth } from '../store/AuthContext';
import { PurchaseProvider } from '../store/PurchaseContext';
import Paywall from '../components/Paywall';
import { theme } from '../constants/theme';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthScreen = segments[0] === 'auth';

    if (!session && !inAuthScreen) {
      router.replace('/auth');
    } else if (session && inAuthScreen) {
      router.replace('/');
    }
  }, [session, loading, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  useEffect(() => {
    (async () => {
      await requestTrackingPermissionsAsync();
      MobileAds().initialize();
      registerForPushNotifications();
    })();
  }, []);

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
              <Paywall />
            </AuthGate>
          </AppProvider>
        </PurchaseProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
