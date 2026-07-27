# Phase 5 — Content Management

Structured admin editors for site content. Public repositories remain read-only and publication-gated.

## Modules

| Module                | Route                                           | Status                                                      |
| --------------------- | ----------------------------------------------- | ----------------------------------------------------------- |
| Settings (structured) | `/admin/settings`                               | Implemented — Brand/Contact/Social/Hero/SEO                 |
| Projects              | `/admin/projects`, `/new`, `/[id]`              | Implemented — form, checklist, media manager                |
| Services              | `/admin/services`                               | Implemented — dialog CRUD by THINK/CREATE/BUILD/GROW        |
| Packages              | `/admin/packages` (+ `/new`, `/[id]` redirects) | Implemented — dialog editor; drafts without invented prices |
| Offers                | `/admin/offers` (+ `/new`, `/[id]` redirects)   | Implemented — effective status calculation                  |
| Testimonials          | `/admin/testimonials`                           | Implemented — requires publicApprovalConfirmed to publish   |
| Trust metrics         | `/admin/trust`                                  | Implemented — verified + active for public                  |
| Client logos          | `/admin/client-logos`                           | Implemented                                                 |
| FAQs                  | `/admin/faqs`                                   | Implemented                                                 |

## Publication guards

- Projects require title, slug, industry, summary, cover URL, cover alt before publish.
- Packages block public price `0` / null and empty feature sets.
- Testimonials require approval confirmation.
- Trust metrics require verified + active for public output.

## Mutation flow

Client form → Zod → Server Action (`withAdminMutation`) → service → repository/transaction → audit → targeted revalidation.
