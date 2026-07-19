// Freemium model — the single source of truth for what's free vs Pro.
// Matches the approved 2026-04 spec: the core calculator is the free hook;
// the money-decision power tools are Pro.

export type Plan = 'free' | 'pro';

// Priced for impulse purchase by owner-operators — less than a tank of DEF.
export const PRICING = {
  monthly: { amount: 9, label: '$9', per: '/mo', priceEnv: 'NEXT_PUBLIC_STRIPE_PRICE_MONTHLY' },
  annual: { amount: 59, label: '$59', per: '/yr', priceEnv: 'NEXT_PUBLIC_STRIPE_PRICE_ANNUAL', monthlyEquivalent: 4.92, savingsPct: 45 },
} as const;

// Calculator tabs and whether each requires Pro.
export const TAB_PRO: Record<string, boolean> = {
  calc: false,
  cashflow: true,
  w2v1099: true,
  fleet: true,
  truck: true,
};

export const LIMITS = {
  free: { savedProfiles: 1, pdfExport: false, rateCard: false, shareLink: true },
  pro: { savedProfiles: 10, pdfExport: true, rateCard: true, shareLink: true },
} as const;

export function limitsFor(plan: Plan) {
  return LIMITS[plan];
}

// The marketing feature list, split by tier (used by the pricing page + upgrade modal).
export const FREE_FEATURES = [
  'Cost-per-stop calculator',
  'Break-even + true-profit math',
  'Live cost breakdown chart',
  '1 saved profile',
  'Shareable link',
];

export const PRO_FEATURES = [
  'Cash-flow timeline (13-week runway)',
  'W-2 vs 1099 crew analyzer',
  'Fleet planner — scale to N trucks',
  'Truck acquisition: rent / lease / buy / IC',
  'Up to 10 saved profiles',
  'PDF export + rate-card generator',
];
