import type { ServiceCategory } from "@/generated/prisma";

export const SERVICE_CATEGORY_ORDER: ServiceCategory[] = [
  "THINK",
  "CREATE",
  "BUILD",
  "GROW",
];

/**
 * Editorial category framing — not a substitute for seeded service rows.
 * Service names/summaries always come from the database.
 */
export const SERVICE_CATEGORY_META: Record<
  ServiceCategory,
  {
    labelEn: string;
    titleAr: string;
    descriptionAr: string;
  }
> = {
  THINK: {
    labelEn: "THINK",
    titleAr: "نفهم قبل ما نصمّم",
    descriptionAr:
      "تحليل النشاط والمنافسين، ثم استراتيجية محتوى وخطة إطلاق واضحة.",
  },
  CREATE: {
    labelEn: "CREATE",
    titleAr: "نصنع محتوى يبان",
    descriptionAr:
      "تصاميم سوشيال، كتابة، إنتاج محتوى، وريلز قصيرة بهوية متماسكة.",
  },
  BUILD: {
    labelEn: "BUILD",
    titleAr: "نبني هوية وأنظمة",
    descriptionAr:
      "هوية بصرية، أنظمة براند، صفحات هبوط، وأصول حملات جاهزة للنمو.",
  },
  GROW: {
    labelEn: "GROW",
    titleAr: "نستمر وننمّي الحضور",
    descriptionAr: "إدارة صفحات، نشر منتظم، متابعة أداء، ودعم الحملات بثبات.",
  },
};
