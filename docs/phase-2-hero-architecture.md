# Phase 2 — Hero Architecture

## Composition layers (back → front)

1. Hero gradient background + soft ambient glows
2. Subtle visual noise overlay
3. Optional hand asset (`/hero/hand-phone.webp`) when present
4. Phone mockup (CSS)
5. Floating content cards (max 4 desktop / 2 mobile)
6. Hero copy (eyebrow, H1, description, CTAs, microcopy)

## Server / client split

| Piece                 | Type              | Why                               |
| --------------------- | ----------------- | --------------------------------- |
| `HeroSection`         | Server            | Shell + data props only           |
| `HeroContent`         | Client            | Reveal / stagger motion           |
| `HeroVisual`          | Client            | Float + parallax + optional image |
| `PhoneMockup`         | Server-renderable | Static CSS                        |
| `FloatingContentCard` | Server-renderable | Static CSS                        |

Page loads `getLandingPageData()` once and passes primitives.

## Content truthfulness

| Condition           | Behavior                                                 |
| ------------------- | -------------------------------------------------------- |
| No active offer     | Neutral English capability eyebrow (not launch scarcity) |
| No published prices | Microcopy: بداية واضحة · تنفيذ منظم · تواصل مباشر        |
| Has prices          | Microcopy may mention أسعار واضحة                        |
| Headline            | DB title; highlight `براند يبان` with gradient           |

## Hand asset contract

Drop file at `public/hero/hand-phone.webp` (~1040×1280, transparent).  
`heroHandAssetExists()` enables the layer without restructuring.

Until then: polished phone + cards fallback only.

## Motion

- Text reveal + staggered CTAs
- Slow floating cards
- Desktop-only small pointer parallax (Motion Values)
- Reduced-motion: static layout, no float/parallax
