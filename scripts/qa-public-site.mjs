// Read-only HTTP smoke checks. No form submissions or admin access.
import assert from "node:assert/strict";
const raw = process.argv[2] || process.env.QA_BASE_URL;
if (!raw) throw new Error("Provide a public URL: npm run qa:smoke -- https://your-site");
const base = new URL(raw);
assert.ok(["http:", "https:"].includes(base.protocol));
const response = await fetch(new URL("/",base), { signal: AbortSignal.timeout(30000) });
assert.equal(response.status,200,"Homepage must return HTTP 200");
const html = await response.text();
for (const id of ["main-content","hero","work","services","packages","process","contact"]) {
  assert.ok(html.includes('id="' + id + '"'),"Missing public section: " + id);
}
assert.ok(/<html[^>]*dir="rtl"/.test(html),"RTL document expected");
const missing = await fetch(new URL("/work/qa-nonexistent-project-98c8e2",base), { signal: AbortSignal.timeout(30000) });
const missingHtml = await missing.text();
assert.ok(missing.status === 404 || (missing.status === 200 && /name="robots"[^>]*content="noindex"/i.test(missingHtml)), "Missing project should return 404 or streamed noindex");
console.log("HTTP smoke checks passed.");
