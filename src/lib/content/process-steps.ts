import type { ServiceCategory } from "@/generated/prisma";

export type ProcessStep = {
  number: string;
  title: string;
  description: string;
};

/**
 * Stable marketing process content — not a CMS model.
 * Documented in phase-4-commercial-architecture.md.
 */
export const PROCESS_STEPS: ProcessStep[] = [
  {
    number: "01",
    title: "نفهم",
    description: "Brief عن المشروع والجمهور والأهداف قبل أي تنفيذ.",
  },
  {
    number: "02",
    title: "نفكر",
    description: "تحليل واتجاه واضح يحدد الرسالة والأولويات.",
  },
  {
    number: "03",
    title: "نخلق",
    description: "محتوى، تصاميم، وتنفيذ مرئي وفق الخطة المتفق عليها.",
  },
  {
    number: "04",
    title: "نراجع",
    description: "تسليم منظم ومراجعات متفق عليها قبل النشر.",
  },
  {
    number: "05",
    title: "ننشر ونطور",
    description: "تسليم، نشر، وتحسين مستمر حسب نطاق الباكدج.",
  },
];

export type PublicServiceOption = {
  id: string;
  slug: string;
  nameAr: string;
  category: ServiceCategory;
};
