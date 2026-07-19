# Hauler Calc — turning on accounts + payments

The app is live and useful **without any of this** — the calculator runs entirely
in the browser, and Pro tools can be previewed locally. This guide switches on
real sign-in and Stripe subscriptions. Budget ~20 minutes. Nothing here requires
touching the code; it's all keys and dashboard clicks.

Order matters: **Supabase → Stripe → Vercel env → webhook**.

---

## 1. Supabase (accounts + Pro flag)

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor → New query →** paste the contents of [`supabase/schema.sql`](supabase/schema.sql) and run it. This creates the `profiles` table, row-level security, and the auto-profile trigger.
3. **Authentication → Providers → Email:** make sure Email is enabled (magic link is on by default).
4. **Authentication → URL Configuration:** set the Site URL to your domain (e.g. `https://haulercalc.com`) and add `https://YOURDOMAIN/auth/callback` to the Redirect URLs. For local dev also add `http://localhost:3000/auth/callback`.
5. **Project Settings → API:** copy the **Project URL**, the **anon public** key, and the **service_role** key.

Put them in your env (`.env.local` for dev, Vercel for prod):

```
NEXT_PUBLIC_SUPABASE_URL=...        # Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=...   # anon public
SUPABASE_SERVICE_ROLE_KEY=...       # service_role — server only, keep secret
```

---

## 2. Stripe (subscriptions)

1. In [Stripe](https://dashboard.stripe.com) (stay in **Test mode** until you're ready), create **one Product** called "Hauler Calc Pro" with **two prices**:
   - Recurring **$9 / month**
   - Recurring **$59 / year**
2. Copy each **Price ID** (`price_...`).
3. **Developers → API keys:** copy the **Secret key** (`sk_...`).

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_ANNUAL=price_...
```

4. **Customer portal:** Settings → Billing → Customer portal → activate it (lets subscribers manage/cancel).

---

## 3. Vercel env + site URL

1. In Vercel → your project → **Settings → Environment Variables**, add every key above **plus**:
   ```
   NEXT_PUBLIC_SITE_URL=https://YOURDOMAIN   # no trailing slash
   ```
2. Redeploy so the new env takes effect.

---

## 4. Stripe webhook (the part that flips `is_pro`)

1. **Developers → Webhooks → Add endpoint:** URL = `https://YOURDOMAIN/api/webhook`.
2. Subscribe to these events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`.
3. Copy the endpoint's **Signing secret** (`whsec_...`) into env and redeploy:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

Local testing: `stripe listen --forward-to localhost:3000/api/webhook` prints a `whsec_...` to use in `.env.local`.

---

## 5. Verify

1. Visit `/pricing`, sign in (magic link), click Upgrade → Stripe Checkout (use test card `4242 4242 4242 4242`).
2. After paying you land back on `/calculator?upgraded=1`; within a few seconds the Pro tabs unlock and the header shows **PRO**.
3. Header → account → **Manage billing** opens the Stripe portal.

When everything works in Test mode, flip Stripe to **Live**, swap the keys, recreate the webhook on the live endpoint, and you're taking real money.

---

## How the pieces map

| Concern | Where |
|---|---|
| Who's the user | Supabase auth (magic link) — `lib/supabase/*` |
| Is the user Pro | `profiles.is_pro`, read client-side in `PlanProvider` |
| Start a subscription | `POST /api/checkout` → Stripe Checkout |
| Manage/cancel | `POST /api/portal` → Stripe billing portal |
| Source of truth | `POST /api/webhook` (Stripe → sets `is_pro`) |
| What's free vs Pro | `lib/plan.ts` — change the split in one place |
