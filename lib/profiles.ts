// lib/profiles.ts
import type { CalcInputs, LocalProfile } from '@/types';

export const PROFILES_KEY = 'hauler_profiles';
export const ACTIVE_KEY   = 'hauler_active_profile';
export const MAX_PROFILES = 5;

function read(): LocalProfile[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(PROFILES_KEY) ?? '[]'); } catch { return []; }
}
function write(ps: LocalProfile[]) {
  try { localStorage.setItem(PROFILES_KEY, JSON.stringify(ps)); } catch { /* quota/private browsing */ }
}

export const getProfiles = (): LocalProfile[] => read();

export function saveProfile(name: string, state: CalcInputs): LocalProfile[] | false {
  const ps = read();
  if (ps.length >= MAX_PROFILES) return false;
  const updated = [...ps, { id: `profile_${Date.now()}`, name, createdAt: new Date().toISOString(), state }];
  write(updated);
  return updated;
}

export function deleteProfile(id: string): LocalProfile[] {
  const updated = read().filter(p => p.id !== id);
  write(updated);
  if (typeof window !== 'undefined') {
    try { if (localStorage.getItem(ACTIVE_KEY) === id) localStorage.removeItem(ACTIVE_KEY); } catch { /* ignore */ }
  }
  return updated;
}

export function renameProfile(id: string, name: string): LocalProfile[] {
  const updated = read().map(p => p.id === id ? { ...p, name } : p);
  write(updated);
  return updated;
}

export function getActiveProfileId(): string | null {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem(ACTIVE_KEY); } catch { return null; }
}

export function setActiveProfileId(id: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (id) localStorage.setItem(ACTIVE_KEY, id);
    else localStorage.removeItem(ACTIVE_KEY);
  } catch { /* ignore */ }
}
