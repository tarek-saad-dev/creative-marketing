# Phase 2 — Visual Audit

**Date:** 2026-07-21  
**Scope:** Marketing shell, Hero, Trust layer (pre-implementation)

---

## Existing reusable layout code

| Piece                                                         | Status                                                                                  |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `Layout` (Header + main + Footer)                             | Basic shell; header is client, footer is server                                         |
| `Header`                                                      | Minimal nav (الرئيسية only); custom mobile panel (not Headless UI); no scroll elevation |
| `Footer`                                                      | Brand + slogan + home link only                                                         |
| `QueryProvider`                                               | Retained for future admin; wraps entire app                                             |
| Marketing `(marketing)/page.tsx`                              | Phase 1 proof page; **imports Prisma directly** for draft packages (boundary smell)     |
| `loading.tsx` / `error.tsx`                                   | Accessible, brand-colored, reusable                                                     |
| UI: Button, Input, Card, Modal, Badge, Alert, Spinner, states | Keep for forms/admin later; not Hero-specific                                           |

---

## Existing brand token coverage

Present in `globals.css`:

- Raw brand hex (`--cm-*`)
- Semantic: background, foreground, primary, secondary, muted, accent, border, radius
- Motion durations + easing
- Font headline/body stacks (Arabic-primary via CSS order)
- `.container-brand`, `.section-space`

Gaps vs Phase 2 requirements:

- Missing elevated/deep/surface/glass semantic tokens
- Missing separate AR/EN font CSS variables (`--font-heading-ar`, etc.)
- Missing z-index scale, nav height, wide/reading widths
- Missing gradient utility tokens for CTA / highlight phrases
- Typography fluid scale not systematized

---

## Accessibility behavior

- `lang="ar"` `dir="rtl"` on `<html>`
- Focus-visible outline present
- Spinner has `role="status"`
- Marketing error has retry
- Header mobile menu: **missing** Headless UI Dialog, Escape/focus trap incomplete, no body scroll lock
- No skip-to-content link
- No sticky header offset for anchors

---

## Responsive behavior

- Container uses `100% - 2rem` padding
- Header collapses to menu on `lg`
- Proof page is single-column only
- No Hero visual / trust strip yet
- No mobile sticky CTA

---

## Assets currently available

```text
public/file.svg, globe.svg, next.svg, vercel.svg, window.svg  (starter leftovers)
src/app/favicon.ico
```

**No official Creative Marketing logo.**  
**No hero hand/phone artwork.**  
**No Open Graph image.**

---

## Missing assets

| Asset                           | Notes                                      |
| ------------------------------- | ------------------------------------------ |
| Official logo / wordmark / mark | Use temporary text/monogram fallback       |
| `/hero/hand-phone.webp`         | Optional layer; transparent 3D hand+phone  |
| Phone screen artwork            | CSS mockup fallback                        |
| Floating card art               | CSS/HTML cards                             |
| OG image                        | Metadata without image URL until available |

---

## Components to preserve

- Button (base styles; add BrandButton for marketing CTAs)
- Modal (Headless UI) pattern for future
- Spinner / Loading / Error / Empty states
- `cn`, utils
- Font loading via `next/font`
- Landing service + typed `LandingPageData`

## Components to replace / upgrade

- `Header` → premium scroll-aware MarketingHeader + Headless UI Disclosure/Dialog
- `Footer` → data-driven foundation footer
- `Layout` → thinner root; marketing page owns shell composition
- Marketing proof page → real Hero + Trust + anchors
- Remove direct `prisma` import from page

---

## Client/server boundary problems

1. Proof page imports `@/lib/db/prisma` (server-only OK, but bypasses repository/service).
2. Entire Header is client solely for mobile menu — acceptable if isolated.
3. Root Layout wraps all routes in QueryProvider + Layout — fine; Header always client.

Phase 2 plan: page stays Server Component; pass primitives into small client islands (nav scroll, mobile menu, sticky CTA, hero parallax/float).

---

## Performance risks

- `background-attachment: fixed` can be costly on mobile — prefer static gradient on small screens
- Uncontrolled backdrop-blur layers
- Making whole Hero a Client Component (avoid)
- Large PNG hands (none yet)
- QueryProvider wrapping marketing (acceptable; low cost)

---

## Proposed Phase 2 component architecture

```text
src/app/(marketing)/page.tsx                 # Server: getLandingPageData once
src/components/layout/marketing-header.tsx   # Client island
src/components/layout/mobile-sticky-cta.tsx  # Client island
src/components/layout/marketing-footer.tsx   # Server
src/components/brand/logo.tsx                # Server fallback logo
src/components/sections/hero/*               # Mixed: server shell + client motion
src/components/sections/trust-strip.tsx      # Server (+ optional client marquee later)
src/components/sections/portfolio-preview.tsx
src/components/sections/future-anchors.tsx
src/components/ui/*                          # container, glass-card, brand-button, …
src/components/motion/*                      # reveal, stagger, floating, parallax, reduced-motion
public/brand/, public/hero/, public/textures/
```

---

## Audit conclusion

Phase 1 tokens and fonts are a solid base. The proof page and starter chrome must be replaced with a premium marketing shell and Hero that stay truthful about missing offers, prices, metrics, logos, and contact data. No official visual assets exist yet — build CSS/HTML composition with a documented optional hand layer.
