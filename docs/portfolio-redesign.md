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
