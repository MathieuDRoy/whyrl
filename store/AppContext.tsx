import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category } from '../constants/theme';

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

const initialState: AppState = {
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

function reducer(state: AppState, action: Action): AppState {
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
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    AsyncStorage.getItem('whyrl_saved').then((data) => {
      if (data) dispatch({ type: 'LOAD_SAVED', ids: JSON.parse(data) });
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('whyrl_saved', JSON.stringify(state.savedCardIds));
  }, [state.savedCardIds]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
