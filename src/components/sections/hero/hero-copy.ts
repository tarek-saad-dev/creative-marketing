export const HERO_HAND_ASSET = "/hero/hand-phone.webp";

export type HeroCopy = {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  microcopy: string;
  highlightPhrase: string;
};

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function buildHeroCopy(input: {
  settings: Record<string, unknown>;
  hasActiveOffer: boolean;
  hasPublishedPrices: boolean;
}): HeroCopy {
  const { settings, hasActiveOffer, hasPublishedPrices } = input;

  const seededBadge = asString(settings["landing.hero.badge"]);
  const eyebrow = hasActiveOffer
    ? seededBadge || "عرض الإطلاق متاح لفترة محدودة"
    : "Creative strategy · Content · Design · Growth";

  const title =
    asString(settings["landing.hero.title"]) ||
    "نحوّل مشروعك من مجرد صفحة إلى براند يبان، يتفهم، ويتباع.";

  const description =
    asString(settings["landing.hero.description"]) ||
    "استراتيجية، محتوى، تصميم وإدارة سوشيال ميديا تساعد مشروعك يظهر باحتراف ويكسب ثقة العميل من أول نظرة.";

  const primaryCta = asString(settings["landing.hero.primaryCta"], "شوف شغلنا");
  const secondaryCta = asString(
    settings["landing.hero.secondaryCta"],
    "استكشف الباكدجات"
  );

  const microcopySetting = asString(settings["landing.hero.microcopy"]);
  const pricingMicrocopySetting = asString(
    settings["landing.hero.pricingMicrocopy"]
  );

  const microcopy = hasPublishedPrices
    ? pricingMicrocopySetting ||
      "بدون مكالمات طويلة · أسعار واضحة · بداية سريعة"
    : microcopySetting || "بداية واضحة · تنفيذ منظم · تواصل مباشر";

  const highlightPhrase = title.includes("براند يبان")
    ? "براند يبان"
    : title.includes("يتفهم، ويتباع")
      ? "يتفهم، ويتباع"
      : "";

  return {
    eyebrow,
    title,
    description,
    primaryCta,
    secondaryCta,
    microcopy,
    highlightPhrase,
  };
}

export function splitTitleWithHighlight(
  title: string,
  highlightPhrase: string
): { before: string; highlight: string; after: string } {
  if (!highlightPhrase || !title.includes(highlightPhrase)) {
    return { before: title, highlight: "", after: "" };
  }
  const index = title.indexOf(highlightPhrase);
  return {
    before: title.slice(0, index),
    highlight: highlightPhrase,
    after: title.slice(index + highlightPhrase.length),
  };
}

export function buildContactAndSocialLinks(settings: Record<string, unknown>) {
  const contactLinks: Array<{
    label: string;
    href: string;
    external?: boolean;
  }> = [];
  const socialLinks: Array<{
    label: string;
    href: string;
    external?: boolean;
  }> = [];

  const email = asString(settings["brand.email"]).trim();
  const whatsapp = asString(settings["brand.whatsapp"]).trim();
  const instagram = asString(settings["brand.instagram"]).trim();
  const facebook = asString(settings["brand.facebook"]).trim();
  const behance = asString(settings["brand.behance"]).trim();

  if (email) {
    contactLinks.push({ label: email, href: `mailto:${email}` });
  }
  if (whatsapp) {
    const digits = whatsapp.replace(/\D/g, "");
    if (digits) {
      contactLinks.push({
        label: "واتساب",
        href: `https://wa.me/${digits}`,
        external: true,
      });
    }
  }

  if (instagram) {
    socialLinks.push({
      label: "Instagram",
      href: instagram,
      external: true,
    });
  }
  if (facebook) {
    socialLinks.push({ label: "Facebook", href: facebook, external: true });
  }
  if (behance) {
    socialLinks.push({ label: "Behance", href: behance, external: true });
  }

  return { contactLinks, socialLinks };
}
