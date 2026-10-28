# Slotly

Multi-tenant appointment booking platform for salons, clinics, tutors, and similar service businesses. A business owner signs up, sets their services and weekly availability, and gets a public booking page customers can use to find open slots and book instantly — no account required for the customer.

**Live:** [slotly-booking-platform.vercel.app](https://slotly-booking-platform.vercel.app)

## What it does

- **For customers** — browse or search businesses by category, view live availability, and book an appointment in a few clicks. No signup needed to book.
- **For business owners** — Google OAuth sign-in, then a dashboard to manage services (name, duration, price), set weekly availability per day, review incoming bookings, and approve or decline them.
- **Per-tenant branding** — each business gets its own accent color, logo, and cover photo, applied across their public page without touching the shared layout.

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions)
- **TypeScript**
- **Tailwind CSS v4**
- **Supabase** — Postgres, Auth (Google OAuth + email OTP for business verification), Storage, and Row Level Security for tenant isolation
- **Zod** for input validation on every mutation
- **Sentry** for error monitoring
- Deployed on **Vercel**

## Architecture notes

- Every table (`businesses`, `services`, `availability_rules`, `bookings`) is scoped by RLS policies so one business owner can never read or modify another tenant's data, even if the client-side code were bypassed entirely.
- Booking status transitions are locked down at the database level — a Postgres trigger prevents any column other than `status` from being changed on update, and separate policies control which status transitions a customer vs. an owner is allowed to make.
- Rate limiting (OTP requests, booking creation) is enforced server-side via a Supabase-backed helper, not just client-side throttling.
- File uploads (logo/cover photo) are validated by MIME type and size on the server before they touch storage — the client-side check is just for instant feedback, not the actual guard.
- ISR caching (`unstable_cache`) and parallelized queries keep the public discovery and business pages fast without giving up freshness on availability data.

## Running locally

```bash
npm install
npm run dev
```
## Screenshots

![Screenshot 1](Screenshot%20%28320%29.png)

![Screenshot 2](Screenshot%20%28322%29.png)

![Screenshot 3](Screenshot%202026-08-26%20234846.png)

You'll need a Supabase project with the schema this app expects, plus the environment variables in `.env.example` filled in (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and a Sentry DSN if you want error reporting locally).

## Status

Actively developed as a portfolio project. Core booking flow, auth, dashboard, RLS, rate limiting, and input validation are done and deployed. Still on the list: automated tests and a full visual QA pass.
