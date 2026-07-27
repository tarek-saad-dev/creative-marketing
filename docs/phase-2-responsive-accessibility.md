# Phase 2 — Responsive & Accessibility

## Responsive decisions

- Fixed header with transparent → elevated scroll state (no layout shift)
- Mobile menu: Headless UI `Dialog` + focus/escape + body scroll lock
- Sticky WhatsApp CTA: mobile only, after hero, hidden near footer
- Hero stacks content → visual on small screens
- Floating cards reduced on mobile
- `scroll-mt-nav` on section anchors for sticky header offset

## Accessibility checklist

- Skip-to-content link
- One primary `h1` in Hero
- Semantic `nav` / `main` / `footer` / section headings
- Visible `:focus-visible` rings
- Mobile menu labeled open/close
- Decorative hero visual `aria-hidden`
- Logo link has accessible name
- Reduced-motion disables float/parallax/reveal animation
- Touch targets ≥ 44px on CTAs and icon buttons
- No information only on hover
- No empty `href="#"` / fake contact links

## Contrast

- Soft white on indigo backgrounds for primary text
- Cool gray (`--foreground-muted`) for secondary — kept high enough on deep indigo
- Gradient text used only on short emphasis phrases atop dark surfaces

## Fallbacks

Missing offer / prices / metrics / logos / contacts / hand asset → truthful UI (documented in summary).
