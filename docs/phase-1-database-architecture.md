# Phase 1 — Database Architecture

## Why the database is server-only

Creative Marketing stores business content and leads in Neon PostgreSQL. Credentials (`DATABASE_URL`, `DIRECT_URL`) must never reach the browser. App imports go through `src/lib/db/prisma.ts` (`server-only`). Repositories and services also use `server-only`.

Public pages load data in Server Components. Mutations use Server Actions. No `NEXT_PUBLIC_*` database variables are used.

## Prisma and Neon responsibilities

| Layer                      | Responsibility                                                   |
| -------------------------- | ---------------------------------------------------------------- |
| Neon                       | Managed PostgreSQL (pooled + direct endpoints)                   |
| `@prisma/adapter-neon`     | Serverless-friendly driver adapter for runtime queries           |
| `@neondatabase/serverless` | Neon HTTP/WebSocket driver                                       |
| `ws`                       | WebSocket implementation required for Node.js scripts/runtime    |
| Prisma Client              | Typed queries in application code                                |
| Prisma Migrate             | Schema history via SQL migrations (not `db push` for production) |
| `prisma.config.ts`         | CLI datasource uses `DIRECT_URL` for migrations                  |
| Runtime client             | Uses pooled `DATABASE_URL` through the Neon adapter              |

## Repository boundaries

Repositories (`src/server/repositories/*`):

- Own Prisma queries
- Return selected, typed fields
- Filter deleted/inactive/public records where appropriate
- Avoid presentational formatting

## Service boundaries

Services (`src/server/services/*`):

- Orchestrate repositories
- Encode business rules (offer status, lead capture, WhatsApp message text)
- Expose use-case APIs such as `getLandingPageData()`

## Public data loading

```text
Neon → Prisma → Repositories → landing-page.service → Server Component
```

`getLandingPageData()` loads settings, trust metrics, logos, featured projects, services, active offer, packages, testimonials, and FAQs in parallel.

### Public pricing safety

- `Package.originalPrice` is nullable until configured
- Public packages require `status = PUBLISHED` and `originalPrice > 0`
- Draft / null / zero prices are never returned publicly
- Active offer prices must be `> 0` and strictly below the package original price

## Lead journey architecture

| Concern                  | Model                              |
| ------------------------ | ---------------------------------- |
| Pre-submission anonymous | `LeadSession` + `LeadSessionEvent` |
| Post-submission CRM      | `Lead` + `LeadEvent`               |

`LeadSessionEventType`: `FORM_OPENED`, `PACKAGE_SELECTED`, `STEP_COMPLETED`, `FORM_SUBMITTED`, `WHATSAPP_OPENED`, `FORM_ABANDONED`

`LeadEventType` (CRM): `STATUS_CHANGED`, `CONTACTED`, `QUALIFIED`, `WON`, `LOST`

Sessions store attribution only (source/UTM/referrer). No PII, IP, or fingerprint.

## Lead write flow

```text
LeadSession (+ journey events)
  → Server Action → Zod → lead-capture.service
  → Prisma transaction:
      create Lead
      link LeadSession.leadId
      LeadSessionEvent FORM_SUBMITTED
      LeadEvent STATUS_CHANGED
  → WhatsApp message string (no browser open)
```

Rate limiting / spam protection is intentionally left as an extension point on the action.

## Offer price source of truth

- Package list price: `Package.originalPrice` (nullable until configured)
- Active discount: `OfferPackage.offerPrice` for the current active offer only
- Landing service merges `offerPrice` onto packages when an offer is computed `active`
- Remaining slots are exposed only when `maxSlots` is defined

Offer state is computed from dates + slots + flags (`offer-status.service`), not trusted from stored status alone when dates disagree.

## Media storage strategy

- Neon stores **metadata**: URLs, dimensions, alt text, captions, display order
- Binary media (images/videos) will live in Cloudinary or object storage in a later phase
- `ProjectMedia` and cover fields on `Project` hold remote URLs, not file blobs
