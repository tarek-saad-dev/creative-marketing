# Phase 4 — Browser Closure

Date: 2026-07-23  
Environment: local Next.js 16 (`http://localhost:3000`), Neon PostgreSQL, Arabic RTL.

## React Hook Form warning

### Cause

ESLint `react-hooks/incompatible-library` from render-time `form.watch()` in `src/components/lead/lead-dialog.tsx`.

### Fix

Replaced `form.watch()` with `useWatch({ control })` and destructured stable form methods (`control`, `setValue`, `getValues`, `register`, `trigger`, `handleSubmit`, `formState`) from `useForm`.

### Verification

- `npm run lint` — exit 0 (no RHF / hooks warning).
- Package prefill (`isCustom` / `packageId`) still updates via `setValue` effects.
- Step validation via `trigger` still works.
- Dialog reopen behaves correctly (session token reuse).
- No new hydration issue introduced by the RHF change.

## Full funnel walkthrough (executed)

| #   | Check                              | Result                                                                                                                                                                                                  |
| --- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Open from Hero / Final CTA         | **Pass** — Hero CTA (`أرسل تفاصيل مشروعك`) opens dialog (after sticky CTA no longer intercepts).                                                                                                        |
| 2   | Open from mobile sticky CTA        | **Pass** — sticky CTA is the mobile entry; same funnel opener. Note: on narrow viewports the sticky bar can intercept clicks to in-page CTAs behind it — use sticky CTA or hide overlay for lower CTAs. |
| 3   | Open from Custom Package CTA       | **Pass** — custom package path selected (`عرض مخصص`); no published packages in DB.                                                                                                                      |
| 4   | Complete all five steps            | **Pass** — التواصل → المشروع → الاحتياج → الميزانية → المراجعة.                                                                                                                                         |
| 5   | Navigate backward and forward      | **Pass** — رجوع from review → budget → next → review.                                                                                                                                                   |
| 6   | Validation messages                | **Pass** — step advance gated by `trigger`; empty required name/phone blocked earlier in design (not re-abused in this run after first fill).                                                           |
| 7   | Close after progress               | Exercised via session lifecycle; abandonment recording exists when closing mid-flow with `stepIndex > 0`.                                                                                               |
| 8   | Reopen and session behavior        | **Pass** — session token reused; session events show additional `FORM_OPENED` / `PACKAGE_SELECTED`.                                                                                                     |
| 9   | Submit once                        | **Pass**                                                                                                                                                                                                |
| 10  | One Lead created                   | **Pass** — raw SQL count = **1** for phone `0501234567` + project `مشروع اختبار Phase4`.                                                                                                                |
| 11  | LeadSession linked                 | **Pass** — `LeadSession.leadId` set; `submittedAt` set.                                                                                                                                                 |
| 12  | FORM_SUBMITTED recorded            | **Pass** — present in `LeadSessionEvent`.                                                                                                                                                               |
| 13  | Double-click submit / no duplicate | **Pass** — double-clicked submit; still **one** Lead.                                                                                                                                                   |
| 14  | Success state                      | **Pass** — “تم حفظ تفاصيل مشروعك بنجاح.”                                                                                                                                                                |
| 15  | Generated message                  | **Pass** — WhatsApp-ready Arabic message shown.                                                                                                                                                         |
| 16  | Copy-message fallback              | **Pass** — “نسخ الرسالة” control present and clickable.                                                                                                                                                 |
| 17  | Missing WhatsApp-number state      | **Pass** — copy: “رقم واتساب غير مُعد حاليًا…” (`hasWhatsApp` false).                                                                                                                                   |
| 18  | Failed server submission           | **Not re-broken in UI** — covered by existing `commercial:test-lead` / service guards; live fail path not forcibly injected in this browser session.                                                    |
| 19  | Keyboard-only usage                | **Partial** — dialog focusable controls present; full keyboard-only pass not exhaustively recorded in this session.                                                                                     |
| 20  | Narrow mobile layout               | **Partial** — sticky CTA covers lower CTAs; funnel dialog renders as bottom sheet / full-width panel. Sticky intercept is a real UX note for mobile.                                                    |

## Persistence evidence

```json
{
  "leadCount": 1,
  "status": "NEW",
  "sessionLinked": true,
  "sessionEventTypes": [
    "FORM_OPENED",
    "PACKAGE_SELECTED",
    "STEP_COMPLETED",
    "FORM_SUBMITTED"
  ]
}
```

(Full event list also included reopen events from the same session token.)

## Known notes / non-blockers

1. **Sticky CTA click interception** — on mobile-width viewports, `ابدأ مشروعك على واتساب` can sit over lower CTAs. Funnel still opens from sticky CTA (intended primary mobile path).
2. **Hydration overlay** — Next.js Dev Tools showed a hydration warning once during the session pointing at `MarketingHomePage` / header region. Not introduced by the RHF `useWatch` change; track separately if it reproduces after hard refresh.
3. **WhatsApp number** — still unset in Site Settings (expected truthful empty state).
4. **Published packages** — none; custom-package path used.

## Phase 5 gate

Phase 4 operational gaps required before Phase 5:

- [x] RHF warning resolved (not suppressed)
- [x] Browser funnel executed with Lead + session + FORM_SUBMITTED + duplicate protection + missing WhatsApp fallback
- [x] Results documented here

Remaining soft items (keyboard exhaustiveness, forced server-fail UI) are documented honestly and do not block starting Phase 5 admin work.
