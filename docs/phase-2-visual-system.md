# Phase 2 — Visual System

## Color tokens

Raw brand palette remains under `--cm-*`. Semantic tokens:

| Token                                                          | Role              |
| -------------------------------------------------------------- | ----------------- |
| `--background` / `--background-elevated` / `--background-deep` | Page layers       |
| `--foreground` / `--foreground-muted`                          | Text              |
| `--surface` / `--surface-light` / `--surface-glass`            | Cards & glass     |
| `--primary` / `--primary-hover`                                | Aqua CTA          |
| `--accent` / `--accent-secondary`                              | Cyan / violet     |
| `--border` / `--border-strong` / `--focus-ring`                | Structure & focus |
| `--shadow-soft` / `--shadow-card` / `--shadow-floating`        | Depth             |

Gradients: `--gradient-hero`, `--gradient-highlight`, `--gradient-cta`, `--gradient-accent-soft`.

## Typography

| Role      | Arabic                                  | English                    |
| --------- | --------------------------------------- | -------------------------- |
| Headlines | Alexandria (`--font-heading-ar`)        | Sora (`--font-heading-en`) |
| Body      | IBM Plex Sans Arabic (`--font-body-ar`) | Manrope (`--font-body-en`) |

Fluid display sizes: `text-display-xl`, `text-display-lg`, `text-display-md`.

Arabic headline stays full opacity. Gradient text is limited to short highlight phrases.

## Layout

- `--container-max` 72rem, `--container-wide` 84rem, `--container-reading` 42rem
- Side padding: mobile / tablet / desktop tokens
- `--nav-height`, `--section-space`
- Z-index: elevated → sticky → header → overlay → modal → toast
- Radius: sm → xl + pill

Use `Container` (`default` | `wide` | `reading`) instead of ad-hoc widths.

## Motion

| Token               | Value                          |
| ------------------- | ------------------------------ |
| `--motion-fast`     | 150ms                          |
| `--motion-base`     | 280ms                          |
| `--motion-slow`     | 480ms                          |
| `--ease-standard`   | cubic-bezier(0.22, 1, 0.36, 1) |
| `--ease-emphasized` | cubic-bezier(0.16, 1, 0.3, 1)  |

Primitives: `Reveal`, `Stagger`, `FloatingElement`, `MouseParallax` — all respect reduced motion / touch.

## Responsive rules

- Desktop: hero two-column composition with overlapping visual balance
- Tablet: reduced card spread
- Mobile: content first, visual below; two floating cards; no pointer parallax
- Sticky mobile CTA after hero; hides near footer; safe-area aware
