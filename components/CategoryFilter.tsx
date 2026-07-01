import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { theme, CATEGORIES } from '../constants/theme';
import { useApp, FilterCategory } from '../store/AppContext';

export default function CategoryFilter() {
  const { state, dispatch } = useApp();

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {CATEGORIES.map((cat) => {
          const active = state.selectedCategory === cat.key;
          const color =
            cat.key === 'all' ? theme.colors.accent : theme.colors.category[cat.key] ?? theme.colors.accent;
          return (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.pill,
                active && { backgroundColor: theme.colors.accentDim, borderColor: color },
              ]}
              onPress={() => dispatch({ type: 'SET_CATEGORY', category: cat.key as FilterCategory })}
              activeOpacity={0.75}
            >
              <Text style={styles.emoji}>{cat.emoji}</Text>
              <Text style={[styles.label, active && { color }]}>{cat.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
  },
  container: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
    flexDirection: 'row',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    backgroundColor: theme.colors.surface,
  },
  emoji: {
    fontSize: 13,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600', fontFamily: theme.fonts.semiBold,
    letterSpacing: 0.2,
  },
});
