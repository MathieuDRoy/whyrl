import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { useApp } from '../store/AppContext';
import { useAuth } from '../store/AuthContext';
import { getSavedTrends } from '../services/trendsStorage';
import { recordVisit, StreakData } from '../services/streakStorage';
import TrendCardComponent from '../components/TrendCard';
import CardDetailModal from '../components/CardDetailModal';
import { TrendCard } from '../constants/mockData';

export default function ProfileScreen() {
  const { state } = useApp();
  const { session, profile, updateName } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [selectedCard, setSelectedCard] = useState<TrendCard | null>(null);
  const [savedCards, setSavedCards] = useState<TrendCard[]>([]);
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, lastActiveDate: '' });

  // Name editing state
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    const userId = session?.user.id;
    if (!userId) {
      setSavedCards([]);
      return;
    }
    getSavedTrends(userId).then(setSavedCards);
    recordVisit(userId).then(setStreak);
  }, [session?.user.id, state.savedCardIds]);

  const displayName = profile?.name ?? '';
  const displayEmail = session?.user.email ?? '';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .toUpperCase() || '?';

  function startEditing() {
    setNameInput(displayName);
    setNameError(null);
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setNameError(null);
  }

  async function saveName() {
    if (!nameInput.trim()) {
      setNameError('Name cannot be empty.');
      return;
    }
    setNameSaving(true);
    setNameError(null);
    const err = await updateName(nameInput.trim());
    setNameSaving(false);
    if (err) {
      setNameError(err);
    } else {
      setEditing(false);
    }
  }

  const numColumns = width >= 768 ? 3 : 2;
  const columns = useMemo(() => {
    const cols: TrendCard[][] = Array.from({ length: numColumns }, () => []);
    savedCards.forEach((card, i) => cols[i % numColumns].push(card));
    return cols;
  }, [savedCards, numColumns]);

  const stats = [
    { label: 'Saved', value: savedCards.length, icon: 'bookmark' },
    { label: 'Streak', value: streak.currentStreak === 1 ? '1 day' : streak.currentStreak + ' days', icon: 'flame' },
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

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { maxWidth: 900, alignSelf: 'center', width: '100%' },
        ]}
      >
        {!session ? (
          <View style={styles.guestPrompt}>
            <Ionicons name="person-circle-outline" size={56} color={theme.colors.textMuted} />
            <Text style={styles.guestTitle}>Sign in to access your profile</Text>
            <Text style={styles.guestSubtitle}>
              Sign in to save stories and track your reading streak
            </Text>
            <TouchableOpacity style={styles.guestSignInBtn} onPress={() => router.push('/auth')}>
              <Text style={styles.guestSignInText}>Sign In / Create Account</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.profileCard}>
              <View style={styles.avatarRing}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
              </View>

              {editing ? (
                <View style={styles.editRow}>
                  <TextInput
                    style={styles.nameInput}
                    value={nameInput}
                    onChangeText={setNameInput}
                    autoCapitalize="words"
                    autoCorrect={false}
                    autoFocus
                    placeholderTextColor={theme.colors.textMuted}
                    placeholder="Your name"
                  />
                  <View style={styles.editActions}>
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={cancelEditing}
                      disabled={nameSaving}
                    >
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.saveBtn, nameSaving && styles.saveBtnDisabled]}
                      onPress={saveName}
                      disabled={nameSaving}
                    >
                      {nameSaving ? (
                        <ActivityIndicator size="small" color={theme.colors.bg} />
                      ) : (
                        <Text style={styles.saveBtnText}>Save</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                  {nameError && <Text style={styles.nameError}>{nameError}</Text>}
                </View>
              ) : (
                <TouchableOpacity style={styles.nameRow} onPress={startEditing}>
                  <Text style={styles.userName}>{displayName}</Text>
                  <Ionicons name="pencil-outline" size={16} color={theme.colors.textMuted} />
                </TouchableOpacity>
              )}

              <Text style={styles.userEmail}>{displayEmail}</Text>

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
                <Text style={styles.emptySubtitle}>
                  Tap the bookmark icon on any card to save it here
                </Text>
                <TouchableOpacity style={styles.browseBtn} onPress={() => router.back()}>
                  <Text style={styles.browseBtnText}>Browse Trends</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.grid}>
                {columns.map((col, ci) => (
                  <View key={ci} style={styles.column}>
                    {col.map((card) => (
                      <TrendCardComponent
                        key={card.id}
                        card={card}
                        onPress={() => setSelectedCard(card)}
                      />
                    ))}
                  </View>
                ))}
              </View>
            )}
          </>
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  userName: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  userEmail: { color: theme.colors.textMuted, fontSize: 13, marginBottom: 20 },
  editRow: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  nameInput: {
    width: '100%',
    backgroundColor: theme.colors.bg,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.bg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  cancelBtnText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.accent,
    minWidth: 64,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: {
    color: theme.colors.bg,
    fontSize: 13,
    fontWeight: '700',
  },
  nameError: {
    color: '#FF6B6B',
    fontSize: 12,
    textAlign: 'center',
  },
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
  emptySubtitle: {
    color: theme.colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 260,
  },
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
  guestPrompt: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  guestTitle: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  guestSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 260,
  },
  guestSignInBtn: {
    marginTop: 8,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: theme.radius.full,
  },
  guestSignInText: { color: '#000', fontSize: 14, fontWeight: '800' },
});
