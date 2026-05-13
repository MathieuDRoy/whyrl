import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { usePurchase } from '../store/PurchaseContext';

const FEATURES = [
  { icon: 'ban-outline', label: 'Completely ad-free experience' },
  { icon: 'sparkles-outline', label: 'AI-personalized trend feed' },
  { icon: 'flash-outline', label: 'Breaking news 30 minutes early' },
  { icon: 'bookmark-outline', label: 'Unlimited saved stories' },
  { icon: 'globe-outline', label: 'All global regions' },
];

export default function Paywall() {
  const {
    paywallVisible,
    hidePaywall,
    purchaseMonthly,
    restorePurchases,
    purchasing,
    purchaseError,
  } = usePurchase();

  return (
    <Modal
      visible={paywallVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={hidePaywall}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={hidePaywall} style={styles.closeBtn} disabled={purchasing}>
            <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient colors={['#0A2A14', '#0A0A0A']} style={styles.hero}>
            <View style={styles.logoWrap}>
              <Text style={styles.logoText}>W</Text>
            </View>
            <Text style={styles.heroTitle}>Go Ad-Free</Text>
            <Text style={styles.heroSubtitle}>
              Upgrade to Whyrl Premium for a clean, distraction-free experience with all features unlocked.
            </Text>
          </LinearGradient>

          <View style={styles.featureList}>
            {FEATURES.map((f) => (
              <View key={f.label} style={styles.featureRow}>
                <View style={styles.featureCheck}>
                  <Ionicons name="checkmark" size={13} color="#000" />
                </View>
                <Text style={styles.featureText}>{f.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.priceCard}>
            <LinearGradient colors={['#0A2A14', '#061508']} style={styles.priceCardInner}>
              <View style={styles.priceRow}>
                <View>
                  <Text style={styles.planLabel}>PREMIUM MONTHLY</Text>
                  <Text style={styles.planDesc}>Billed monthly · Cancel anytime</Text>
                </View>
                <View style={styles.priceTag}>
                  <Text style={styles.priceAmount}>$4.99</Text>
                  <Text style={styles.pricePeriod}>/mo</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {purchaseError ? (
            <Text style={styles.errorText}>{purchaseError}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.ctaBtn, purchasing && styles.ctaBtnDisabled]}
            onPress={purchaseMonthly}
            disabled={purchasing}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[theme.colors.accent, theme.colors.accentDark]}
              style={styles.ctaBtnGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {purchasing ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <Ionicons name="flash" size={18} color="#000" />
                  <Text style={styles.ctaBtnText}>Subscribe for $4.99/month</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.restoreBtn}
            onPress={restorePurchases}
            disabled={purchasing}
          >
            <Text style={styles.restoreText}>Restore Purchases</Text>
          </TouchableOpacity>

          <Text style={styles.legal}>
            Payment will be charged to your account at confirmation of purchase. Subscription
            renews automatically unless cancelled at least 24 hours before the end of the current
            period. You can manage or cancel in your account settings.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  hero: {
    alignItems: 'center',
    borderRadius: theme.radius.xl,
    padding: 32,
    marginBottom: 28,
    gap: 12,
  },
  logoWrap: {
    width: 64,
    height: 64,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    overflow: 'hidden',
  },
  logoText: {
    color: theme.colors.bg,
    fontSize: 36,
    fontWeight: '900',
  },
  heroTitle: {
    color: theme.colors.textPrimary,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  featureList: {
    gap: 14,
    marginBottom: 28,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureCheck: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureText: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  priceCard: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    overflow: 'hidden',
    marginBottom: 20,
  },
  priceCardInner: {
    padding: 20,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planLabel: {
    color: theme.colors.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  planDesc: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  priceAmount: {
    color: theme.colors.accent,
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 38,
  },
  pricePeriod: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    paddingBottom: 4,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
  ctaBtn: {
    borderRadius: theme.radius.full,
    overflow: 'hidden',
    marginBottom: 14,
  },
  ctaBtnDisabled: {
    opacity: 0.6,
  },
  ctaBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
  },
  ctaBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  restoreBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 20,
  },
  restoreText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  legal: {
    color: theme.colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 15,
  },
});
