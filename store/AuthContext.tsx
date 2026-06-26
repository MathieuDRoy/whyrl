import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import {
  UserProfile,
  getProfile,
  saveProfile,
  updateProfileName,
} from '../services/profileStorage';

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  profile: UserProfile | null;
  profileLoading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  completeOnboarding: (name: string, country: string) => Promise<string | null>;
  updateName: (name: string) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  async function loadProfile(userId: string) {
    const p = await getProfile(userId);
    setProfile(p);
    setProfileLoading(false);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const sess = data.session;
      setSession(sess);
      setLoading(false);
      if (sess?.user.id) {
        loadProfile(sess.user.id);
      } else {
        setProfileLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setProfileLoading(true);
      if (sess?.user.id) {
        loadProfile(sess.user.id);
      } else {
        setProfile(null);
        setProfileLoading(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string): Promise<string | null> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  }

  async function signUp(email: string, password: string): Promise<string | null> {
    const { error } = await supabase.auth.signUp({ email, password });
    return error?.message ?? null;
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function completeOnboarding(name: string, country: string): Promise<string | null> {
    if (!session?.user.id) return 'Not authenticated';
    const err = await saveProfile(session.user.id, { name, country });
    if (!err) setProfile({ name, country });
    return err;
  }

  async function updateName(name: string): Promise<string | null> {
    if (!session?.user.id) return 'Not authenticated';
    const err = await updateProfileName(session.user.id, name);
    if (!err) setProfile((prev) => (prev ? { ...prev, name } : prev));
    return err;
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        profile,
        profileLoading,
        signIn,
        signUp,
        signOut,
        completeOnboarding,
        updateName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
