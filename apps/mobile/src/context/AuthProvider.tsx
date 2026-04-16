import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Linking } from 'react-native';
import type { Session, User } from '@supabase/supabase-js';
import { hasSupabaseEnv } from '../config/env';
import { supabase } from '../lib/supabase';
import {
  createSessionFromUrl,
  signInWithOtp as authSignInWithOtp,
  signOut as authSignOut,
} from '../services/auth';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  lastAuthCallbackError: string | null;
  clearAuthCallbackError: () => void;
  signInWithOtp: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue | null {
  return useContext(AuthContext);
}

function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'Unknown error completing sign-in.';
}

export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastAuthCallbackError, setLastAuthCallbackError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasSupabaseEnv() || !supabase) {
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      if (nextSession) setLastAuthCallbackError(null);
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    const handleCallbackUrl = async (url: string | null): Promise<void> => {
      if (!url) return;
      try {
        await createSessionFromUrl(url);
      } catch (err) {
        setLastAuthCallbackError(extractErrorMessage(err));
      }
    };

    Linking.getInitialURL().then((url) => {
      void handleCallbackUrl(url);
    });
    const urlSub = Linking.addEventListener('url', (event) => {
      void handleCallbackUrl(event?.url ?? null);
    });

    return () => {
      subscription.unsubscribe();
      urlSub.remove();
    };
  }, []);

  const signInWithOtp = useCallback(async (email: string) => {
    setLastAuthCallbackError(null);
    return authSignInWithOtp(email);
  }, []);

  const signOut = useCallback(async () => {
    setLastAuthCallbackError(null);
    await authSignOut();
  }, []);

  const clearAuthCallbackError = useCallback(() => {
    setLastAuthCallbackError(null);
  }, []);

  const value: AuthContextValue = {
    session,
    user,
    loading,
    lastAuthCallbackError,
    clearAuthCallbackError,
    signInWithOtp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
