import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { useAuth } from './AuthContext';

const RC_KEY = 'test_SMSXBNicelTfREXDsknRdRjjHus';
const ENTITLEMENT = 'premium';

// Lazy getter — avoids bundling the native module on web
function getRC() {
  if (Platform.OS === 'web') return null;
  try {
    return require('react-native-purchases').default;
  } catch {
    return null;
  }
}

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
  const { session } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const configured = useRef(false);

  // Configure RevenueCat once on mount
  useEffect(() => {
    const RC = getRC();
    if (!RC || configured.current) return;
    RC.configure({ apiKey: RC_KEY });
    configured.current = true;
  }, []);

  // Identify / de-identify the user with RevenueCat on auth change
  useEffect(() => {
    const RC = getRC();
    if (!RC) return;
    if (session?.user.id) {
      RC.logIn(session.user.id)
        .then(({ customerInfo }: any) => {
          setIsPremium(!!customerInfo.entitlements.active[ENTITLEMENT]);
        })
        .catch(() => {});
    } else {
      RC.logOut().catch(() => {});
      setIsPremium(false);
    }
  }, [session?.user.id]);

  const purchaseMonthly = useCallback(async () => {
    const RC = getRC();
    if (!RC) return;
    setPurchaseError(null);
    setPurchasing(true);
    try {
      const offerings = await RC.getOfferings();
      const pkg =
        offerings.current?.monthly ??
        offerings.current?.availablePackages?.[0] ??
        null;
      if (!pkg) throw new Error('No package available. Check your RevenueCat dashboard.');
      const { customerInfo } = await RC.purchasePackage(pkg);
      setIsPremium(!!customerInfo.entitlements.active[ENTITLEMENT]);
      setPaywallVisible(false);
    } catch (err: any) {
      if (!err.userCancelled) {
        setPurchaseError(err.message ?? 'Purchase failed. Please try again.');
      }
    } finally {
      setPurchasing(false);
    }
  }, []);

  const restorePurchases = useCallback(async () => {
    const RC = getRC();
    if (!RC) return;
    setPurchaseError(null);
    setPurchasing(true);
    try {
      const customerInfo = await RC.restorePurchases();
      const active = !!customerInfo.entitlements.active[ENTITLEMENT];
      setIsPremium(active);
      if (active) {
        setPaywallVisible(false);
      } else {
        setPurchaseError('No active subscription found.');
      }
    } catch (err: any) {
      setPurchaseError(err.message ?? 'Restore failed. Please try again.');
    } finally {
      setPurchasing(false);
    }
  }, []);

  return (
    <PurchaseContext.Provider
      value={{
        isPremium,
        paywallVisible,
        showPaywall: () => { setPaywallVisible(true); setPurchaseError(null); },
        hidePaywall: () => { setPaywallVisible(false); setPurchaseError(null); },
        purchaseMonthly,
        restorePurchases,
        purchasing,
        purchaseError,
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
