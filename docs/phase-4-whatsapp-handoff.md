# Phase 4 — WhatsApp Handoff

1. Persist Lead first.
2. Build Arabic message via `buildWhatsAppMessage`.
3. Build `wa.me` URL from SiteSetting `brand.whatsapp` digits.
4. Attempt `window.open` after success.
5. Record `WHATSAPP_OPENED`.
6. Always show copy + retry fallback.
7. If number missing: save lead, copy-only guidance, no broken URL.
