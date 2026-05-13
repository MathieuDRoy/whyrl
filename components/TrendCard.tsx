import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { TrendCard as TrendCardType } from '../constants/mockData';
import { useApp } from '../store/AppContext';
import { usePurchase } from '../store/PurchaseContext';

interface Props {
  card: TrendCardType;
  onPress: () => void;
}

export default function TrendCard({ card, onPress }: Props) {
  const { state, toggleSave } = useApp();
  const { showPaywall } = usePurchase();
  const saved = state.savedCardIds.includes(card.id);

  if (card.isAd) {
    return (
      <TouchableOpacity style={[styles.card, styles.adCard]} onPress={onPress} activeOpacity={0.85}>
        <View style={styles.adBadge}>
          <Text style={styles.adBadgeText}>{card.adLabel ?? 'AD'}</Text>
        </View>
        <View style={styles.adGradient}>
          <LinearGradient
            colors={['#1A1500', '#2A2200']}
            style={styles.adGradientInner}
          >
            <Ionicons name="trending-up" size={32} color="#FFD93D" />
          </LinearGradient>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.adTitle} numberOfLines={2}>{card.title}</Text>
          <Text style={styles.summaryText} numberOfLines={2}>{card.summary}</Text>
        </View>
        <View style={styles.adFooter}>
          <View style={styles.adCtaBtn}>
            <Text style={styles.adCtaText}>{card.adCta}</Text>
            <Ionicons name="arrow-forward" size={12} color="#000" />
          </View>
          <TouchableOpacity style={styles.removeAdsBtn} onPress={showPaywall}>
            <Ionicons name="ban-outline" size={11} color={theme.colors.textMuted} />
            <Text style={styles.removeAdsText}>Remove Ads</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  const catColor = theme.colors.category[card.category] ?? theme.colors.accent;
  const gradColors = theme.colors.categoryGradient[card.category] ?? ['#111', '#0A0A0A'];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <LinearGradient colors={gradColors} style={styles.gradientHeader}>
        <View style={styles.gradHeaderTop}>
          <View style={[styles.categoryBadge, { borderColor: catColor }]}>
            <Text style={[styles.categoryText, { color: catColor }]}>
              {card.category.toUpperCase()}
            </Text>
          </View>
          <View style={styles.sourceBadge}>
            <Ionicons
              name={card.source === 'twitter' ? 'logo-twitter' : 'logo-reddit'}
              size={11}
              color={theme.colors.textSecondary}
            />
          </View>
        </View>
        <View style={styles.trendRow}>
          <Ionicons name="flame" size={12} color={catColor} />
          <Text style={[styles.trendScore, { color: catColor }]}>{card.trendingScore}%</Text>
        </View>
      </LinearGradient>

      <View style={styles.cardBody}>
        <Text style={styles.titleText} numberOfLines={3}>{card.title}</Text>
        <Text style={styles.summaryText} numberOfLines={card.tall ? 4 : 3}>{card.summary}</Text>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.timestampText}>{card.timestamp}</Text>
        <View style={styles.footerRight}>
          <Ionicons name="people-outline" size={12} color={theme.colors.textMuted} />
          <Text style={styles.engagementText}>{formatEngagement(card.engagements)}</Text>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              toggleSave(card);
            }}
            style={styles.saveBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={saved ? 'bookmark' : 'bookmark-outline'}
              size={15}
              color={saved ? theme.colors.accent : theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function formatEngagement(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    overflow: 'hidden',
    marginBottom: 10,
  },
  adCard: {
    borderColor: '#3A3000',
    backgroundColor: '#0E0D00',
  },
  gradientHeader: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
    minHeight: 70,
    justifyContent: 'space-between',
  },
  gradHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  sourceBadge: {
    opacity: 0.7,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 8,
  },
  trendScore: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardBody: {
    padding: 12,
    gap: 6,
  },
  titleText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
    letterSpacing: -0.2,
  },
  summaryText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 10,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
  },
  timestampText: {
    color: theme.colors.textMuted,
    fontSize: 11,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  engagementText: {
    color: theme.colors.textMuted,
    fontSize: 11,
  },
  saveBtn: {
    marginLeft: 6,
  },

  // Ad styles
  adBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: '#FFD93D22',
    borderWidth: 1,
    borderColor: '#FFD93D',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  adBadgeText: {
    color: '#FFD93D',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  adGradient: {
    marginBottom: 0,
  },
  adGradientInner: {
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adTitle: {
    color: '#FFD93D',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
    letterSpacing: -0.2,
  },
  adFooter: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  removeAdsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  removeAdsText: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  adCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFD93D',
    borderRadius: theme.radius.full,
    paddingVertical: 8,
  },
  adCtaText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
