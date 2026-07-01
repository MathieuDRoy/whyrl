import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { TrendCard } from '../constants/mockData';
import { useApp } from '../store/AppContext';

interface Props {
  card: TrendCard | null;
  onClose: () => void;
}

const { height: SCREEN_H } = Dimensions.get('window');

export default function CardDetailModal({ card, onClose }: Props) {
  const { state, toggleSave } = useApp();
  const slideAnim = useRef(new Animated.Value(SCREEN_H)).current;

  useEffect(() => {
    if (card) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(SCREEN_H);
    }
  }, [card]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_H,
      duration: 250,
      useNativeDriver: true,
    }).start(onClose);
  };

  if (!card) return null;

  const saved = state.savedCardIds.includes(card.id);
  const catColor = theme.colors.category[card.category] ?? theme.colors.accent;
  const gradColors = theme.colors.categoryGradient[card.category] ?? ['#111', '#0A0A0A'];

  return (
    <Modal visible={!!card} transparent animationType="none" onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.backdropTouch} onPress={handleClose} activeOpacity={1} />
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <LinearGradient colors={[...gradColors, theme.colors.surface]} style={styles.hero}>
            <View style={styles.heroTop}>
              <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              <View style={styles.heroActions}>
                <TouchableOpacity
                  onPress={() => toggleSave(card)}
                  style={[styles.actionBtn, saved && { backgroundColor: theme.colors.accentDim, borderColor: theme.colors.accent }]}
                >
                  <Ionicons
                    name={saved ? 'bookmark' : 'bookmark-outline'}
                    size={16}
                    color={saved ? theme.colors.accent : theme.colors.textSecondary}
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  <Ionicons name="share-outline" size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.heroBadges}>
              <View style={[styles.categoryBadge, { borderColor: catColor }]}>
                <Text style={[styles.categoryText, { color: catColor }]}>
                  {card.category.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.regionText}>🌐 {card.region}</Text>
            </View>
          </LinearGradient>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>{card.title}</Text>

            <View style={styles.metaRow}>
              <Text style={styles.metaTimestamp}>{formatTimestamp(card.timestamp)}</Text>
              <View style={styles.trendBadge}>
                <Ionicons name="flame" size={13} color={catColor} />
                <Text style={[styles.trendText, { color: catColor }]}>{card.trendingScore}% trending</Text>
              </View>
            </View>

            <View style={styles.trendBar}>
              <View style={[styles.trendBarFill, { width: `${card.trendingScore}%` as any, backgroundColor: catColor }]} />
            </View>

            <View style={styles.divider} />

            <Text style={styles.detailText}>{card.details}</Text>

            {card.hashtags.length > 0 && (
              <View style={styles.hashtagsSection}>
                <Text style={styles.hashtagsLabel}>TRENDING TAGS</Text>
                <View style={styles.hashtagsRow}>
                  {card.hashtags.map((tag) => (
                    <View key={tag} style={[styles.hashtagPill, { borderColor: catColor + '44' }]}>
                      <Text style={[styles.hashtagText, { color: catColor }]}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.engagementRow}>
              <View style={styles.engagementItem}>
                <Ionicons name="people" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.engagementValue}>{formatEngagement(card.engagements)}</Text>
                <Text style={styles.engagementLabel}>Engagements</Text>
              </View>
              <View style={styles.engagementItem}>
                <Ionicons name="repeat" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.engagementValue}>{formatEngagement(Math.floor(card.engagements * 0.3))}</Text>
                <Text style={styles.engagementLabel}>Reshares</Text>
              </View>
              <View style={styles.engagementItem}>
                <Ionicons name="chatbubble" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.engagementValue}>{formatEngagement(Math.floor(card.engagements * 0.12))}</Text>
                <Text style={styles.engagementLabel}>Comments</Text>
              </View>
            </View>

            <View style={styles.aiNote}>
              <Ionicons name="sparkles" size={13} color={theme.colors.accent} />
              <Text style={styles.aiNoteText}>
                AI-summarized from {card.source === 'newsapi' ? 'NewsAPI' : 'Reddit'} · Regional data for {card.region} · Content generated by Claude AI and does not reproduce original articles.
              </Text>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

export function formatTimestamp(ts: string): string {
  if (!ts) return '';
  const d = new Date(ts);
  if (isNaN(d.getTime())) return ts; // already a human string, return as-is
  const diffMs = Date.now() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export function formatEngagement(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: SCREEN_H * 0.92,
    overflow: 'hidden',
    ...(Platform.OS === 'web' && { maxWidth: 680, marginHorizontal: 'auto', width: '100%' } as any),
  },
  hero: {
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: '800', fontFamily: theme.fonts.extraBold,
    letterSpacing: 1.2,
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  sourceText: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '500', fontFamily: theme.fonts.medium,
  },
  regionText: {
    color: theme.colors.textSecondary,
    fontSize: 11,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 48,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 22,
    fontWeight: '800', fontFamily: theme.fonts.extraBold,
    lineHeight: 30,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaTimestamp: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '700', fontFamily: theme.fonts.bold,
  },
  trendBar: {
    height: 3,
    backgroundColor: theme.colors.surfaceBorder,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  trendBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.surfaceBorder,
    marginBottom: 16,
  },
  detailText: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    lineHeight: 24,
    letterSpacing: 0.1,
    marginBottom: 24,
  },
  hashtagsSection: {
    marginBottom: 24,
  },
  hashtagsLabel: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: '700', fontFamily: theme.fonts.bold,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  hashtagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  hashtagPill: {
    borderWidth: 1,
    borderRadius: theme.radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  hashtagText: {
    fontSize: 12,
    fontWeight: '600', fontFamily: theme.fonts.semiBold,
  },
  engagementRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.md,
    padding: 16,
    marginBottom: 16,
    gap: 4,
  },
  engagementItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  engagementValue: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '800', fontFamily: theme.fonts.extraBold,
  },
  engagementLabel: {
    color: theme.colors.textMuted,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  aiNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.accentDim,
    borderRadius: theme.radius.sm,
    padding: 10,
  },
  aiNoteText: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    flex: 1,
  },
});
