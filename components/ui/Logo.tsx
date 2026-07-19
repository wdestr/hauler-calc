import Link from 'next/link';

// Wordmark: a route-node mark (the "stop" the whole tool is about) + set name.
export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="Hauler Calc home">
      <span className="grid place-items-center w-8 h-8 rounded-lg bg-brand-600 text-white shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="9" r="3" />
          <path d="M12 22c4-5 7-8.5 7-12a7 7 0 1 0-14 0c0 3.5 3 7 7 12Z" />
        </svg>
      </span>
      {!compact && (
        <span className="font-display text-[1.35rem] font-semibold tracking-tight text-ink leading-none">
          Hauler<span className="text-brand-600">Calc</span>
        </span>
      )}
    </Link>
  );
}
