# Phase 5 — Admin Architecture

## Route map

| Path                                                                              | Access                  |
| --------------------------------------------------------------------------------- | ----------------------- |
| `/admin/login`                                                                    | Public                  |
| `/admin`                                                                          | Authenticated dashboard |
| `/admin/settings`                                                                 | Authenticated           |
| `/admin/projects`, `/new`, `/[id]`                                                | Authenticated           |
| `/admin/services`                                                                 | Authenticated           |
| `/admin/packages`, `/offers`, `/testimonials`, `/trust`, `/client-logos`, `/faqs` | Authenticated           |
| `/admin/leads`, `/admin/leads/[id]`                                               | Authenticated           |
| `/admin/audit`                                                                    | Authenticated           |

Layout split:

- `src/app/admin/layout.tsx` — root (no marketing shell)
- `src/app/admin/login/page.tsx` — public login
- `src/app/admin/(app)/layout.tsx` — indigo shell + `requireAdmin()`

## Mutation flow

```text
Admin Form → Client Zod (where used) → Server Action
→ requireAdmin / withAdminMutation → Zod (server)
→ Service → Prisma → AdminAuditLog → revalidate → typed result
```

Helpers:

- `requireAdmin()` / `requireRole()` — `src/server/auth/require-admin.ts`
- `withAdminMutation()` — `src/server/auth/admin-mutation.ts`
- `logAdminAction()` — `src/server/services/admin-audit.service.ts`

## Visual system

Soft white working surface, indigo sidebar (`#312E81`), violet accents, dark navy text, compact operational typography. Mobile horizontal nav + sign-out.

## Implementation status note

Foundation (auth, schema, shell, dashboard, leads list/detail, project list, verification scripts) is live. Several content editors remain as protected placeholders pending full form/media wiring (settings forms, project editor + Cloudinary, package/offer editors, etc.). See `docs/phase-5-summary.md`.
