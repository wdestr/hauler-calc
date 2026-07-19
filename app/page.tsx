import Link from 'next/link';
import HeroCalc from '@/components/marketing/HeroCalc';
import Icon, { type IconName } from '@/components/ui/Icon';
import { FREE_FEATURES, PRO_FEATURES, PRICING } from '@/lib/plan';

const TOOLS: { icon: IconName; name: string; desc: string; pro: boolean }[] = [
  { icon: 'coins', name: 'True cost per stop', desc: 'Every cost line — labor, fuel, insurance, vehicle, overhead, claims — rolled into the number that decides whether a rate works.', pro: false },
  { icon: 'flag', name: 'Break-even + rate floor', desc: 'The exact stops-per-day and minimum rate where you stop losing money. Never quote below it again.', pro: false },
  { icon: 'chart', name: 'Cash-flow runway', desc: 'A 13-week timeline that finds the week your cash goes negative — before it actually does.', pro: true },
  { icon: 'scale', name: 'W-2 vs 1099 crew', desc: 'What each crew model actually costs you per stop once you count payroll tax, comp, and the misclassification risk.', pro: true },
  { icon: 'route', name: 'Fleet planner', desc: 'Scale the model to N trucks and see where margin compresses as you grow — the curve nobody warns you about.', pro: true },
  { icon: 'truck', name: 'Truck acquisition', desc: 'Rent vs lease vs buy vs contractor-owned, over five years, against your real route economics.', pro: true },
];

export default function HomePage() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50/60 to-paper" />
        <div className="max-w-6xl mx-auto px-5 pt-16 pb-20 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div>
            <span className="eyebrow">For last-mile heavy &amp; bulky haulers</span>
            <h1 className="display-xl text-5xl sm:text-6xl text-ink mt-3 mb-5 text-balance">
              Know your <span className="text-brand-600">true cost</span> per stop.
            </h1>
            <p className="text-lg text-ink-soft leading-relaxed max-w-lg mb-8">
              Most haulers price on gut and find out at tax time. Hauler Calc turns your rate, crew, fuel, and
              overhead into the numbers that actually decide the business — break-even, cost per stop, and whether
              you&rsquo;re making money — in about two minutes.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/calculator" className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors">
                Open the free calculator <Icon name="arrow" size={18} />
              </Link>
              <Link href="/pricing" className="inline-flex items-center gap-2 text-ink-soft hover:text-ink font-semibold px-4 py-3.5">
                See what Pro unlocks
              </Link>
            </div>
            <p className="text-sm text-faint mt-5">Free forever · no signup to start · your numbers stay on your device</p>
          </div>
          <div className="justify-self-center lg:justify-self-end">
            <HeroCalc />
          </div>
        </div>
      </section>

      {/* ---------- Problem ---------- */}
      <section className="border-y border-line bg-surface">
        <div className="max-w-6xl mx-auto px-5 py-16 grid md:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
          <h2 className="display-lg text-3xl sm:text-4xl text-ink text-balance">
            The trucks keep rolling right up until the cash doesn&rsquo;t.
          </h2>
          <div className="space-y-5 text-ink-soft">
            <p className="leading-relaxed">
              A rate that feels competitive can quietly be underwater once you count the crew&rsquo;s real hours, the
              fuel on a bad-density route, the insurance stack, and the claims you&rsquo;re self-insuring. Most
              operators who fail in year one fail <em>while profitable</em> on paper.
            </p>
            <div className="grid sm:grid-cols-3 gap-5">
              <Stat n="6" unit="cost lines" note="rolled into one honest number" />
              <Stat n="13 wk" unit="cash runway" note="find the negative week early" />
              <Stat n="2 min" unit="to an answer" note="no spreadsheet, no login" />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Tools ---------- */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <div className="max-w-2xl mb-10">
          <span className="eyebrow">Everything in one place</span>
          <h2 className="display-lg text-3xl sm:text-4xl text-ink mt-2">Six tools that price the whole business.</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
          {TOOLS.map((t) => (
            <div key={t.name} className="flex gap-4 py-5 border-b border-line">
              <span className="grid place-items-center w-11 h-11 rounded-xl bg-brand-50 text-brand-600 shrink-0">
                <Icon name={t.icon} size={22} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-ink">{t.name}</h3>
                  {t.pro && <span className="text-[0.62rem] font-bold tracking-wide text-brand-700 bg-brand-50 border border-brand-100 rounded px-1.5 py-0.5">PRO</span>}
                </div>
                <p className="text-sm text-muted leading-relaxed mt-1">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Pricing teaser ---------- */}
      <section className="border-y border-line bg-surface">
        <div className="max-w-5xl mx-auto px-5 py-16">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="eyebrow">Simple pricing</span>
            <h2 className="display-lg text-3xl sm:text-4xl text-ink mt-2">The calculator is free. The power tools are Pro.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            <PlanCard title="Free" price="$0" per="forever" features={FREE_FEATURES} cta="Start free" href="/calculator" muted />
            <PlanCard title="Pro" price={PRICING.annual.label} per="/yr" features={PRO_FEATURES} cta="See Pro plans" href="/pricing" highlight
              sub={`or ${PRICING.monthly.label}/mo · save ${PRICING.annual.savingsPct}% annually`} />
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="max-w-3xl mx-auto px-5 py-16">
        <h2 className="display-lg text-3xl text-ink mb-8">Questions haulers ask.</h2>
        <div className="divide-y divide-line">
          <Faq q="Do I need an account to use it?" a="No. The free calculator runs entirely in your browser — nothing to sign up for, and your numbers never leave your device. An account only matters if you want Pro tools and saved profiles synced across devices." />
          <Faq q="Where do the cost assumptions come from?" a="You enter your own — rate per stop, crew pay, fuel, insurance, vehicle, overhead, and claims rate. The defaults are realistic starting points for a two-person heavy-and-bulky crew, but every number is yours to change." />
          <Faq q="What's the difference between free and Pro?" a="Free gives you the core cost-per-stop and break-even math plus one saved profile. Pro adds the cash-flow timeline, W-2 vs 1099 analyzer, fleet planner, truck-acquisition comparison, up to ten saved profiles, and PDF export." />
          <Faq q="Is this tax or financial advice?" a="No. It's a planning tool that does the arithmetic you'd otherwise do in a spreadsheet. Run big decisions past your accountant." />
          <Faq q="Can I cancel Pro anytime?" a="Yes. Pro is a simple monthly or annual subscription through Stripe — cancel from your account and you keep access through the period you paid for." />
        </div>
      </section>

      {/* ---------- Final CTA ---------- */}
      <section className="bg-brand-700 text-white">
        <div className="max-w-4xl mx-auto px-5 py-16 text-center">
          <h2 className="display-lg text-3xl sm:text-4xl text-balance">Stop guessing what a stop actually costs you.</h2>
          <p className="text-brand-100 mt-3 mb-7 max-w-lg mx-auto">Two minutes to know whether your rates are making money. Free to start.</p>
          <Link href="/calculator" className="inline-flex items-center gap-2 bg-white text-brand-700 font-semibold px-7 py-3.5 rounded-xl hover:bg-brand-50 transition-colors">
            Open the calculator <Icon name="arrow" size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}

function Stat({ n, unit, note }: { n: string; unit: string; note: string }) {
  return (
    <div>
      <div className="display-lg text-2xl text-brand-600 tnum">{n}</div>
      <div className="text-sm font-semibold text-ink">{unit}</div>
      <div className="text-xs text-muted mt-0.5">{note}</div>
    </div>
  );
}

function PlanCard({ title, price, per, features, cta, href, highlight, muted, sub }: {
  title: string; price: string; per: string; features: readonly string[]; cta: string; href: string; highlight?: boolean; muted?: boolean; sub?: string;
}) {
  return (
    <div className={`rounded-2xl p-6 border ${highlight ? 'border-brand-300 bg-brand-50/40 shadow-[var(--shadow-plate)]' : 'border-line bg-surface'}`}>
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="font-display text-xl font-semibold text-ink">{title}</h3>
        {highlight && <span className="text-[0.62rem] font-bold text-brand-700 bg-white border border-brand-200 rounded-full px-2 py-0.5">MOST POPULAR</span>}
      </div>
      <div className="flex items-end gap-1.5 mb-1">
        <span className="display-lg text-4xl text-ink tnum">{price}</span>
        <span className="text-muted text-sm mb-1.5">{per}</span>
      </div>
      {sub ? <p className="text-xs text-muted mb-4">{sub}</p> : <div className="mb-4" />}
      <ul className="space-y-2 mb-6">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-ink-soft">
            <span className={`mt-0.5 shrink-0 ${muted ? 'text-muted' : 'text-brand-600'}`}><Icon name="check" size={16} /></span>{f}
          </li>
        ))}
      </ul>
      <Link href={href} className={`block text-center py-3 rounded-xl font-semibold transition-colors ${highlight ? 'bg-brand-600 hover:bg-brand-700 text-white' : 'border border-line-strong text-ink hover:bg-paper'}`}>
        {cta}
      </Link>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="group py-4">
      <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-ink">
        {q}
        <span className="text-muted transition-transform group-open:rotate-45"><Icon name="spark" size={16} /></span>
      </summary>
      <p className="text-muted text-sm leading-relaxed mt-2 pr-8">{a}</p>
    </details>
  );
}
