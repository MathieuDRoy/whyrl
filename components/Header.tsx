import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

interface HeaderProps {
  onMenuPress: () => void;
}

export default function Header({ onMenuPress }: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.logoRow}>
        <View style={styles.logoMark}>
          <Text style={styles.logoMarkText}>W</Text>
        </View>
        <Text style={styles.wordmark}>WHYRL</Text>
        <View style={styles.tagPill}>
          <Text style={styles.tagText}>LIVE</Text>
        </View>
      </View>

      <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn} activeOpacity={0.7}>
        <Ionicons name="menu" size={24} color={theme.colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
    backgroundColor: theme.colors.bg,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoMark: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMarkText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '900', fontFamily: theme.fonts.extraBold,
    letterSpacing: -0.5,
  },
  wordmark: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: '900', fontFamily: theme.fonts.extraBold,
    letterSpacing: 3,
  },
  tagPill: {
    backgroundColor: theme.colors.accentDim,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  tagText: {
    color: theme.colors.accent,
    fontSize: 9,
    fontWeight: '800', fontFamily: theme.fonts.extraBold,
    letterSpacing: 1,
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
