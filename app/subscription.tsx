import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { useApp } from '../store/AppContext';
import { usePurchase } from '../store/PurchaseContext';

const FREE_FEATURES = [
  { label: 'Up to 8 trend cards per session', included: true },
  { label: 'All 6 content categories', included: true },
  { label: 'Basic search', included: true },
  { label: 'Ad-free experience', included: false },
  { label: 'Early access to breaking news', included: false },
  { label: 'Custom feed algorithm', included: false },
  { label: 'Unlimited saved stories', included: false },
  { label: 'Priority regional trends', included: false },
  { label: 'API access', included: false },
];

const PREMIUM_FEATURES = [
  { label: 'Unlimited trend cards', included: true },
  { label: 'All 6 content categories', included: true },
  { label: 'Advanced search & filters', included: true },
  { label: 'Completely ad-free', included: true },
  { label: 'Breaking news — 30 min ahead', included: true },
  { label: 'AI-personalized feed', included: true },
  { label: 'Unlimited saved stories', included: true },
  { label: 'All global regions', included: true },
  { label: 'Developer API access', included: true },
];

export default function SubscriptionScreen() {
  const { state } = useApp();
  const { isPremium, purchaseMonthly, purchasing, purchaseError } = usePurchase();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { maxWidth: 560, alignSelf: 'center', width: '100%' }]}>
        {isPremium ? (
          <LinearGradient colors={['#0A1F0F', '#051008']} style={styles.premiumActive}>
            <Ionicons name="star" size={32} color={theme.colors.accent} />
            <Text style={styles.premiumActiveTitle}>You're on Premium</Text>
            <Text style={styles.premiumActiveSubtitle}>
              Thanks for supporting Whyrl. You have access to all features.
            </Text>
          </LinearGradient>
        ) : (
          <View style={styles.heroSection}>
            <Text style={styles.heroEyebrow}>UPGRADE YOUR FEED</Text>
            <Text style={styles.heroTitle}>The premium news experience you deserve</Text>
            <Text style={styles.heroSubtitle}>
              Go ad-free, unlock AI personalization, and get breaking news 30 minutes before everyone else.
            </Text>
          </View>
        )}

        <View style={styles.plansRow}>
          {/* Free Plan */}
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planName}>Free</Text>
              <View style={styles.planPrice}>
                <Text style={styles.planPriceAmount}>$0</Text>
                <Text style={styles.planPricePeriod}>/mo</Text>
              </View>
            </View>
            <View style={styles.featuresList}>
              {FREE_FEATURES.map((f) => (
                <FeatureRow key={f.label} {...f} />
              ))}
            </View>
            {!isPremium && (
              <View style={styles.currentPlanBadge}>
                <Text style={styles.currentPlanText}>Current Plan</Text>
              </View>
            )}
          </View>

          {/* Premium Plan */}
          <View style={[styles.planCard, styles.premiumCard]}>
            <LinearGradient colors={['#0A2A14', '#061508']} style={styles.premiumCardGrad}>
              <View style={styles.premiumBadge}>
                <Ionicons name="flash" size={11} color="#000" />
                <Text style={styles.premiumBadgeText}>BEST VALUE</Text>
              </View>
              <View style={styles.planHeader}>
                <Text style={[styles.planName, { color: theme.colors.accent }]}>Premium</Text>
                <View style={styles.planPrice}>
                  <Text style={[styles.planPriceAmount, { color: theme.colors.accent }]}>$4.99</Text>
                  <Text style={[styles.planPricePeriod, { color: theme.colors.textSecondary }]}>/mo</Text>
                </View>
              </View>
              <View style={styles.featuresList}>
                {PREMIUM_FEATURES.map((f) => (
                  <FeatureRow key={f.label} {...f} isGreen />
                ))}
              </View>
            </LinearGradient>
          </View>
        </View>

        {!isPremium && (
          <>
            {purchaseError ? (
              <Text style={styles.errorText}>{purchaseError}</Text>
            ) : null}
            <TouchableOpacity
              style={[styles.upgradeBtn, purchasing && { opacity: 0.6 }]}
              onPress={purchaseMonthly}
              disabled={purchasing}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[theme.colors.accent, theme.colors.accentDark]}
                style={styles.upgradeBtnGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {purchasing ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <>
                    <Ionicons name="flash" size={18} color="#000" />
                    <Text style={styles.upgradeBtnText}>Upgrade to Premium — $4.99/mo</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.legalText}>
          Cancel anytime. No hidden fees. Secure payment via Stripe.
          By upgrading you agree to our Terms of Service and Privacy Policy.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureRow({ label, included, isGreen }: { label: string; included: boolean; isGreen?: boolean }) {
  return (
    <View style={styles.featureRow}>
      <View style={[styles.featureIcon, included && (isGreen ? styles.featureIconGreen : styles.featureIconMuted)]}>
        <Ionicons
          name={included ? 'checkmark' : 'close'}
          size={11}
          color={included ? (isGreen ? '#000' : theme.colors.accent) : theme.colors.textMuted}
        />
      </View>
      <Text style={[styles.featureLabel, !included && { color: theme.colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: theme.colors.textPrimary, fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
  content: { padding: 16, paddingBottom: 48 },

  premiumActive: {
    alignItems: 'center',
    gap: 10,
    padding: 32,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    marginBottom: 24,
  },
  premiumActiveTitle: { color: theme.colors.accent, fontSize: 22, fontWeight: '800' },
  premiumActiveSubtitle: { color: theme.colors.textSecondary, fontSize: 14, textAlign: 'center' },

  heroSection: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 8, gap: 8 },
  heroEyebrow: { color: theme.colors.accent, fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  heroTitle: { color: theme.colors.textPrimary, fontSize: 24, fontWeight: '800', textAlign: 'center', lineHeight: 32 },
  heroSubtitle: { color: theme.colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 },

  plansRow: { gap: 12, marginBottom: 20 },
  planCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    overflow: 'hidden',
  },
  premiumCard: { borderColor: theme.colors.accent },
  premiumCardGrad: { padding: 20 },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.accent,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 12,
  },
  premiumBadgeText: { color: '#000', fontSize: 9, fontWeight: '900', letterSpacing: 1 },

  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', padding: 20, paddingBottom: 16 },
  planName: { color: theme.colors.textPrimary, fontSize: 20, fontWeight: '800' },
  planPrice: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  planPriceAmount: { color: theme.colors.textPrimary, fontSize: 28, fontWeight: '900' },
  planPricePeriod: { color: theme.colors.textMuted, fontSize: 13, paddingBottom: 3 },

  featuresList: { gap: 0, paddingBottom: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingVertical: 8 },
  featureIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceBorder,
  },
  featureIconGreen: { backgroundColor: theme.colors.accent },
  featureIconMuted: { backgroundColor: theme.colors.accentDim },
  featureLabel: { color: theme.colors.textPrimary, fontSize: 13, flex: 1 },

  currentPlanBadge: {
    margin: 16,
    marginTop: 4,
    paddingVertical: 10,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    alignItems: 'center',
  },
  currentPlanText: { color: theme.colors.textMuted, fontSize: 13, fontWeight: '600' },

  upgradeBtn: { borderRadius: theme.radius.full, overflow: 'hidden', marginBottom: 16 },
  upgradeBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  upgradeBtnText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 0.2 },

  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
  legalText: {
    color: theme.colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 8,
  },
});
