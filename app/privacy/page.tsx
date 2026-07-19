import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy Policy — Hauler Calc' };

export default function PrivacyPage() {
  return (
    <article className="max-w-2xl mx-auto px-5 py-16">
      <h1 className="display-lg text-4xl text-ink mb-2">Privacy Policy</h1>
      <p className="text-faint text-sm mb-8">Last updated: {new Date().getFullYear()}</p>

      <Section title="The short version">
        The calculator runs in your browser. The numbers you type stay on your device unless you save a profile to an
        account or share a link. We don&rsquo;t sell your data — ever.
      </Section>

      <Section title="What we store">
        Without an account, nothing leaves your device (your inputs and saved profiles live in your browser&rsquo;s
        local storage). With an account, we store your email and — for Pro — your subscription status and payment
        processor customer ID. We never see or store card numbers; those go directly to our payment processor.
      </Section>

      <Section title="Shared links">
        A shared scenario link encodes your entered numbers into the URL so it reopens with them. Anyone with that
        link can see those figures — only share it with people you intend to.
      </Section>

      <Section title="Payments">
        Subscriptions are handled by Stripe, which processes your card and billing details under its own privacy
        policy. We receive only what we need to grant access and manage your subscription.
      </Section>

      <Section title="Your choices">
        Clear your browser storage to remove local data. Delete your account to remove stored account data. Contact us
        via the email on your receipt for any request.
      </Section>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-7">
      <h2 className="font-display text-xl font-semibold text-ink mb-2">{title}</h2>
      <p className="text-ink-soft leading-relaxed">{children}</p>
    </section>
  );
}
