import Link from 'next/link';
import Logo from '../ui/Logo';

export default function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface no-print mt-auto">
      <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col sm:flex-row gap-6 sm:items-center sm:justify-between">
        <div className="space-y-2 max-w-sm">
          <Logo />
          <p className="text-sm text-muted leading-relaxed">
            Know your true cost per stop. Built for last-mile heavy &amp; bulky haulers who run on real margins, not guesses.
          </p>
        </div>
        <div className="flex gap-10 text-sm">
          <div className="space-y-2">
            <div className="text-faint text-xs font-semibold uppercase tracking-wider">Tool</div>
            <Link href="/calculator" className="block text-ink-soft hover:text-brand-700">Calculator</Link>
            <Link href="/pricing" className="block text-ink-soft hover:text-brand-700">Pricing</Link>
          </div>
          <div className="space-y-2">
            <div className="text-faint text-xs font-semibold uppercase tracking-wider">Legal</div>
            <Link href="/terms" className="block text-ink-soft hover:text-brand-700">Terms</Link>
            <Link href="/privacy" className="block text-ink-soft hover:text-brand-700">Privacy</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="max-w-6xl mx-auto px-5 py-4 text-xs text-faint">
          © {new Date().getFullYear()} Hauler Calc. Estimates for planning only — not tax or financial advice.
        </div>
      </div>
    </footer>
  );
}
