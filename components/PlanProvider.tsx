'use client';

// Plan + auth context. Works in three states:
//   1. Supabase configured + signed in  → real plan from profiles.is_pro
//   2. Supabase configured + signed out  → free
//   3. Supabase NOT configured (no keys) → free, with a local "preview Pro"
//      toggle so the paywall UX can be demoed before backend setup.
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabaseBrowser, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Plan } from '@/lib/plan';

interface PlanState {
  plan: Plan;
  user: User | null;
  email: string | null;
  configured: boolean;
  loading: boolean;
  previewPro: boolean;
  setPreviewPro: (v: boolean) => void;
  signInWithEmail: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<PlanState | null>(null);
const PREVIEW_KEY = 'hc.previewPro';

export function PlanProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [dbPro, setDbPro] = useState(false);
  const [loading, setLoading] = useState(configured);
  const [previewPro, setPreviewProState] = useState(false);

  useEffect(() => {
    try {
      setPreviewProState(localStorage.getItem(PREVIEW_KEY) === '1');
    } catch {
      /* storage unavailable */
    }
  }, []);

  const setPreviewPro = useCallback((v: boolean) => {
    setPreviewProState(v);
    try {
      localStorage.setItem(PREVIEW_KEY, v ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, []);

  const loadProfile = useCallback(async (uid: string) => {
    const sb = getSupabaseBrowser();
    if (!sb) return;
    const { data } = await sb.from('profiles').select('is_pro').eq('id', uid).maybeSingle();
    setDbPro(Boolean(data?.is_pro));
  }, []);

  const refresh = useCallback(async () => {
    const sb = getSupabaseBrowser();
    if (!sb) {
      setLoading(false);
      return;
    }
    const { data } = await sb.auth.getUser();
    setUser(data.user ?? null);
    if (data.user) await loadProfile(data.user.id);
    else setDbPro(false);
    setLoading(false);
  }, [loadProfile]);

  useEffect(() => {
    if (!configured) return;
    refresh();
    const sb = getSupabaseBrowser();
    const { data: sub } = sb!.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else setDbPro(false);
    });
    return () => sub.subscription.unsubscribe();
  }, [configured, refresh, loadProfile]);

  const signInWithEmail = useCallback(async (email: string) => {
    const sb = getSupabaseBrowser();
    if (!sb) return { error: 'Sign-in is not configured yet.' };
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    const sb = getSupabaseBrowser();
    if (sb) await sb.auth.signOut();
    setUser(null);
    setDbPro(false);
  }, []);

  const plan: Plan = dbPro || (!configured && previewPro) ? 'pro' : 'free';

  return (
    <Ctx.Provider
      value={{
        plan, user, email: user?.email ?? null, configured, loading,
        previewPro, setPreviewPro, signInWithEmail, signOut, refresh,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function usePlan() {
  const v = useContext(Ctx);
  if (!v) throw new Error('usePlan must be used within PlanProvider');
  return v;
}
