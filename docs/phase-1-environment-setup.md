# Phase 1 — Environment Setup

## Required variables

Copy `.env.example` to `.env.local`:

```bash
copy .env.example .env.local
```

(On macOS/Linux: `cp .env.example .env.local`)

| Variable               | Purpose                                                        | Public?        |
| ---------------------- | -------------------------------------------------------------- | -------------- |
| `DATABASE_URL`         | Neon **pooled** connection for the app / Prisma Client adapter | No             |
| `DIRECT_URL`           | Neon **direct** connection for Prisma Migrate / CLI            | No             |
| `NEXT_PUBLIC_SITE_URL` | Canonical site origin for `robots.ts` / `sitemap.ts`           | Yes (URL only) |
| `NODE_ENV`             | Usually set by the host                                        | N/A            |

Rules:

- Both database URLs must include `sslmode=require`
- Pooled URL hostname includes `-pooler`
- Direct URL hostname does **not** include `-pooler`
- Never put database credentials in `NEXT_PUBLIC_*` variables

Do not commit real credentials. `.env*` is gitignored; `.env.example` is allowed.

## Obtaining Neon URLs

1. Create a Neon project.
2. Open **Connect**.
3. Copy the **pooled** connection string → `DATABASE_URL` (hostname contains `-pooler`).
4. Copy the **direct** connection string → `DIRECT_URL` (no `-pooler`).
5. Ensure both include `sslmode=require`.

## Local commands

```bash
npm install
npm run db:generate
npm run db:deploy
npm run db:seed
npm run db:check
npm run db:verify-landing
npm run db:test-lead
npm run dev
```

Committed migrations:

```text
prisma/migrations/20260720120000_init_creative_marketing_foundation
prisma/migrations/20260720210000_add_lead_session_tracking
```

To create additional migrations during development (with Neon configured):

```bash
npx prisma migrate dev --name your_migration_name
```

Useful scripts:

| Script                               | Command                           |
| ------------------------------------ | --------------------------------- |
| Validate schema                      | `npm run db:validate`             |
| Generate client                      | `npm run db:generate`             |
| Create migration (dev)               | `npx prisma migrate dev --name …` |
| Deploy migrations (first setup/prod) | `npm run db:deploy`               |
| Seed                                 | `npm run db:seed`                 |
| Connectivity check                   | `npm run db:check`                |
| Landing safety verify                | `npm run db:verify-landing`       |
| Lead journey test                    | `npm run db:test-lead`            |
| Studio                               | `npm run db:studio`               |

## Node notes

- Engines require Node `>=20.19.0`
- Package `"type": "module"`
- Neon WebSocket access in Node requires the `ws` package (configured in `src/lib/db/neon-ws.ts`)

## Production deployment variables

Set on the host (Vercel or similar):

- `DATABASE_URL` (pooled)
- `DIRECT_URL` (direct) — required for `prisma migrate deploy` during CI/CD
- `NEXT_PUBLIC_SITE_URL` (production origin, no trailing slash)
- Run `npm run db:deploy` before or during release
- Run seed only when intentional (idempotent, but still an ops decision)

## Database check behavior

`npm run db:check`:

1. Confirms `DATABASE_URL` and `DIRECT_URL` exist, look like Postgres URLs, and include SSL
2. Connects with the Neon adapter
3. Runs `SELECT 1`
4. Confirms seeded `brand.name` exists
5. Prints counts (not secrets)
6. Exits non-zero on failure
7. Never prints connection strings or passwords
