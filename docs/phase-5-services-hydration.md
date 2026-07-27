# Phase 5 — `/admin/services` Hydration Investigation

**Date:** 2026-07-24  
**Status:** Resolved (application-level). Cursor IDE browser `data-cursor-ref` injection can still produce false-positive Next.js hydration overlays during MCP snapshots — those must not be treated as product defects.

## Reproduction (historical)

Observed intermittently in Phase 5C near `EditServiceDialog` / Headless UI IDs when:

1. Direct load of `/admin/services`
2. Client navigation Dashboard → Services
3. Hard refresh
4. Back/forward
5. Opening/closing edit dialogs rapidly
6. Concurrent navigation while many row-level dialogs were mounted

## Root cause

Two compounding issues:

### 1. One Headless UI `Dialog` per table row (primary)

`src/app/admin/services/page.tsx` rendered `EditServiceDialog` inside every row (~16 dialogs). Each `AdminFormDialog` kept a Headless UI `Dialog` mounted while `open={false}`, allocating `useId()` trees for every row.

Under Next.js 16 / React 19 concurrent navigation, that large closed-dialog tree produced intermittent server/client ID mismatches.

### 2. Cursor browser snapshot artifact (false positive)

When Cursor IDE browser takes an accessibility snapshot, it injects `data-cursor-ref="eN"` attributes into the live DOM. Next.js then reports a hydration diff such as:

```text
- data-cursor-ref="e90"
+ دعم الحملات
```

pointing at `ServicesAdminTable`. A clean reload **without** snapshots shows:

- `openIssue: false`
- no “Hydration failed / did not match” overlay content
- `headlessui-dialog` count `0` while idle
- zero `data-cursor-ref` nodes

## Fix

| Change                                               | Purpose                                                             |
| ---------------------------------------------------- | ------------------------------------------------------------------- |
| `ServicesAdminTable` with **one shared** edit dialog | Identical initial SSR/client tree; dialog mounts only while editing |
| Client-safe DTO (no `Date` fields)                   | Avoid RSC→client date serialization surprises                       |
| `AdminFormDialog` mounts Dialog **only when open**   | Same pattern for create + other CMS dialogs                         |
| `AdminMobileNav` mounts Dialog only when open        | Layout-level Headless UI no longer always mounted                   |
| Stable `key={editing.id}` on `ServiceForm`           | Correct form reset when switching rows                              |

### Files changed

- `src/app/admin/services/page.tsx`
- `src/components/admin/services/services-admin-table.tsx` (new)
- `src/components/admin/services/service-form-dialog.tsx` (create-only)
- `src/components/admin/services/service-form.tsx` (`ServiceFormModel`)
- `src/components/admin/admin-form-dialog.tsx`
- `src/components/admin/admin-mobile-nav.tsx`

## Why SSR and accessibility are preserved

- The services **page remains a Server Component**; only the table/dialog island is client.
- No `suppressHydrationWarning`.
- No disabling SSR for the admin app or the services route.
- Edit trigger remains a normal `<button>`; Headless UI still provides focus trap, Escape, and labelled title when the single dialog is open.
- Closed state renders zero dialog portals — better for a11y tree noise and performance.

## Verification

### Development (PID 24460, `http://localhost:3000`)

| Scenario                                          | Result                                              |
| ------------------------------------------------- | --------------------------------------------------- |
| Direct `/admin/services` (CDP, no snapshot)       | No hydration overlay / no console hydration errors  |
| Open/close multiple edit dialogs                  | Pass                                                |
| Rapid sequential edit opens                       | Pass                                                |
| Idle Headless UI dialog count                     | `0`                                                 |
| Snapshot-triggered overlay with `data-cursor-ref` | May appear — **tooling artifact**, not a regression |

### Production

`npm run build` must pass as part of Phase 5D final suite. Serve production locally when practical; the fix is structural (fewer mounted dialogs), not environment-specific.

## Operator note

When verifying hydration in Cursor browser automation:

1. Prefer CDP `Runtime.evaluate` / console hooks **before** `browser_snapshot`.
2. Ignore diffs whose only mismatch is `data-cursor-ref`.
3. Confirm with a hard navigation that leaves `document.querySelectorAll('[data-cursor-ref]').length === 0`.
