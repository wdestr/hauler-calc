import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Hauler Calculator — Know Your True Cost Per Stop',
  description: 'Free last-mile hauler profitability calculator. Know your break-even, true cost per stop, and whether your rates are making you money.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">
        <nav className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between">
          <Link href="/" className="text-base font-bold text-slate-800">Hauler Calc</Link>
          <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
            <Link href="/calculator">Calculator</Link>
            <Link href="/pricing" className="text-blue-700">Upgrade to Pro</Link>
            {/* UserMenu injected here in SP2 */}
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
