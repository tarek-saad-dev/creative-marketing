# Phase 5 — Permissions

| Capability                          | OWNER | ADMIN | EDITOR       | VIEWER |
| ----------------------------------- | ----- | ----- | ------------ | ------ |
| Dashboard / read content            | ✓     | ✓     | ✓            | ✓      |
| Site settings                       | ✓     | ✓     | —            | —      |
| Projects / media / services         | ✓     | ✓     | ✓            | read   |
| Packages / offers                   | ✓     | ✓     | draft edit\* | read   |
| Testimonials / logos / FAQs / trust | ✓     | ✓     | ✓            | read   |
| Lead status / notes                 | ✓     | ✓     | —            | read   |
| Audit log                           | ✓     | ✓     | —            | —      |
| Raw setting keys / security         | ✓     | —     | —            | —      |
| Cloudinary signature                | ✓     | ✓     | ✓            | —      |

\* Publication policies enforced in services; EDITOR may be blocked from publish where policy requires ADMIN+.

Automated checks: `npm run admin:test-permissions`.
