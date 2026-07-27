# Phase 1 — Starter Audit

**Date:** 2026-07-20  
**Package manager:** npm (`package-lock.json`)  
**Node:** v20.19.0 (local)  
**npm:** 11.4.2

---

## Current installed versions

| Package               | Declared version |
| --------------------- | ---------------- |
| next                  | 16.0.0           |
| react / react-dom     | 19.2.0           |
| typescript            | ^5               |
| tailwindcss           | ^3.4.18          |
| @headlessui/react     | ^2.2.9           |
| framer-motion         | ^12.23.24        |
| @tanstack/react-query | ^5.90.5          |
| react-hook-form       | ^7.65.0          |
| zod                   | ^4.1.12          |
| lucide-react          | ^0.546.0         |
| axios                 | ^1.12.2          |
| @heroicons/react      | ^2.2.0 (unused)  |
| eslint-config-next    | 16.0.0           |

**README vs reality:** README claims Next.js 14 / React 18. Code and `package.json` already use **Next.js 16 App Router** and **React 19**.

---

## Current Next.js and React architecture

- App Router under `src/app`
- Root layout wraps all pages in `QueryProvider` + shared `Layout` (Header/Footer)
- Client-heavy demo API page at `/api-demo`
- External backend assumed via `NEXT_PUBLIC_API_BASE_URL` + optional `/api/proxy/[...path]`
- No database, Prisma, or server-only data layer
- TypeScript strict mode enabled
- ESLint flat config (`eslint.config.mjs`) with Next core-web-vitals + TypeScript
- Prettier configured; lockfiles incorrectly listed in `.prettierignore`
- No `engines` field in `package.json`
- No production site URL / SEO routes (`robots.ts`, `sitemap.ts`, `not-found.tsx`)

---

## Useful pieces to preserve

- UI: Button, Input, Card, Modal (Headless UI), Badge, Alert, Spinner
- States: LoadingState, ErrorState, EmptyState
- Layout primitives: Header, Footer, Layout shell
- Forms pattern: React Hook Form + Zod + `@hookform/resolvers` (ContactForm as pattern reference)
- Utils: `cn`, date/currency formatters, slugify, truncate, debounce, throttle, validators
- QueryProvider skeleton (retain for future admin/client mutations; strip demo hooks)
- Tailwind design-token pattern (CSS variables) — retarget to Creative Marketing brand
- Tooling: ESLint, Prettier, type-check script, strict TS

---

## Demo-only code

- `src/app/page.tsx` — generic starter marketing copy
- `src/app/about/page.tsx` — starter about page
- `src/app/contact/page.tsx` — placeholder contact + fake phone/email
- `src/app/api-demo/page.tsx` — auth/users/logos demo
- `src/components/forms/contact-form.tsx` — simulated submit only
- `src/lib/http.ts` — axios client, token storage, 401 redirect to `/login`
- `src/lib/api/*` — auth, users, logos
- `src/lib/query/*` — demo React Query hooks
- `src/types/api.ts` — external API types / query keys
- `src/app/api/proxy/[...path]/route.ts` — CORS proxy to external API
- Placeholder branding: “YourApp”, “Next.js Starter”

---

## Dead or unused code

- `@heroicons/react` installed but never imported (Lucide is used)
- Button `asChild` prop declared but not implemented (no Slot composition)
- Button variants reference missing CSS classes (`btn`, `btn-primary`, …) — styles broken
- README references `src/lib/query/client.ts` — file does not exist
- Dark-mode CSS class exists; no toggle and conflicts with fixed brand identity
- Footer social links point to `#` with fake company copy

---

## External API assumptions

- Browser talks to Laravel/Express-style API at `NEXT_PUBLIC_API_BASE_URL`
- Optional proxy via `NEXT_PUBLIC_USE_PROXY`
- Timeout via `NEXT_PUBLIC_API_TIMEOUT`
- Auth bearer tokens in `localStorage` (`auth_token`)

**Phase 1 target:** remove external API proxy architecture; use Neon + Prisma on the server.

---

## Authentication assumptions

- Login/register/me/refresh endpoints
- Client-side token persistence
- Auto-clear + redirect on 401

**Phase 1:** no auth/admin. Safe to remove demo auth layer.

---

## Proxy / CORS assumptions

- Entire `api/proxy` route exists only to forward to an external backend
- Not needed once data lives in Neon via server components / server actions

---

## Client-side data fetching patterns

- TanStack React Query for auth, users, logos
- Axios interceptors for auth headers
- Landing/home content is static JSX (not queried)

**Decision:** keep QueryProvider for later admin interactivity; do **not** use React Query for public landing data.

---

## Potential upgrade risks

- Next 16.0.0 → latest 16.x (patch/minor); low risk if peer deps align
- React 19.2.0 → 19.2.x; already on React 19
- Zod already on v4 — keep compatible with `@hookform/resolvers`
- Introducing Prisma 7 requires `prisma.config.ts`, driver adapter, custom client output
- Removing axios may break anything still importing `http` (demo-only today)

---

## Dependency conflicts

- Dual icon libraries (Heroicons unused)
- Competing architecture: external HTTP API vs planned server DB (resolve by removing HTTP demo stack)
- No second ORM planned — Prisma only

---

## Missing production concerns

- No database / env validation
- No server-only boundary for secrets
- No migrations / seed
- No repository/service layers
- No Arabic-first RTL brand foundation
- No `robots.ts` / `sitemap.ts` / `not-found.tsx`
- Secrets would be at risk if someone put DB URLs under `NEXT_PUBLIC_*` (must forbid)
- `.gitignore` ignores `.env*` — need exception for `.env.example`

---

## Files proposed for deletion

| Path                                    | Reason                                              |
| --------------------------------------- | --------------------------------------------------- |
| `src/app/api-demo/`                     | Demo only                                           |
| `src/app/about/`                        | Demo placeholder                                    |
| `src/app/contact/`                      | Demo placeholder + fake contact data                |
| `src/app/api/proxy/`                    | External CORS proxy not needed                      |
| `src/lib/http.ts`                       | External axios client                               |
| `src/lib/api/`                          | Demo API modules                                    |
| `src/lib/query/auth.ts`                 | Demo hooks                                          |
| `src/lib/query/users.ts`                | Demo hooks                                          |
| `src/lib/query/logos.ts`                | Demo hooks                                          |
| `src/types/api.ts`                      | External API types                                  |
| `src/components/forms/contact-form.tsx` | Demo form (pattern preserved via RHF/Zod elsewhere) |
| `env.example`                           | Replaced by `.env.example` with Neon vars           |

---

## Files proposed for modification

| Path                           | Change                                         |
| ------------------------------ | ---------------------------------------------- |
| `package.json`                 | Rename project, engines, scripts, deps         |
| `src/app/layout.tsx`           | Brand fonts, `lang="ar"` `dir="rtl"`, metadata |
| `src/app/globals.css`          | Creative Marketing tokens                      |
| `src/app/page.tsx`             | Move under `(marketing)` minimal proof page    |
| `src/components/layout/*`      | Creative Marketing branding; remove demo nav   |
| `src/components/ui/button.tsx` | Fix missing utility classes                    |
| `src/lib/utils.ts`             | Tighten debounce/throttle typing               |
| `tailwind.config.js`           | Brand fonts / tokens / motion                  |
| `.gitignore`                   | Allow `.env.example`                           |
| `README.md`                    | Point to Phase 1 docs (light update)           |
| `next.config.ts`               | Minimal production-safe options if needed      |

---

## Files proposed for creation

| Path                                               | Purpose                                           |
| -------------------------------------------------- | ------------------------------------------------- |
| `docs/phase-1-*.md`                                | Audit, DB architecture, env setup, summary        |
| `.env.example`                                     | Neon + site URL placeholders                      |
| `prisma/schema.prisma`                             | Full initial schema                               |
| `prisma/migrations/`                               | Initial migration                                 |
| `prisma/seed.ts`                                   | Idempotent seed                                   |
| `prisma.config.ts`                                 | Prisma 7 CLI / DIRECT_URL                         |
| `src/lib/env/server.ts`                            | Zod server env validation                         |
| `src/lib/db/prisma.ts`                             | Neon adapter singleton                            |
| `src/server/repositories/*`                        | Prisma query ownership                            |
| `src/server/services/*`                            | Landing, offers, leads, WhatsApp                  |
| `src/server/actions/submit-lead.action.ts`         | Lead server action                                |
| `src/lib/validation/*`                             | Zod schemas                                       |
| `src/app/(marketing)/`                             | Minimal foundation page + loading/error           |
| `src/app/robots.ts`, `sitemap.ts`, `not-found.tsx` | Basic SEO / 404                                   |
| `scripts/check-database.ts`                        | Connectivity check                                |
| `src/generated/prisma/`                            | Generated Prisma client (gitignored or generated) |

---

## Audit conclusion

The starter is a solid UI + tooling base already on Next 16 / React 19, wrapped around a disposable external-API demo. Phase 1 should strip the demo backend assumptions, keep reusable UI/tooling, and introduce a server-only Neon + Prisma foundation for Creative Marketing.
