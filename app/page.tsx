import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <div className="bg-gradient-to-br from-slate-900 to-blue-900 text-white py-20 px-5 text-center">
        <div className="inline-block bg-white/10 border border-white/25 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
          Free for Last Mile Haulers
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Know Your True Cost Per Stop
        </h1>
        <p className="text-white/70 text-lg max-w-xl mx-auto mb-8">
          Calculate your break-even point, true profit per stop, and whether your current rates
          are actually making you money — in under 2 minutes.
        </p>
        <Link href="/calculator"
          className="inline-block bg-blue-500 hover:bg-blue-400 text-white font-bold px-8 py-4 rounded-xl text-base transition-colors">
          Open Free Calculator →
        </Link>
      </div>
    </main>
  );
}
