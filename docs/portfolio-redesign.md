# Immersive portfolio redesign

This is a public marketing UI redesign; database schema, admin and lead funnel are unchanged.
- Centered brand hero with real, published artwork in a CSS perspective coverflow.
- Manual controls, touch swipes, keyboard arrows, optional user-initiated slideshow, reduced-motion support.
- Full published work wall, including non-featured projects; featured projects lead the display.
- Separate horizontal scroll-snap creative gallery after services, with media-type filters when applicable.
- Video showreel only when a published project has an actual primary video URL.
- If no work is published, four clearly labeled typography-only design studies appear. These are not client projects or performance claims.
- Covers use contain sizing in the new showcase to preserve creative layouts.
- Publication filtering is retained; no draft work is exposed.

## Review checklist
- Run npm run type-check, npm run lint, npm run build.
- Desktop and mobile check with 0, 1, 2, and several published projects.
- Verify unpublished/future/deleted projects do not appear, correct case-study links and media.
- Verify touch scrolling, arrows, focus, reduced-motion and optional slideshow.
- Verify contact form, packages, navigation, and admin unchanged.
- Upload approved real portfolio images/videos via CMS for the intended commercial experience.

## Aurora background
A shared viewport-sized CSS mesh behind the public home page, with three independently animated radial layers, subtle grain, and distinct translucent section washes. No new dependency or WebGL canvas. Pause control and OS reduced-motion are supported. The hero and gallery no longer cover the mesh with opaque backgrounds. Admin styles are unaffected. Browser visual and performance checks are still required, including mobile Safari and reduced-motion.

## Scroll motion and device studio
Uses the installed Framer Motion library for bounded, scroll-linked transform values. A native CSS loop displays up to eight published covers with pause controls, pauses off-screen, and is omitted for fewer than three items. A device mockup with selectable projects, layered covers and scroll parallax follows services. Global decorative motion pause and OS reduced-motion disable the new animated effects. All content is CMS-backed, with clearly labeled concept fallback only when no projects exist. No new dependencies or database changes. Verify mobile/desktop visuals, keyboard focus, pause controls, screen reader labels, and actual portfolio media before declaring production QA complete.

## Interactive services & cinematic section bridges
Replaces the service grid with a keyboard-accessible RTL tab studio, CMS-backed services and linked published project covers, distinct CSS art direction per category, and scoped pointer tilt/spotlight (mouse only). Fallback art is labeled as a service concept. Uses Framer Motion scroll transforms for two decorative typography bridges plus a non-interactive scroll progress bar. Existing lead funnel CTA is retained. Global motion pause also stops coverflow autoplay and new decorative animations. No new dependencies or schema migration. Review Vercel build and test keyboard, touch, pointer, reduced motion, actual published projects and CTA flows before final UI sign-off.

## Creative feed and comparisons
Homepage uses a bounded gallery query (16 published projects, up to 16 media per project), interleaved across projects. Gallery supports image/video filters, load-more, existing accessible dialog lightbox with counter and keyboard navigation. Explicit comparison pairs use matching [before:brand] and [after:brand] prefixes in image captions for the same project. Duplicate sides, same-image pairs and incomplete pairs are excluded. Admin media manager documents the convention; no schema change. No invented transformations or live Instagram API integration. Visual and device QA remains required.

## Final UI polish
Home prioritizes hero, selected projects, services and creative media feed. Moving strip requires three real projects; device studio requires two. Work wall limited to six projects; video rail used as standalone showreel only. Gallery retains all bounded feed items through load-more. Project cards and case-study media preserve artwork with contain sizing and metadata outside art. Canonical home anchors work from detail pages; active nav state on homepage. Mobile CTA respects actual WhatsApp configuration and hides near contact/footer. Branded reduced-motion loading routes added. Remaining: visual QA on real phones, browser screenshots, Web Vitals, real media/official logo, and production CTA tests.
