// Web stub — react-native-purchases is a native-only module.
// Metro uses PurchaseContext.native.tsx on iOS/Android automatically.
import React, { createContext, useContext, useState } from 'react';

interface PurchaseContextValue {
  isPremium: boolean;
  paywallVisible: boolean;
  showPaywall: () => void;
  hidePaywall: () => void;
  purchaseMonthly: () => Promise<void>;
  restorePurchases: () => Promise<void>;
  purchasing: boolean;
  purchaseError: string | null;
}

const PurchaseContext = createContext<PurchaseContextValue | null>(null);

export function PurchaseProvider({ children }: { children: React.ReactNode }) {
  const [paywallVisible, setPaywallVisible] = useState(false);

  return (
    <PurchaseContext.Provider
      value={{
        isPremium: false,
        paywallVisible,
        showPaywall: () => setPaywallVisible(true),
        hidePaywall: () => setPaywallVisible(false),
        purchaseMonthly: async () => {},
        restorePurchases: async () => {},
        purchasing: false,
        purchaseError: null,
      }}
    >
      {children}
    </PurchaseContext.Provider>
  );
}

export function usePurchase() {
  const ctx = useContext(PurchaseContext);
  if (!ctx) throw new Error('usePurchase must be inside PurchaseProvider');
  return ctx;
}
