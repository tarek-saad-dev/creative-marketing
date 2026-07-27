# Phase 4 — Offer & Pricing Rules

## Packages

Public only when published, priced `> 0`, complete copy, currency set, `idealFor` set, ≥1 feature.

## Offers

`computeOfferStatus` → upcoming/active/full/expired/disabled.  
`resolvePublicOfferStatus` adds **invalid** when time-valid but zero eligible offer packages.

Active offer prices apply only when `offerPrice > 0` and `< originalPrice`.

Savings use integer minor-unit math (`decimal-price.ts`) — no float money.

Countdown mounts only for active offers; ends at server `endsAt`.
