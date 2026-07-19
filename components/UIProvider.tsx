'use client';

// Renders the app-wide modals once and lets any component open them.
import { createContext, useCallback, useContext, useState, ReactNode } from 'react';
import AuthModal from './AuthModal';
import UpgradeModal from './UpgradeModal';

interface UIState {
  openAuth: () => void;
  openUpgrade: (feature?: string) => void;
}

const Ctx = createContext<UIState | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState(false);
  const [upgrade, setUpgrade] = useState<{ open: boolean; feature?: string }>({ open: false });

  const openAuth = useCallback(() => setAuth(true), []);
  const openUpgrade = useCallback((feature?: string) => setUpgrade({ open: true, feature }), []);

  return (
    <Ctx.Provider value={{ openAuth, openUpgrade }}>
      {children}
      <AuthModal open={auth} onClose={() => setAuth(false)} />
      <UpgradeModal open={upgrade.open} onClose={() => setUpgrade({ open: false })} feature={upgrade.feature} />
    </Ctx.Provider>
  );
}

export function useUI() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useUI must be used within UIProvider');
  return v;
}
