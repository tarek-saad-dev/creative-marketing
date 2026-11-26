/** Canonical homepage anchors work both on landing and project pages. */
export const marketingNavItems = [
  { name: "أعمالنا", href: "/#work" },
  { name: "خدماتنا", href: "/#services" },
  { name: "مجالاتنا", href: "/#industries" },
  { name: "الباكدجات", href: "/#packages" },
  { name: "طريقة العمل", href: "/#process" },
] as const;

export const marketingPrimaryCta = { name: "ابدأ مشروعك", href: "/#contact" } as const;
