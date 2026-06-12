import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { Category } from '../constants/theme';
import { TrendCard } from '../constants/mockData';
import { useAuth } from './AuthContext';
import { getSavedTrendIds, saveTrend, deleteTrend } from '../services/trendsStorage';

export type FilterCategory = Category | 'all';

export interface AppState {
  savedCardIds: string[];
  selectedCategory: FilterCategory;
  searchQuery: string;
  region: string;
  preferredCategories: Category[];
  user: {
    name: string;
    email: string;
    plan: 'free' | 'premium';
    avatar: string;
  };
}

type Action =
  | { type: 'TOGGLE_SAVE'; id: string }
  | { type: 'SET_CATEGORY'; category: FilterCategory }
  | { type: 'SET_SEARCH'; query: string }
  | { type: 'SET_REGION'; region: string }
  | { type: 'SET_PREFERRED_CATEGORIES'; categories: Category[] }
  | { type: 'LOAD_SAVED'; ids: string[] }
  | { type: 'UPGRADE_PLAN' };

export const initialState: AppState = {
  savedCardIds: [],
  selectedCategory: 'all',
  searchQuery: '',
  region: 'US',
  preferredCategories: ['politics', 'finance', 'sport', 'entertainment', 'tech', 'world'],
  user: {
    name: 'Alex Johnson',
    email: 'alex@whyrl.io',
    plan: 'free',
    avatar: 'AJ',
  },
};

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'TOGGLE_SAVE': {
      const ids = state.savedCardIds.includes(action.id)
        ? state.savedCardIds.filter((id) => id !== action.id)
        : [...state.savedCardIds, action.id];
      return { ...state, savedCardIds: ids };
    }
    case 'SET_CATEGORY':
      return { ...state, selectedCategory: action.category };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.query };
    case 'SET_REGION':
      return { ...state, region: action.region };
    case 'SET_PREFERRED_CATEGORIES':
      return { ...state, preferredCategories: action.categories };
    case 'LOAD_SAVED':
      return { ...state, savedCardIds: action.ids };
    case 'UPGRADE_PLAN':
      return { ...state, user: { ...state.user, plan: 'premium' } };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
  toggleSave: (card: TrendCard) => Promise<void>;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { session } = useAuth();
  const userId = session?.user.id;

  // Load saved IDs from Supabase whenever the logged-in user changes
  useEffect(() => {
    if (!userId) {
      dispatch({ type: 'LOAD_SAVED', ids: [] });
      return;
    }
    getSavedTrendIds(userId).then((ids) => {
      dispatch({ type: 'LOAD_SAVED', ids });
    });
  }, [userId]);

  const toggleSave = useCallback(
    async (card: TrendCard) => {
      if (!userId) return;

      const alreadySaved = state.savedCardIds.includes(card.id);

      // Optimistic update
      dispatch({ type: 'TOGGLE_SAVE', id: card.id });

      try {
        if (alreadySaved) {
          await deleteTrend(userId, card.id);
        } else {
          await saveTrend(userId, card);
        }
      } catch (err: any) {
        // Revert on failure
        dispatch({ type: 'TOGGLE_SAVE', id: card.id });
        console.warn('[toggleSave] error, reverting:', err?.message);
      }
    },
    [userId, state.savedCardIds],
  );

  return (
    <AppContext.Provider value={{ state, dispatch, toggleSave }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
