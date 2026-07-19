import type { CalcInputs } from '@/types';

// Compact, URL-safe encoding of a scenario so a hauler can share a link that
// reopens with their exact numbers. Free feature — a growth loop.
export function encodeInputs(inputs: CalcInputs): string {
  try {
    const json = JSON.stringify(inputs);
    return btoa(encodeURIComponent(json)).replace(/=+$/, '');
  } catch {
    return '';
  }
}

export function decodeInputs(s: string): Partial<CalcInputs> | null {
  try {
    const json = decodeURIComponent(atob(s));
    const parsed = JSON.parse(json);
    return typeof parsed === 'object' && parsed ? parsed : null;
  } catch {
    return null;
  }
}
