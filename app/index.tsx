import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Text,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { TrendCard } from '../constants/mockData';
import { useApp } from '../store/AppContext';
import { useTrends } from '../hooks/useTrends';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import TrendCardComponent from '../components/TrendCard';
import CardDetailModal from '../components/CardDetailModal';
import HamburgerMenu from '../components/HamburgerMenu';

export default function FeedScreen() {
  const { width } = useWindowDimensions();
  const { state } = useApp();
  const [selectedCard, setSelectedCard] = useState<TrendCard | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { cards: liveCards, loading, error, refresh } = useTrends();

  const numColumns = useMemo(() => {
    if (width >= 1200) return 4;
    if (width >= 768) return 3;
    return 2;
  }, [width]);

  const filteredCards = useMemo(() => {
    let cards = liveCards;

    if (state.selectedCategory !== 'all') {
      cards = cards.filter((c) => !c.isAd && c.category === state.selectedCategory);
    }

    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase();
      cards = cards.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.summary.toLowerCase().includes(q) ||
          c.hashtags.some((h) => h.toLowerCase().includes(q))
      );
    }

    return cards;
  }, [liveCards, state.selectedCategory, state.searchQuery]);

  const columns = useMemo(() => {
    const cols: TrendCard[][] = Array.from({ length: numColumns }, () => []);
    filteredCards.forEach((card, i) => {
      cols[i % numColumns].push(card);
    });
    return cols;
  }, [filteredCards, numColumns]);

  const isFiltering = state.searchQuery || state.selectedCategory !== 'all';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header onMenuPress={() => setMenuOpen(true)} />
      <SearchBar />
      <CategoryFilter />

      {loading && (
        <View style={styles.loadingBanner}>
          <ActivityIndicator size="small" color={theme.colors.accent} />
          <Text style={styles.loadingText}>Fetching live trends…</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="wifi-outline" size={14} color={theme.colors.textMuted} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={refresh}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { maxWidth: 1400, alignSelf: 'center', width: '100%' }]}
        showsVerticalScrollIndicator={false}
      >
        {filteredCards.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={theme.colors.textMuted} />
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptySubtitle}>Try a different search or category</Text>
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

        <View style={styles.feedFooter}>
          <View style={styles.feedFooterDivider} />
          <TouchableOpacity style={styles.feedFooterContent} onPress={refresh}>
            <Ionicons name="sparkles" size={13} color={theme.colors.accent} />
            <Text style={styles.feedFooterText}>
              AI-curated trends · Updated every 15 min
            </Text>
          </TouchableOpacity>
          <View style={styles.feedFooterDivider} />
        </View>
      </ScrollView>

      <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      <HamburgerMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 32,
  },
  grid: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  column: {
    flex: 1,
    gap: 0,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyTitle: {
    color: theme.colors.textSecondary,
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  feedFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  feedFooterDivider: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.surfaceBorder,
  },
  feedFooterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  feedFooterText: {
    color: theme.colors.textMuted,
    fontSize: 11,
  },
  loadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
  },
  loadingText: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
  },
  errorText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    flex: 1,
  },
  retryText: {
    color: theme.colors.accent,
    fontSize: 12,
    fontWeight: '700',
  },
});
