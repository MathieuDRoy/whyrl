import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { useApp } from '../store/AppContext';

export default function SearchBar() {
  const { state, dispatch } = useApp();

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <Ionicons name="search" size={16} color={theme.colors.textSecondary} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Search trends, topics, people…"
          placeholderTextColor={theme.colors.textMuted}
          value={state.searchQuery}
          onChangeText={(q) => dispatch({ type: 'SET_SEARCH', query: q })}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {state.searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => dispatch({ type: 'SET_SEARCH', query: '' })}>
            <Ionicons name="close-circle" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: theme.radius.full,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  icon: {
    opacity: 0.7,
  },
  input: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 14,
    padding: 0,
    margin: 0,
  } as any,
});
