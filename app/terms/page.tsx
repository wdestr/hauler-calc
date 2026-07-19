import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms of Service — Hauler Calc' };

export default function TermsPage() {
  return (
    <article className="max-w-2xl mx-auto px-5 py-16 prose-hc">
      <h1 className="display-lg text-4xl text-ink mb-2">Terms of Service</h1>
      <p className="text-faint text-sm mb-8">Last updated: {new Date().getFullYear()}</p>

      <Section title="What Hauler Calc is">
        Hauler Calc is a planning tool that estimates the cost and profitability of a last-mile delivery operation
        from figures you enter. It performs arithmetic — it is not accounting software, and nothing it produces is
        tax, legal, or financial advice. Verify important decisions with a qualified professional.
      </Section>

      <Section title="Accounts">
        The core calculator works without an account. If you create one, you&rsquo;re responsible for the security of
        your sign-in email. You may delete your account at any time.
      </Section>

      <Section title="Pro subscriptions">
        Pro is billed monthly or annually through our payment processor. You can cancel anytime from your account; on
        cancellation you keep Pro access through the end of the period you&rsquo;ve paid for. Prices may change with
        notice; changes never affect the term you&rsquo;ve already paid.
      </Section>

      <Section title="Acceptable use">
        Don&rsquo;t attempt to break, overload, resell, or reverse-engineer the service. We may suspend accounts that do.
      </Section>

      <Section title="No warranty">
        The service is provided &ldquo;as is.&rdquo; Estimates depend entirely on the inputs you provide; we don&rsquo;t
        guarantee outcomes and aren&rsquo;t liable for business decisions made using the tool.
      </Section>

      <Section title="Contact">
        Questions about these terms? Reach out through the email on your receipt or account.
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
