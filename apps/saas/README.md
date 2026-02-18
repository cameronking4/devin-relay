# Relay

**Event-driven AI orchestration for engineering signals.**

The Relay product: connect webhooks, configure prompts, trigger Devin, route outputs to GitHub. No glue code.

## Quick start

**Prerequisites:** PostgreSQL + Redis running locally.

### Option 1: Quick run (dev defaults)

From repo root:

```bash
pnpm --filter=saas dev
```

Create the database:

```bash
createdb saas_dev
```

### Option 2: Full setup

1. Copy `.env.example` to `.env`
2. Set `NEXTAUTH_SECRET` (required for OAuth):

   ```bash
   openssl rand -base64 32
   ```

3. Add credentials: Devin API key, GitHub App, Resend, PostHog
4. Apply schema:

   ```bash
   pnpm db:migrate
   ```

5. Run `pnpm dev`

## Important: use pnpm

This repo uses **pnpm** workspaces. Use `pnpm install` and `pnpm dev`.

## Scripts

- `pnpm dev` — Dev server
- `pnpm dev:demo` — UI exploration without full env
- `pnpm db:generate` — Generate migrations
- `pnpm db:migrate` — Apply migrations
- `pnpm db:studio` — Drizzle Studio

## Tech stack

- Next.js, TypeScript
- Drizzle ORM, PostgreSQL
- Redis (BullMQ)
- NextAuth.js
- LemonSqueezy, PostHog
