/**
 * Shared marketing navigation config.
 * Anchors point to Phase 2 structural IDs; full sections arrive in later phases.
 */
export const marketingNavItems = [
  { name: "أعمالنا", href: "#work" },
  { name: "خدماتنا", href: "#services" },
  { name: "الباكدجات", href: "#packages" },
  { name: "طريقة العمل", href: "#process" },
] as const;

export const marketingPrimaryCta = {
  name: "ابدأ مشروعك",
  href: "#contact",
} as const;
