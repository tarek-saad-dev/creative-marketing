import "server-only";

export {
  computeOfferStatus,
  resolvePublicOfferStatus,
  getRemainingSlots,
  pickCurrentPublicOffer,
  pickCurrentActiveOffer,
  type ComputedOfferStatus,
  type OfferLike,
} from "@/lib/offers/offer-status";
