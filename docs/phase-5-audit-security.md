# Phase 5 — Audit & Security

## Session

Auth.js Credentials + JWT. HttpOnly cookies. Roles: OWNER, ADMIN, EDITOR, VIEWER.

## Authorization

- Middleware protects `/admin/*` (except login).
- Layout `requireAdmin` / page `requireRole`.
- Every mutation uses `withAdminMutation` with minimum role — UI hiding is not sufficient.

## Audit UI (`/admin/audit`)

Filters: admin, action, entity type, date range. Pagination. Safe metadata summary only.

Never shown: password hashes, session tokens, DB URLs, Cloudinary secrets, full Lead private payloads.

## Settings audit

Structured settings log **changed keys only**, not full before/after values.
