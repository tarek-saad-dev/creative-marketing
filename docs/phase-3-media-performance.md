# Phase 3 — Media & Performance

## Work cards

- Cover (+ optional first media type) only — no full galleries
- `next/image` with role-based `sizes`
- Priority only on the lead card
- Video previews: muted, `playsInline`, poster, pause offscreen, disabled under reduced motion
- At most one intentional autoplay path per visible card; avoid mounting many videos

## Detail pages

- Full ordered gallery loaded only on `/work/[slug]`
- Lightbox does not prefetch all full-resolution assets until opened
- CLS: reserved aspect ratios on media containers

## Images

- Local `/public/...` paths supported
- Remote HTTPS: Cloudinary hostname allowlisted; add hosts as real CDNs appear
- Invalid / unusable URLs are omitted from OG images

## Client props

Cards and case views receive DTO primitives — not full Prisma records.
