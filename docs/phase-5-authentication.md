# Phase 5 — Authentication

## Library

**Auth.js (next-auth v5 / `@auth/core`)** with the **Credentials** provider and **JWT** sessions.

Why:

- Compatible with Next.js App Router, Server Components, and Server Actions
- HttpOnly session cookies managed by Auth.js
- No public registration surface
- Works with Prisma + Neon without requiring a full OAuth adapter for Phase 5

## Session architecture

- Strategy: JWT (no `AdminSession` table)
- Cookie: Auth.js default session cookie (HttpOnly; Secure in production; SameSite)
- Max age: 12 hours (`src/auth.config.ts`)
- Session payload includes `id`, `email`, `name`, `role` only — never `passwordHash`

## Password hashing

- `bcryptjs` with 12 rounds (`src/server/auth/password.ts`)
- Verification via `bcrypt.compare` (constant-time library path)

## Route protection

1. `src/middleware.ts` — edge gate for `/admin/*` except `/admin/login`
2. `src/app/admin/(app)/layout.tsx` — `requireAdmin()` on every protected page
3. Mutations — `withAdminMutation()` / `requireRole()` server-side

Client role checks are never trusted.

## Roles

| Role   | Access                     |
| ------ | -------------------------- |
| OWNER  | Full                       |
| ADMIN  | Content + Leads + settings |
| EDITOR | Content editing            |
| VIEWER | Read-only                  |

## Creating the first admin

```bash
npx tsx scripts/create-admin.ts --name "Full Name" --email "you@example.com" --password "StrongPassw0rd!" --role OWNER
```

On Windows PowerShell, prefer `npx tsx ...` over `npm run admin:create -- ...` so flags are not swallowed by npm.

Never commit credentials. Never seed a default admin.

## Login testing (executed)

- Login page loads without marketing chrome
- Wrong/missing credentials show generic Arabic error
- Successful login redirects to `/admin` dashboard with real counts
- Session shows admin name/email/role; sign-out available
