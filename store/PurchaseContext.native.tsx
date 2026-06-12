import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import Purchases from 'react-native-purchases';
import { useAuth } from './AuthContext';

const RC_KEY = 'appl_OnhzZshsMsEVsKvGLiASCsmHKzY';
const ENTITLEMENT = 'premium';

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

  useEffect(() => {
    if (configured.current) return;
    Purchases.configure({ apiKey: RC_KEY });
    configured.current = true;
  }, []);

  useEffect(() => {
    if (session?.user.id) {
      Purchases.logIn(session.user.id)
        .then(({ customerInfo }: any) => {
          setIsPremium(!!customerInfo.entitlements.active[ENTITLEMENT]);
        })
        .catch(() => {});
    } else {
      Purchases.logOut().catch(() => {});
      setIsPremium(false);
    }
  }, [session?.user.id]);

  const purchaseMonthly = useCallback(async () => {
    setPurchaseError(null);
    setPurchasing(true);
    try {
      const offerings = await Purchases.getOfferings();
      const pkg =
        offerings.current?.monthly ??
        offerings.current?.availablePackages?.[0] ??
        null;
      if (!pkg) throw new Error('No package available. Check your RevenueCat dashboard.');
      const { customerInfo } = await Purchases.purchasePackage(pkg);
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
    setPurchaseError(null);
    setPurchasing(true);
    try {
      const customerInfo = await Purchases.restorePurchases();
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
