import { reducer, initialState, AppState } from '../store/AppContext';

describe('AppContext reducer', () => {
  describe('TOGGLE_SAVE', () => {
    it('adds an id when not already saved', () => {
      const next = reducer(initialState, { type: 'TOGGLE_SAVE', id: 'card-1' });
      expect(next.savedCardIds).toContain('card-1');
    });

    it('removes an id when already saved', () => {
      const withSaved: AppState = { ...initialState, savedCardIds: ['card-1', 'card-2'] };
      const next = reducer(withSaved, { type: 'TOGGLE_SAVE', id: 'card-1' });
      expect(next.savedCardIds).not.toContain('card-1');
      expect(next.savedCardIds).toContain('card-2');
    });

    it('does not mutate other state fields', () => {
      const next = reducer(initialState, { type: 'TOGGLE_SAVE', id: 'card-1' });
      expect(next.selectedCategory).toBe(initialState.selectedCategory);
      expect(next.searchQuery).toBe(initialState.searchQuery);
      expect(next.region).toBe(initialState.region);
    });
  });

  describe('SET_CATEGORY', () => {
    it('sets selectedCategory', () => {
      const next = reducer(initialState, { type: 'SET_CATEGORY', category: 'tech' });
      expect(next.selectedCategory).toBe('tech');
    });

    it('sets category to "all"', () => {
      const withCat: AppState = { ...initialState, selectedCategory: 'sport' };
      const next = reducer(withCat, { type: 'SET_CATEGORY', category: 'all' });
      expect(next.selectedCategory).toBe('all');
    });
  });

  describe('SET_SEARCH', () => {
    it('sets searchQuery', () => {
      const next = reducer(initialState, { type: 'SET_SEARCH', query: 'bitcoin' });
      expect(next.searchQuery).toBe('bitcoin');
    });

    it('clears searchQuery', () => {
      const withQuery: AppState = { ...initialState, searchQuery: 'bitcoin' };
      const next = reducer(withQuery, { type: 'SET_SEARCH', query: '' });
      expect(next.searchQuery).toBe('');
    });
  });

  describe('SET_REGION', () => {
    it('sets region', () => {
      const next = reducer(initialState, { type: 'SET_REGION', region: 'GB' });
      expect(next.region).toBe('GB');
    });
  });

  describe('SET_PREFERRED_CATEGORIES', () => {
    it('replaces preferredCategories array', () => {
      const next = reducer(initialState, {
        type: 'SET_PREFERRED_CATEGORIES',
        categories: ['tech', 'finance'],
      });
      expect(next.preferredCategories).toEqual(['tech', 'finance']);
    });
  });

  describe('LOAD_SAVED', () => {
    it('replaces savedCardIds', () => {
      const withSaved: AppState = { ...initialState, savedCardIds: ['old-1'] };
      const next = reducer(withSaved, { type: 'LOAD_SAVED', ids: ['new-1', 'new-2'] });
      expect(next.savedCardIds).toEqual(['new-1', 'new-2']);
    });

    it('clears savedCardIds with empty array', () => {
      const withSaved: AppState = { ...initialState, savedCardIds: ['card-1'] };
      const next = reducer(withSaved, { type: 'LOAD_SAVED', ids: [] });
      expect(next.savedCardIds).toEqual([]);
    });
  });

  describe('UPGRADE_PLAN', () => {
    it('sets user plan to premium', () => {
      const next = reducer(initialState, { type: 'UPGRADE_PLAN' });
      expect(next.user.plan).toBe('premium');
    });

    it('does not change other user fields', () => {
      const next = reducer(initialState, { type: 'UPGRADE_PLAN' });
      expect(next.user.name).toBe(initialState.user.name);
      expect(next.user.email).toBe(initialState.user.email);
    });
  });

  describe('initialState', () => {
    it('has empty savedCardIds', () => {
      expect(initialState.savedCardIds).toEqual([]);
    });

    it('defaults selectedCategory to "all"', () => {
      expect(initialState.selectedCategory).toBe('all');
    });

    it('defaults region to US', () => {
      expect(initialState.region).toBe('US');
    });

    it('defaults user plan to free', () => {
      expect(initialState.user.plan).toBe('free');
    });
  });
});
