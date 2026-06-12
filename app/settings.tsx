import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme, CATEGORIES, REGIONS, Category } from '../constants/theme';
import { useApp } from '../store/AppContext';

export default function SettingsScreen() {
  const { state, dispatch } = useApp();
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [breakingAlerts, setBreakingAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const toggleCategory = (cat: Category) => {
    const current = state.preferredCategories;
    if (current.includes(cat)) {
      if (current.length === 1) return;
      dispatch({ type: 'SET_PREFERRED_CATEGORIES', categories: current.filter((c) => c !== cat) });
    } else {
      dispatch({ type: 'SET_PREFERRED_CATEGORIES', categories: [...current, cat] });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preferences</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { maxWidth: 680, alignSelf: 'center', width: '100%' }]}>
        {/* Category Preferences */}
        <SectionLabel icon="layers-outline" title="Content Categories" />
        <View style={styles.card}>
          <Text style={styles.cardHint}>Select categories to show in your feed</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.filter((c) => c.key !== 'all').map((cat) => {
              const active = state.preferredCategories.includes(cat.key as Category);
              const color = theme.colors.category[cat.key] ?? theme.colors.accent;
              return (
                <TouchableOpacity
                  key={cat.key}
                  style={[styles.catToggle, active && { borderColor: color, backgroundColor: theme.colors.categoryBg[cat.key] }]}
                  onPress={() => toggleCategory(cat.key as Category)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.catEmoji}>{cat.emoji}</Text>
                  <Text style={[styles.catLabel, active && { color }]}>{cat.label}</Text>
                  {active && <Ionicons name="checkmark-circle" size={14} color={color} style={{ marginLeft: 'auto' }} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Region */}
        <SectionLabel icon="globe-outline" title="Region" />
        <View style={styles.card}>
          <Text style={styles.cardHint}>Personalize trends to your country</Text>
          {REGIONS.map((r) => (
            <TouchableOpacity
              key={r.key}
              style={styles.regionRow}
              onPress={() => dispatch({ type: 'SET_REGION', region: r.key })}
            >
              <Text style={styles.regionLabel}>{r.label}</Text>
              {state.region === r.key && (
                <Ionicons name="checkmark-circle" size={18} color={theme.colors.accent} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Notifications */}
        <SectionLabel icon="notifications-outline" title="Notifications" />
        <View style={styles.card}>
          <ToggleRow
            label="Push Notifications"
            sublabel="Receive trend alerts on your device"
            value={notifications}
            onChange={setNotifications}
          />
          <View style={styles.toggleDivider} />
          <ToggleRow
            label="Breaking News Alerts"
            sublabel="Instant alerts for major breaking stories"
            value={breakingAlerts}
            onChange={setBreakingAlerts}
            disabled={!notifications}
          />
          <View style={styles.toggleDivider} />
          <ToggleRow
            label="Weekly Digest"
            sublabel="Top trends from the week, every Sunday"
            value={weeklyDigest}
            onChange={setWeeklyDigest}
            disabled={!notifications}
          />
        </View>

        {/* Data */}
        <SectionLabel icon="shield-checkmark-outline" title="Privacy & Data" />
        <View style={styles.card}>
          <TouchableOpacity style={styles.linkRow}>
            <Text style={styles.linkLabel}>Clear Search History</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.toggleDivider} />
          <TouchableOpacity style={styles.linkRow}>
            <Text style={styles.linkLabel}>Download My Data</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.toggleDivider} />
          <TouchableOpacity style={styles.linkRow}>
            <Text style={[styles.linkLabel, { color: '#FF6B6B' }]}>Delete Account</Text>
            <Ionicons name="chevron-forward" size={16} color="#FF6B6B" />
          </TouchableOpacity>
        </View>

        {/* Legal */}
        <SectionLabel icon="document-text-outline" title="Legal" />
        <View style={styles.card}>
          <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/privacy')}>
            <Text style={styles.linkLabel}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.toggleDivider} />
          <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/terms')}>
            <Text style={styles.linkLabel}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.footerNote}>
          Whyrl uses AI to summarize trending content from NewsAPI and Reddit.
          Summaries are AI-generated and do not reproduce original articles.
          Content is region-filtered and updated every 15 minutes.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionLabel({ icon, title }: { icon: any; title: string }) {
  return (
    <View style={styles.sectionLabelRow}>
      <Ionicons name={icon} size={15} color={theme.colors.accent} />
      <Text style={styles.sectionLabelText}>{title.toUpperCase()}</Text>
    </View>
  );
}

function ToggleRow({
  label,
  sublabel,
  value,
  onChange,
  disabled,
}: {
  label: string;
  sublabel: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View style={[styles.toggleRow, disabled && { opacity: 0.4 }]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleSublabel}>{sublabel}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ false: theme.colors.surfaceBorder, true: theme.colors.accentGlow }}
        thumbColor={value ? theme.colors.accent : theme.colors.textMuted}
        ios_backgroundColor={theme.colors.surfaceBorder}
      />
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
  headerTitle: {
    color: theme.colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  content: { padding: 16, paddingBottom: 48 },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  sectionLabelText: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    overflow: 'hidden',
  },
  cardHint: {
    color: theme.colors.textMuted,
    fontSize: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
  },
  categoryGrid: { padding: 12, gap: 8 },
  catToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  catEmoji: { fontSize: 16 },
  catLabel: { color: theme.colors.textSecondary, fontSize: 14, fontWeight: '500', flex: 1 },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
  },
  regionLabel: { color: theme.colors.textPrimary, fontSize: 14 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  toggleDivider: { height: 1, backgroundColor: theme.colors.surfaceBorder, marginHorizontal: 16 },
  toggleLabel: { color: theme.colors.textPrimary, fontSize: 14, fontWeight: '500', marginBottom: 2 },
  toggleSublabel: { color: theme.colors.textMuted, fontSize: 12 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  linkLabel: { color: theme.colors.textPrimary, fontSize: 14 },
  footerNote: {
    color: theme.colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 8,
  },
});
