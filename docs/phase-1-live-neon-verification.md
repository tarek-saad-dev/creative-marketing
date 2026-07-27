# Phase 1.1 — Live Neon Verification

**Date:** 2026-07-21  
**Status:** Phase 1 fully closed against a live Neon development database

## Neon branch / project

- Provider: Neon PostgreSQL
- Database name: `neondb`
- Region endpoint pattern: `ep-delicate-frog-aumtnbk7` (US East)
- Runtime connection: pooled (`-pooler`) via `DATABASE_URL` + `@prisma/adapter-neon`
- CLI / migrations: direct (non-pooler) via `DIRECT_URL`
- Secrets stored only in `.env.local` (gitignored)

Do not document connection strings or passwords here.

## Node and Prisma requirements

| Requirement                | Observed                             |
| -------------------------- | ------------------------------------ |
| Node                       | `v20.19.0` (engines: `>=20.19.0`)    |
| Package `"type"`           | `"module"`                           |
| Prisma                     | `7.9.0`                              |
| `@prisma/client`           | `7.9.0`                              |
| `@prisma/adapter-neon`     | `7.9.0`                              |
| `@neondatabase/serverless` | `1.1.0`                              |
| `ws`                       | required in Node for Neon WebSockets |

## Migration names and status

1. `20260720120000_init_creative_marketing_foundation`
2. `20260720210000_add_lead_session_tracking`

`prisma migrate deploy` applied both.  
`prisma migrate status`: **Database schema is up to date** (no pending migrations).  
No reset / force-push / destructive flags were used.

### Init migration correction (pre-apply)

Because the init migration had not yet been applied to any shared database, it was corrected to match the hardened schema:

- `Package.originalPrice` is nullable (`DECIMAL(12,2)` without `NOT NULL`)
- `LeadEventType` is CRM-only: `STATUS_CHANGED`, `CONTACTED`, `QUALIFIED`, `WON`, `LOST`

Journey events moved to `LeadSessionEventType` in the second migration.

## Seed results

### First run

- Site settings: 12
- Services: 16
- Packages by status: `DRAFT=3`
- FAQs: 9
- Trust placeholders: 2

### Second run

Identical counts — no duplicates:

- Site settings: 12
- Services: 16
- Packages by status: `DRAFT=3`
- FAQs: 9
- Trust placeholders: 2

Seed preserves non-empty contact settings and configured package prices when present.

## Database check

`npm run db:check` passed:

- Connectivity ok
- `brand.name` present
- Active services: 16
- Draft packages: 3
- Public priced packages: 0
- Active FAQs: 9
- Inactive/unverified trust placeholders: 2

## Landing data query

`npm run db:verify-landing` passed:

- Brand loads
- Service categories THINK / CREATE / BUILD / GROW present
- Public priced packages: 0 (drafts excluded)
- No projects / testimonials / client logos / verified trust metrics
- FAQs: 9

## Lead transaction test

`npm run db:test-lead` passed:

- Created LeadSession
- Events: `FORM_OPENED → PACKAGE_SELECTED → STEP_COMPLETED → FORM_SUBMITTED`
- Created Lead + linked session
- CRM `LeadEvent` `STATUS_CHANGED`
- WhatsApp message generated (not opened)
- Deleted only the test rows

## Public pricing safety rule

- `originalPrice` is nullable until configured
- Seed packages remain `DRAFT` with `originalPrice = null`
- Public queries require `PUBLISHED` and `originalPrice > 0`
- Offer prices must be `> 0` and strictly below the package original price
- Zero / placeholder prices never appear in public landing data

## LeadSession architecture

| Concern                | Model                              |
| ---------------------- | ---------------------------------- |
| Pre-submission journey | `LeadSession` + `LeadSessionEvent` |
| Post-submission CRM    | `Lead` + `LeadEvent`               |

- `sessionToken` unique
- No PII / IP / fingerprint on sessions
- On submit: create Lead → link session → `FORM_SUBMITTED` → CRM `STATUS_CHANGED`

## Commands for another developer

```bash
copy .env.example .env.local
# Fill DATABASE_URL (pooled) and DIRECT_URL (direct), both with sslmode=require
npm install
npm run db:deploy
npm run db:seed
npm run db:check
npm run db:verify-landing
npm run db:test-lead
npm run build
npm run dev
```

## Production migration workflow

1. Set `DATABASE_URL` (pooled) and `DIRECT_URL` (direct) on the host
2. Run `npm run db:deploy` (never `migrate reset`)
3. Run seed only when intentional (`npm run db:seed`)
4. Deploy the Next.js app (`npm run build` / platform build)

## Remaining manual business content

- WhatsApp number
- Email
- Social links
- Real package prices (then publish packages)
- Real portfolio projects
- Real testimonials
- Real trust metrics (verify + activate)
- Real offer dates and slot limits
