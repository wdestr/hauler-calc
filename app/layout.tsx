import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';
import { PlanProvider } from '@/components/PlanProvider';
import { UIProvider } from '@/components/UIProvider';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-fraunces',
  display: 'swap',
});
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'Hauler Calc — Know Your True Cost Per Stop',
  description:
    'The profitability calculator for last-mile heavy & bulky haulers. Find your break-even, true cost per stop, cash-flow runway, and whether your rates actually make money — in two minutes.',
  openGraph: {
    title: 'Hauler Calc — Know Your True Cost Per Stop',
    description: 'Break-even, true cost per stop, and cash-flow runway for last-mile haulers.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col">
        <a href="#main" className="skip-link">Skip to content</a>
        <PlanProvider>
          <UIProvider>
            <SiteHeader />
            <main id="main" className="flex-1">{children}</main>
            <SiteFooter />
          </UIProvider>
        </PlanProvider>
      </body>
    </html>
  );
}
