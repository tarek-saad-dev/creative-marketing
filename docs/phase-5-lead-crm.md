# Phase 5 — Lead CRM

## List (`/admin/leads`)

Server-side filters via URL params: search, status, package, source, utmSource, date range, sort, pagination.

Phone numbers are masked in list views. Full message/session payloads are not loaded in the list.

Mobile uses cards; desktop uses a compact table.

## Detail (`/admin/leads/[id]`)

- Full contact fields
- Lead status transitions (ADMIN/OWNER)
- Internal note (`Lead.internalNote`) — never public; audit logs length only
- Assignment
- LeadEvent history

## Allowed transitions

```
NEW → CONTACTED → QUALIFIED → WON|LOST
any of the above → ARCHIVED
```

OWNER/ADMIN may correct status with explicit confirmation.

Each transition: validate → update Lead → LeadEvent → AdminAuditLog → revalidate list/detail.
