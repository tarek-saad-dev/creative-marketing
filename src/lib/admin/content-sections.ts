export const CONTENT_SECTIONS = [
  {
    id: "settings",
    label: "بيانات الموقع",
    description: "البراند، التواصل، السوشيال، والواجهة الرئيسية",
  },
  {
    id: "projects",
    label: "المشاريع",
    description: "معرض الأعمال والصور",
  },
  {
    id: "services",
    label: "الخدمات",
    description: "THINK · CREATE · BUILD · GROW",
  },
  {
    id: "packages",
    label: "الباكدجات",
    description: "الأسعار والميزات",
  },
  {
    id: "offers",
    label: "العروض",
    description: "العروض المحدودة",
  },
  {
    id: "testimonials",
    label: "آراء العملاء",
    description: "الشهادات والموافقات",
  },
  {
    id: "trust",
    label: "أرقام الثقة",
    description: "المؤشرات الموثّقة",
  },
  {
    id: "logos",
    label: "شعارات العملاء",
    description: "شبكة الشعارات",
  },
  {
    id: "faqs",
    label: "الأسئلة",
    description: "الأسئلة الشائعة",
  },
] as const;

export type ContentSectionId = (typeof CONTENT_SECTIONS)[number]["id"];

export function isContentSectionId(
  value: string | undefined
): value is ContentSectionId {
  return CONTENT_SECTIONS.some(section => section.id === value);
}

export function parseContentSection(
  value: string | string[] | undefined
): ContentSectionId {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw && isContentSectionId(raw)) return raw;
  return "settings";
}
