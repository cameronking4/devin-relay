# Launch MVP Fast — SaaS Starterkit

A T3 Stack SaaS starterkit with auth, payments (LemonSqueezy), file uploads (UploadThing), and more.

## Quick start

**Prerequisites:** PostgreSQL running locally (e.g. `postgresql://postgres:postgres@localhost:5432/saas_dev`)

### Option 1: Quick run (default dev values)

From the repo root with pnpm:

```bash
cd starterkits/saas
pnpm dev
```

In development, most env vars are optional. A local Postgres DB is required. Create it with:

```bash
createdb saas_dev
```

### Option 2: Skip env validation (UI exploration only)

If you just want to browse the UI without setting up anything:

```bash
pnpm dev:demo
```

The app may error when using auth, uploads, or payments, but you can explore the interface.

### Option 3: Full setup

1. Copy the example env file:

   ```bash
   cp .env.example .env
   ```

2. Set `NEXTAUTH_SECRET` (required for OAuth):

   ```bash
   openssl rand -base64 32
   # Add output to .env as NEXTAUTH_SECRET=...
   ```

3. Fill in your credentials (Google/GitHub OAuth, Resend, UploadThing, LemonSqueezy, PostHog).

4. Create the database and apply schema:

   ```bash
   createdb saas_dev
   pnpm db:migrate
   ```

   > **Note:** Use `pnpm db:migrate` for initial setup. The `db:push` command has a known issue with composite primary keys (empty column names). Use `db:migrate` for reliable schema application.

5. Start the app:

   ```bash
   pnpm dev
   ```

## Important: use pnpm

This repo uses **pnpm** (see `pnpm-workspace.yaml`). Use `pnpm install` and `pnpm dev`, not `npm install` or `npm run dev`, to avoid dependency and script issues.

## Scripts

- `pnpm dev` — Start dev server (with optional env in dev)
- `pnpm dev:demo` — Start dev server without env validation (quick UI exploration)
- `pnpm db:generate` — Generate Drizzle migrations from schema
- `pnpm db:migrate` — Apply migrations to database (recommended for setup)
- `pnpm db:push` — Push schema directly (has known composite PK issues; prefer migrate)
- `pnpm db:studio` — Open Drizzle Studio

## Tech stack

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Drizzle ORM](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- LemonSqueezy, UploadThing, Resend, PostHog
