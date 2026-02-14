# NudgeSoon

**Gentle reminders for everything that expires.**

NudgeSoon is a simple app that helps you track anything with an expiry date—passports, memberships, food, medicine, and more. Add items with just a name and year, and get visual nudges when they're approaching or past their expiry.

## Features

- **Simple tracking** — Add the year and item name; we handle the rest
- **Instant updates** — See your items update in real-time
- **Smart reminders** — Visual status indicators (safe, approaching, critical) so you never miss what matters
- **Private & secure** — Each user sees only their own items

## Tech Stack

- [Next.js](https://nextjs.org) 16
- [NextAuth](https://next-auth.js.org/) for authentication
- PostgreSQL for data
- Tailwind CSS, Framer Motion, Radix UI

## Prerequisites

- Node.js 18+
- PostgreSQL database
- A `.env.local` file with `POSTGRES_URL`, NextAuth variables, and `ENCRYPTION_KEY` (required for production; generate with `openssl rand -base64 32`)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env.local` and fill in your values. Generate `ENCRYPTION_KEY` with:

```bash
openssl rand -base64 32
```

3. Set up the database:

```bash
npm run setup-db
```

4. (Optional) Seed sample data:

```bash
npm run seed
```

5. If you have existing data, run the encryption migration:

```bash
npm run migrate:encrypt
```

6. (Optional) Stripe donations: To enable donation buttons on the contribute page, create [Stripe Payment Links](https://dashboard.stripe.com/payment-links) for $3, $5, $10, $25, and a custom-amount link. Add the URLs to `.env.local` as `NEXT_PUBLIC_STRIPE_DONATION_LINK_3`, `NEXT_PUBLIC_STRIPE_DONATION_LINK_5`, etc. If no links are configured, the donation section is hidden.

## Getting Started

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser. Sign in to access your dashboard and start adding expiry items.

## End-to-End Testing (Playwright)

Install Playwright browsers once:

```bash
npx playwright install chromium
```

Run the test suite:

```bash
npm run test:e2e
```

These same checks run automatically on pull requests targeting `main`.

Useful variants:

```bash
npm run test:e2e:ui
npm run test:e2e:headed
npm run test:e2e:debug
```

Run against explicit environments:

```bash
npm run test:e2e:local
npm run test:e2e:prod
```

For authenticated E2E tests, you can override credentials if needed:

```bash
E2E_EMAIL=demo@example.com E2E_PASSWORD=demo1234 npm run test:e2e:local
```

The create/update item flow mutates data, so it is skipped on prod by default. To include it on prod:

```bash
E2E_ALLOW_PROD_MUTATIONS=true E2E_EMAIL=demo@example.com E2E_PASSWORD=demo1234 npm run test:e2e:prod
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Production Notes (Vercel + Neon)

- Use Neon pooled connection string (`-pooler`) for `POSTGRES_URL` in production.
- Keep serverless DB pool size small (configured in `lib/db.ts`) to reduce connection pressure.
- Ensure `AUTH_SECRET`, OAuth credentials, and `ENCRYPTION_KEY` are set in Vercel project settings.

## Uptime and Error Monitoring

- Health endpoint: `GET /api/health`
  - Returns `200` when app + DB are healthy.
  - Returns `503` when DB health check fails.
- Point your uptime monitor (e.g. Better Stack/UptimeRobot) at:
  - `https://your-domain.com/api/health`
- Recommended alert threshold:
  - Alert after 2-3 consecutive failures to reduce noise from transient cold starts.
