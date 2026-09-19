import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import BrandMark from './BrandMark';

interface HeaderProps {
  onMenuPress: () => void;
}

export default function Header({ onMenuPress }: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.logoRow}>
        <BrandMark size={32} />
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.10)',
    backgroundColor: 'rgba(21, 45, 53, 0.45)',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  wordmark: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontFamily: theme.fonts.display,
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
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
