# Nudge

**Gentle reminders for everything that expires.**

Nudge is a simple app that helps you track anything with an expiry date—passports, memberships, food, medicine, and more. Add items with just a name and year, and get visual nudges when they're approaching or past their expiry.

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
- A `.env.local` file with `POSTGRES_URL` and NextAuth variables

## Setup

1. Install dependencies:

```bash
npm install
```

2. Set up the database:

```bash
npm run setup-db
```

3. (Optional) Seed sample data:

```bash
npm run seed
```

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
