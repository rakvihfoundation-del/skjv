# Suvarna Karnataka Janashakti Vedike — Website & Admin Panel

ಸುವರ್ಣ ಕರ್ನಾಟಕ ಜನಶಕ್ತಿ ವೇದಿಕೆ · Next.js 16 · TypeScript · Supabase (Postgres, Auth, Storage) · Razorpay

## Connecting Supabase (one time)

1. **Create a project** at [supabase.com](https://supabase.com) (region: Mumbai for India).
2. **Create the database** — Dashboard → SQL Editor → paste and run, in this order:
   1. `supabase/migrations/20261112000000_skjv_init.sql` — tables, member/receipt numbers, row-level security,
      dashboard function and the two storage buckets (`media`, `members`).
   2. `supabase/seed.sql` — the current sample content (news, campaigns, gallery, leaders, wards, settings…).
   3. `supabase/migrations/20261112120000_event_registrations.sql` — members register for events.
   4. `supabase/migrations/20261113000000_volunteers.sql` — free volunteer sign-up with a private ID-proof bucket,
      volunteers in event registrations, and the Ammana Neralu Foundation home-page settings.
   (With the Supabase CLI you can instead run `supabase link` then `supabase db push`.)
3. **Add the keys** — Project Settings → API. Create `.env.local` in the project folder and fill in:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...        # "anon" / publishable key
   SUPABASE_SERVICE_ROLE_KEY=...            # "service_role" / secret key — server only, never share it
   ```
4. **Create the first admin**:
   ```bash
   npm run admin:create -- you@example.org "a-strong-password" "Your Name"
   ```
5. **Auth settings** (Dashboard → Authentication → Sign In / Providers → Email): turn **off**
   “Allow new users to sign up”. Members are created by the server only after a verified payment,
   and admins only with `npm run admin:create`.
6. Restart `npm run dev`. Until the keys are present the site shows a “Connect Supabase” notice.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
npm run typecheck    # strict TypeScript check
npm run build && npm start
```

## How it works

| Part | Where |
|---|---|
| Database schema, security rules, storage | `supabase/migrations/*.sql` |
| Sample content | `supabase/seed.sql` |
| Typed database definitions | `lib/supabase/database.types.ts` (regenerate: `SUPABASE_PROJECT_REF=xxxx npm run db:types`) |
| Supabase clients | `lib/supabase/server.ts` (session cookies), `client.ts` (browser), `admin.ts` (service role, server only) |
| Session refresh | `proxy.ts` (Next.js 16 “proxy”, formerly middleware) |
| Public data reads (cached; the admin panel clears the cache on save via `lib/revalidate.ts`) | `lib/queries.ts` |
| Auth helpers | `lib/auth.ts` |
| Admin content config (forms, columns, validation) | `lib/resources.ts`, `lib/crud.ts` |

**Security model (row-level security)**
- Website content (news, campaigns, gallery, leaders, partners, Instagram, wards, settings): everyone can read,
  only admins can write. Hidden banners are visible to admins only.
- Members: each member can read only their own record; admins can view, suspend and delete.
- Donations, contact messages, pending payments: admins only. The server writes them with the service role
  after its own validation.
- Public ID-card verification (`/verify/<member no>`) uses the `verify_member()` function, which returns only
  what is printed on the card, not the phone number.
- Storage: `media` bucket. Admins upload photos and videos straight from the browser.
  `members` bucket: sign-up photos, uploaded by the server after checks. Both are publicly readable.

**Logins**
- Admins: Supabase Auth email + password, listed in the `admins` table.
- Members: log in with **mobile number or member ID** + password. Behind the scenes each member has a private
  Supabase Auth e-mail `m<mobile>@<MEMBER_AUTH_EMAIL_DOMAIN>`; no mail is ever sent to it.
- Suspending a member in the admin panel also blocks their sign-in.

**Membership flow:** details → accept Terms → pay ₹1,500 (Razorpay) → the server verifies the payment signature →
creates the Supabase Auth user and the member record (number `SKJV-YYYY-000001`) → signs the member in →
QR-verified ID card (download PNG / print). Nothing is registered without a verified payment.

## Payments (Razorpay)

Without keys the site runs in **demo payment mode**: a simulated checkout, no money charged, and records are
marked “demo”. For test or live payments, add to `.env.local` and restart:

```
RAZORPAY_KEY_ID=rzp_test_xxx      # rzp_live_… when going live
RAZORPAY_KEY_SECRET=xxx
```

## Hosting

The app is stateless (data and files live in Supabase), so it runs on any Node host: Vercel, Netlify, a VPS, etc.
Set the same environment variables there and set `NEXT_PUBLIC_SITE_URL` to your real domain so ID-card QR
codes point to it. Keep `ADMIN_LOGIN_PREFILL=false` in production.

## Structure

- `app/(site)` — public pages · `app/admin` — admin panel · `app/api` — API routes
- `components/site`, `components/views` — website UI · `components/admin` — admin UI
- `lib/i18n.ts` — English / Kannada UI text · `lib/types.ts` — shared types
