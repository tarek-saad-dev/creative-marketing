# Phase 4 — Lead Funnel

## Approach

Server Actions for session + submit (no separate Route Handler).

Opaque `sessionToken` in `sessionStorage` only.

## Steps

1 Contact → 2 Business → 3 Needs → 4 Budget → 5 Review

## Events

FORM_OPENED, PACKAGE_SELECTED, STEP_COMPLETED, FORM_SUBMITTED, WHATSAPP_OPENED, FORM_ABANDONED (on close after progress).

## Idempotency

Re-submit on an already-linked session returns the existing lead (`alreadySubmitted`) without creating a second Lead.

## Guards

Honeypot `website`, minimum form completion time (~2.5s), server Zod + public package re-check.
