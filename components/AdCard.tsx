import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { usePurchase } from '../store/PurchaseContext';
import { theme } from '../constants/theme';

const AD_UNIT_ID = __DEV__
  ? TestIds.BANNER
  : Platform.select({
      ios: 'ca-app-pub-6466070389120969/3847169250',
      android: 'ca-app-pub-6466070389120969/5611146836',
    })!;

interface Props {
  slotIndex: number;
}

export default function AdCard({ slotIndex }: Props) {
  const { isPremium } = usePurchase();
  const [failed, setFailed] = useState(false);

  if (isPremium || Platform.OS === 'web' || failed) return null;

  return (
    <View style={styles.card}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>SPONSORED</Text>
      </View>
      <BannerAd
        key={slotIndex}
        unitId={AD_UNIT_ID}
        size={BannerAdSize.MEDIUM_RECTANGLE}
        onAdLoaded={() => console.log(`[AdCard ${slotIndex}] ad loaded`)}
        onAdFailedToLoad={(error) => {
          console.log(`[AdCard ${slotIndex}] failed to load:`, error);
          setFailed(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    overflow: 'hidden',
    marginBottom: 10,
    alignItems: 'center',
  },
  badge: {
    alignSelf: 'flex-end',
    margin: 8,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  badgeText: {
    color: theme.colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
