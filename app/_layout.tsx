import { useEffect } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Stack, ThemeProvider, DarkTheme, useRouter, useSegments } from 'expo-router';
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
import { SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import GlassBackground from '../components/GlassBackground';
import { registerForPushNotifications } from '../services/pushNotifications';
import { AppProvider } from '../store/AppContext';
import { AuthProvider, useAuth } from '../store/AuthContext';
import { PurchaseProvider } from '../store/PurchaseContext';
import { theme } from '../constants/theme';
import { computeAuthRedirect } from '../utils/authRedirect';

SplashScreen.preventAutoHideAsync();

const navTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: 'transparent', card: 'transparent' },
};

(Text as any).defaultProps = (Text as any).defaultProps || {};
(Text as any).defaultProps.style = [{ fontFamily: theme.fonts.regular }, (Text as any).defaultProps.style];
(TextInput as any).defaultProps = (TextInput as any).defaultProps || {};
(TextInput as any).defaultProps.style = [{ fontFamily: theme.fonts.regular }, (TextInput as any).defaultProps.style];

function AuthGate({ fontsLoaded, children }: { fontsLoaded: boolean; children: React.ReactNode }) {
  const { session, loading, profile, profileLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  // Session restore reads from AsyncStorage/Keychain and isn't instant,
  // especially right after a cold launch competing with ads SDK init and
  // tracking-permission prompts. Keep the splash up until it resolves so
  // the feed can't become tappable while `userId` is still unknown -
  // otherwise a save tapped in that window hits toggleSave's `if
  // (!userId) return` and silently does nothing.
  useEffect(() => {
    if (fontsLoaded && !loading && !profileLoading) SplashScreen.hideAsync();
  }, [fontsLoaded, loading, profileLoading]);

  useEffect(() => {
    const result = computeAuthRedirect(!!session, !!profile, loading, profileLoading, segments);
    if (result.redirect) router.replace(result.to);
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
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  useEffect(() => {
    (async () => {
      await requestTrackingPermissionsAsync();
      MobileAds().initialize();
      registerForPushNotifications();
    })();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <GlassBackground />
        <AuthProvider>
          <PurchaseProvider>
            <AppProvider>
              <StatusBar style="light" backgroundColor={theme.colors.bg} />
              <AuthGate fontsLoaded={fontsLoaded}>
                <ThemeProvider value={navTheme}>
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      contentStyle: { backgroundColor: 'transparent' },
                      animation: 'slide_from_right',
                    }}
                  />
                </ThemeProvider>
              </AuthGate>
            </AppProvider>
          </PurchaseProvider>
        </AuthProvider>
      </View>
    </SafeAreaProvider>
  );
}
