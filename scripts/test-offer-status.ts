/**
 * Deterministic offer-status unit tests (no Neon mutation).
 */
import assert from "node:assert/strict";
import {
  computeOfferStatus,
  getRemainingSlots,
  resolvePublicOfferStatus,
} from "../src/lib/offers/offer-status";
import type { OfferStatus } from "../src/generated/prisma";

function offer(partial: {
  startsAt: Date;
  endsAt: Date;
  maxSlots?: number | null;
  bookedSlots?: number;
  status?: OfferStatus;
  isActive?: boolean;
}) {
  return {
    startsAt: partial.startsAt,
    endsAt: partial.endsAt,
    maxSlots: partial.maxSlots ?? null,
    bookedSlots: partial.bookedSlots ?? 0,
    status: partial.status ?? ("ACTIVE" as OfferStatus),
    isActive: partial.isActive ?? true,
  };
}

const start = new Date("2026-07-01T00:00:00.000Z");
const end = new Date("2026-07-31T23:59:59.000Z");

assert.equal(
  computeOfferStatus(
    offer({ startsAt: start, endsAt: end, isActive: false }),
    start
  ),
  "disabled"
);
assert.equal(
  computeOfferStatus(
    offer({ startsAt: start, endsAt: end, status: "DRAFT" }),
    start
  ),
  "disabled"
);
assert.equal(
  computeOfferStatus(
    offer({ startsAt: start, endsAt: end }),
    new Date("2026-06-30T23:59:59.000Z")
  ),
  "upcoming"
);
assert.equal(
  computeOfferStatus(offer({ startsAt: start, endsAt: end }), start),
  "active"
);
assert.equal(
  computeOfferStatus(offer({ startsAt: start, endsAt: end }), end),
  "active"
);
assert.equal(
  computeOfferStatus(
    offer({ startsAt: start, endsAt: end }),
    new Date("2026-08-01T00:00:00.000Z")
  ),
  "expired"
);
assert.equal(
  computeOfferStatus(
    offer({ startsAt: start, endsAt: end, maxSlots: null, bookedSlots: 99 }),
    start
  ),
  "active"
);
assert.equal(
  computeOfferStatus(
    offer({ startsAt: start, endsAt: end, maxSlots: 5, bookedSlots: 2 }),
    start
  ),
  "active"
);
assert.equal(
  computeOfferStatus(
    offer({ startsAt: start, endsAt: end, maxSlots: 3, bookedSlots: 3 }),
    start
  ),
  "full"
);
assert.equal(getRemainingSlots(null, 2), null);
assert.equal(getRemainingSlots(5, 2), 3);

assert.equal(
  resolvePublicOfferStatus(offer({ startsAt: start, endsAt: end }), 0, start),
  "invalid"
);
assert.equal(
  resolvePublicOfferStatus(offer({ startsAt: start, endsAt: end }), 1, start),
  "active"
);

console.log("Offer status tests passed.");
