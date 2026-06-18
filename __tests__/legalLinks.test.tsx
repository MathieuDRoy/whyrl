/**
 * Tests for legal link requirements in subscription flow (Apple Guideline 3.1.2(c)).
 * Verifies that functional Privacy Policy and Terms of Use links are present
 * in both the Paywall modal and the Subscription screen.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockPush = jest.fn();
const mockHidePaywall = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn() }),
}));

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return { LinearGradient: (props: any) => <View {...props} /> };
});

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: (props: any) => <View {...props} />,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

jest.mock('../store/PurchaseContext', () => ({
  usePurchase: () => ({
    paywallVisible: true,
    hidePaywall: mockHidePaywall,
    purchaseMonthly: jest.fn(),
    restorePurchases: jest.fn(),
    purchasing: false,
    purchaseError: null,
  }),
}));

jest.mock('../store/AppContext', () => ({
  useApp: () => ({
    state: {
      user: { name: 'Test User', email: 'test@example.com', plan: 'free', avatar: 'TU' },
      savedCardIds: [],
      selectedCategory: 'all',
      searchQuery: '',
      region: 'US',
      preferredCategories: [],
    },
    dispatch: jest.fn(),
  }),
}));

// ─── Tests ───────────────────────────────────────────────────────────────────

import Paywall from '../components/Paywall';
import SubscriptionScreen from '../app/subscription';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Paywall legal links (Apple 3.1.2(c))', () => {
  it('renders a "Terms of Use" link', () => {
    const { getByText } = render(<Paywall />);
    expect(getByText('Terms of Use')).toBeTruthy();
  });

  it('renders a "Privacy Policy" link', () => {
    const { getByText } = render(<Paywall />);
    expect(getByText('Privacy Policy')).toBeTruthy();
  });

  it('navigates to /terms when "Terms of Use" is tapped', () => {
    const { getByText } = render(<Paywall />);
    fireEvent.press(getByText('Terms of Use'));
    expect(mockHidePaywall).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/terms');
  });

  it('navigates to /privacy when "Privacy Policy" is tapped', () => {
    const { getByText } = render(<Paywall />);
    fireEvent.press(getByText('Privacy Policy'));
    expect(mockHidePaywall).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/privacy');
  });
});

describe('Subscription screen legal links (Apple 3.1.2(c))', () => {
  it('renders a "Terms of Service" link', () => {
    const { getByText } = render(<SubscriptionScreen />);
    expect(getByText('Terms of Service')).toBeTruthy();
  });

  it('renders a "Privacy Policy" link', () => {
    const { getByText } = render(<SubscriptionScreen />);
    expect(getByText('Privacy Policy')).toBeTruthy();
  });

  it('navigates to /terms when "Terms of Service" is tapped', () => {
    const { getByText } = render(<SubscriptionScreen />);
    fireEvent.press(getByText('Terms of Service'));
    expect(mockPush).toHaveBeenCalledWith('/terms');
  });

  it('navigates to /privacy when "Privacy Policy" is tapped', () => {
    const { getByText } = render(<SubscriptionScreen />);
    fireEvent.press(getByText('Privacy Policy'));
    expect(mockPush).toHaveBeenCalledWith('/privacy');
  });
});
