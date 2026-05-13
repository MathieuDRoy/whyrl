import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { useApp } from '../store/AppContext';
import { MOCK_CARDS } from '../constants/mockData';
import TrendCardComponent from '../components/TrendCard';
import CardDetailModal from '../components/CardDetailModal';
import { useState, useMemo } from 'react';
import { TrendCard } from '../constants/mockData';

export default function ProfileScreen() {
  const { state } = useApp();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [selectedCard, setSelectedCard] = useState<TrendCard | null>(null);

  const savedCards = useMemo(
    () => MOCK_CARDS.filter((c) => state.savedCardIds.includes(c.id)),
    [state.savedCardIds]
  );

  const numColumns = width >= 768 ? 3 : 2;
  const columns = useMemo(() => {
    const cols: TrendCard[][] = Array.from({ length: numColumns }, () => []);
    savedCards.forEach((card, i) => cols[i % numColumns].push(card));
    return cols;
  }, [savedCards, numColumns]);

  const initials = state.user.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  const stats = [
    { label: 'Saved', value: savedCards.length, icon: 'bookmark' },
    { label: 'Streak', value: '7 days', icon: 'flame' },
    { label: 'Plan', value: state.user.plan === 'premium' ? 'Premium' : 'Free', icon: 'star' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { maxWidth: 900, alignSelf: 'center', width: '100%' }]}>
        <View style={styles.profileCard}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>
          <Text style={styles.userName}>{state.user.name}</Text>
          <Text style={styles.userEmail}>{state.user.email}</Text>

          <View style={styles.statsRow}>
            {stats.map((s) => (
              <View key={s.label} style={styles.statItem}>
                <Ionicons
                  name={s.icon as any}
                  size={18}
                  color={theme.colors.accent}
                  style={{ marginBottom: 4 }}
                />
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Ionicons name="bookmark" size={16} color={theme.colors.accent} />
          <Text style={styles.sectionTitle}>Saved Stories</Text>
          <Text style={styles.sectionCount}>{savedCards.length}</Text>
        </View>

        {savedCards.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bookmark-outline" size={48} color={theme.colors.textMuted} />
            <Text style={styles.emptyTitle}>No saved stories yet</Text>
            <Text style={styles.emptySubtitle}>Tap the bookmark icon on any card to save it here</Text>
            <TouchableOpacity style={styles.browseBtn} onPress={() => router.back()}>
              <Text style={styles.browseBtnText}>Browse Trends</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.grid}>
            {columns.map((col, ci) => (
              <View key={ci} style={styles.column}>
                {col.map((card) => (
                  <TrendCardComponent key={card.id} card={card} onPress={() => setSelectedCard(card)} />
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
    </SafeAreaView>
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
  headerTitle: {
    color: theme.colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  content: { paddingHorizontal: 12, paddingBottom: 40 },
  profileCard: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    marginTop: 16,
    marginBottom: 24,
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  avatarRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: theme.colors.accent,
    padding: 3,
    marginBottom: 12,
  },
  avatar: {
    flex: 1,
    borderRadius: 37,
    backgroundColor: theme.colors.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: theme.colors.accent, fontSize: 26, fontWeight: '800' },
  userName: { color: theme.colors.textPrimary, fontSize: 20, fontWeight: '800', marginBottom: 4 },
  userEmail: { color: theme.colors.textMuted, fontSize: 13, marginBottom: 20 },
  statsRow: {
    flexDirection: 'row',
    gap: 0,
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
    paddingTop: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: theme.colors.surfaceBorder,
  },
  statValue: { color: theme.colors.textPrimary, fontSize: 16, fontWeight: '800', marginBottom: 2 },
  statLabel: { color: theme.colors.textMuted, fontSize: 11, letterSpacing: 0.3 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  sectionTitle: { color: theme.colors.textPrimary, fontSize: 16, fontWeight: '700', flex: 1 },
  sectionCount: {
    color: theme.colors.accent,
    fontSize: 13,
    fontWeight: '700',
    backgroundColor: theme.colors.accentDim,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
  },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyTitle: { color: theme.colors.textSecondary, fontSize: 17, fontWeight: '700' },
  emptySubtitle: { color: theme.colors.textMuted, fontSize: 13, textAlign: 'center', maxWidth: 260 },
  browseBtn: {
    marginTop: 8,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: theme.radius.full,
  },
  browseBtnText: { color: '#000', fontSize: 14, fontWeight: '800' },
  grid: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  column: { flex: 1 },
});
