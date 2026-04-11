// lib/fmt.ts
export const fmt = (n: number, dec = 0) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });

export const pct = (n: number) => (n * 100).toFixed(1) + '%';
