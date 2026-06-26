import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme, REGIONS } from '../constants/theme';
import { useApp } from '../store/AppContext';
import { useAuth } from '../store/AuthContext';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const { width: SCREEN_W } = Dimensions.get('window');
const DRAWER_W = Math.min(SCREEN_W * 0.82, 320);

export default function HamburgerMenu({ visible, onClose }: Props) {
  const { state, dispatch } = useApp();
  const { session, profile, signOut } = useAuth();
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(DRAWER_W)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : DRAWER_W,
      tension: 70,
      friction: 12,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const navigate = (path: string) => {
    onClose();
    setTimeout(() => router.push(path as any), 200);
  };

  const displayName = profile?.name ?? '';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .toUpperCase() || '?';

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Profile section */}
            <View style={styles.profileSection}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{session ? initials : 'G'}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{session ? displayName : 'Guest'}</Text>
                <Text style={styles.profileEmail}>{session?.user.email ?? 'Not signed in'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Nav items */}
            <MenuItem
              icon="person-outline"
              label="Profile & Saved"
              onPress={() => navigate('/profile')}
            />
            <MenuItem
              icon="settings-outline"
              label="Preferences"
              onPress={() => navigate('/settings')}
            />
            <View style={styles.divider} />

            {/* Region picker */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>REGION</Text>
            </View>
            <View style={styles.regionGrid}>
              {REGIONS.slice(0, 6).map((r) => (
                <TouchableOpacity
                  key={r.key}
                  style={[styles.regionChip, state.region === r.key && styles.regionChipActive]}
                  onPress={() => dispatch({ type: 'SET_REGION', region: r.key })}
                >
                  <Text style={[styles.regionChipText, state.region === r.key && { color: theme.colors.accent }]}>
                    {r.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.divider} />

            <View style={styles.footer}>
              {session ? (
                <TouchableOpacity style={styles.signOutBtn} onPress={() => { onClose(); signOut(); }}>
                  <Ionicons name="log-out-outline" size={16} color={theme.colors.textMuted} />
                  <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.signOutBtn} onPress={() => navigate('/auth')}>
                  <Ionicons name="log-in-outline" size={16} color={theme.colors.textMuted} />
                  <Text style={styles.signOutText}>Sign In / Create Account</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.versionText}>Whyrl v1.0.0</Text>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  highlight,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  highlight?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.menuIcon, highlight && { backgroundColor: theme.colors.accentDim }]}>
        <Ionicons name={icon} size={18} color={highlight ? theme.colors.accent : theme.colors.textSecondary} />
      </View>
      <Text style={[styles.menuLabel, highlight && { color: theme.colors.accent }]}>{label}</Text>
      {highlight && (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>UPGRADE</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={14} color={theme.colors.textMuted} style={{ marginLeft: 'auto' }} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  drawer: {
    width: DRAWER_W,
    backgroundColor: theme.colors.surface,
    borderLeftWidth: 1,
    borderLeftColor: theme.colors.surfaceBorder,
    paddingTop: Platform.OS === 'ios' ? 56 : 24,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.accentDim,
    borderWidth: 2,
    borderColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.colors.accent,
    fontSize: 18,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  profileEmail: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  planText: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.surfaceBorder,
    marginVertical: 8,
    marginHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
  newBadge: {
    backgroundColor: theme.colors.accentDim,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginLeft: 6,
  },
  newBadgeText: {
    color: theme.colors.accent,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 6,
  },
  sectionLabel: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  regionGrid: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 6,
  },
  regionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  regionChipActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentDim,
  },
  regionChipText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    marginVertical: 12,
    padding: 14,
    backgroundColor: theme.colors.accentDim,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    borderRadius: theme.radius.md,
  },
  upgradeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeTitle: {
    color: theme.colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  upgradeSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 48,
    gap: 16,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  signOutText: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  versionText: {
    color: theme.colors.textMuted,
    fontSize: 11,
  },
});
