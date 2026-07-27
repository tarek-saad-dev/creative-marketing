import { config } from "dotenv";
import {
  PrismaClient,
  ContentStatus,
  ServiceCategory,
} from "../src/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import { configureNeonWebSocket } from "../src/lib/db/neon-ws";

config({ path: ".env.local" });
config();
configureNeonWebSocket();

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is required to run the seed. Configure .env.local (see .env.example)."
    );
  }
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

const prisma = createClient();

async function upsertSetting(
  key: string,
  value: unknown,
  description: string,
  options: { preserveNonEmptyValue?: boolean } = {}
) {
  const existing = await prisma.siteSetting.findUnique({
    where: { key },
    select: { value: true },
  });

  if (!existing) {
    await prisma.siteSetting.create({
      data: { key, value: value as object, description },
    });
    return;
  }

  const shouldPreserve =
    options.preserveNonEmptyValue &&
    typeof existing.value === "string" &&
    existing.value.trim().length > 0;

  await prisma.siteSetting.update({
    where: { key },
    data: {
      description,
      ...(shouldPreserve ? {} : { value: value as object }),
    },
  });
}

async function seedSiteSettings() {
  await upsertSetting("brand.name", "Creative Marketing", "Brand display name");
  await upsertSetting(
    "brand.slogan",
    "WE THINK. WE CREATE. YOU GROW.",
    "Brand slogan"
  );
  await upsertSetting(
    "brand.whatsapp",
    "",
    "WhatsApp business number (E.164 preferred)",
    { preserveNonEmptyValue: true }
  );
  await upsertSetting("brand.email", "", "Public contact email", {
    preserveNonEmptyValue: true,
  });
  await upsertSetting("brand.instagram", "", "Instagram URL", {
    preserveNonEmptyValue: true,
  });
  await upsertSetting("brand.facebook", "", "Facebook URL", {
    preserveNonEmptyValue: true,
  });
  await upsertSetting("brand.behance", "", "Behance URL", {
    preserveNonEmptyValue: true,
  });
  await upsertSetting(
    "landing.hero.badge",
    "عرض الإطلاق متاح لفترة محدودة",
    "Landing hero badge"
  );
  await upsertSetting(
    "landing.hero.title",
    "نحوّل مشروعك من مجرد صفحة إلى براند يبان، يتفهم، ويتباع.",
    "Landing hero title"
  );
  await upsertSetting(
    "landing.hero.description",
    "استراتيجية، محتوى، تصميم وإدارة سوشيال ميديا تساعد مشروعك يظهر باحتراف ويكسب ثقة العميل من أول نظرة.",
    "Landing hero description"
  );
  await upsertSetting(
    "landing.hero.primaryCta",
    "شوف شغلنا",
    "Landing primary CTA"
  );
  await upsertSetting(
    "landing.hero.secondaryCta",
    "استكشف الباكدجات",
    "Landing secondary CTA"
  );
}

type ServiceSeed = {
  slug: string;
  nameAr: string;
  nameEn: string;
  category: ServiceCategory;
  summaryAr: string;
  summaryEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string;
  displayOrder: number;
};

const services: ServiceSeed[] = [
  {
    slug: "think-business-analysis",
    nameAr: "تحليل الأعمال",
    nameEn: "Business analysis",
    category: ServiceCategory.THINK,
    summaryAr: "نفهم مشروعك، جمهورك، وفرص النمو قبل أي تنفيذ.",
    summaryEn:
      "Understand the business, audience, and growth opportunities first.",
    descriptionAr:
      "جلسة تحليل للأهداف، نقاط القوة، والتحديات حتى نحدد اتجاه واضح قبل المحتوى والتصميم.",
    descriptionEn:
      "Clarify goals, strengths, and challenges so strategy leads creative work.",
    icon: "search",
    displayOrder: 1,
  },
  {
    slug: "think-competitor-analysis",
    nameAr: "تحليل المنافسين",
    nameEn: "Competitor analysis",
    category: ServiceCategory.THINK,
    summaryAr: "نرصد المنافسين وما الذي يميز حضورك في السوق.",
    summaryEn: "Map competitors and find a clear market position.",
    descriptionAr:
      "مراجعة حضور المنافسين في السوشيال والمحتوى لاستخراج فرص تميز حقيقية لمشروعك.",
    descriptionEn:
      "Review competitor social presence to surface differentiation opportunities.",
    icon: "scan",
    displayOrder: 2,
  },
  {
    slug: "think-content-strategy",
    nameAr: "استراتيجية المحتوى",
    nameEn: "Content strategy",
    category: ServiceCategory.THINK,
    summaryAr: "خطة محتوى واضحة تربط الرسالة بالهدف التجاري.",
    summaryEn: "A content plan that ties messaging to business goals.",
    descriptionAr:
      "نبني محاور المحتوى، النبرة، وأنواع المنشورات بما يخدم الوعي والتحويل.",
    descriptionEn:
      "Define pillars, tone, and formats that support awareness and conversion.",
    icon: "map",
    displayOrder: 3,
  },
  {
    slug: "think-launch-planning",
    nameAr: "تخطيط الإطلاق",
    nameEn: "Launch planning",
    category: ServiceCategory.THINK,
    summaryAr: "جدول إطلاق مرتب من أول ظهور حتى أول تفاعل.",
    summaryEn: "A launch sequence from first impression to first engagement.",
    descriptionAr: "نحدد مراحل الإطلاق، الأولويات، وما يجب تجهيزه قبل النشر.",
    descriptionEn:
      "Sequence launch milestones and prepare what must be ready before publishing.",
    icon: "rocket",
    displayOrder: 4,
  },
  {
    slug: "create-social-designs",
    nameAr: "تصاميم السوشيال ميديا",
    nameEn: "Social media designs",
    category: ServiceCategory.CREATE,
    summaryAr: "تصاميم متناسقة تعكس هوية المشروع بوضوح.",
    summaryEn: "Cohesive designs that make the brand look intentional.",
    descriptionAr: "قوالب ومنشورات بصرية مناسبة للمنصات مع الحفاظ على الهوية.",
    descriptionEn:
      "Platform-ready visual posts and templates aligned to the brand system.",
    icon: "palette",
    displayOrder: 5,
  },
  {
    slug: "create-copywriting",
    nameAr: "كتابة المحتوى",
    nameEn: "Copywriting",
    category: ServiceCategory.CREATE,
    summaryAr: "نصوص واضحة تقنع وتبيع بدون مبالغة.",
    summaryEn: "Clear copy that persuades without hype.",
    descriptionAr: "كتابة عناوين، منشورات، ونداءات إجراء بلغة تناسب الجمهور.",
    descriptionEn:
      "Headlines, captions, and CTAs written for the target audience.",
    icon: "pen",
    displayOrder: 6,
  },
  {
    slug: "create-content-creation",
    nameAr: "إنتاج المحتوى",
    nameEn: "Content creation",
    category: ServiceCategory.CREATE,
    summaryAr: "محتوى جاهز للنشر يخدم الخطة الشهرية.",
    summaryEn: "Publish-ready assets that serve the monthly plan.",
    descriptionAr: "إنتاج منشورات ومواد بصرية/نصية وفق الاستراتيجية المعتمدة.",
    descriptionEn:
      "Produce posts and assets according to the approved strategy.",
    icon: "layers",
    displayOrder: 7,
  },
  {
    slug: "create-reels-short-videos",
    nameAr: "ريلز وفيديوهات قصيرة",
    nameEn: "Reels and short videos",
    category: ServiceCategory.CREATE,
    summaryAr: "مقاطع قصيرة تشرح القيمة وتلفت الانتباه بسرعة.",
    summaryEn: "Short-form video that explains value quickly.",
    descriptionAr: "أفكار وسيناريوهات ومقاطع قصيرة مناسبة لريلز وستوريز.",
    descriptionEn:
      "Concepts, scripts, and short clips suited for Reels and Stories.",
    icon: "clapperboard",
    displayOrder: 8,
  },
  {
    slug: "build-visual-identity",
    nameAr: "الهوية البصرية",
    nameEn: "Visual identity",
    category: ServiceCategory.BUILD,
    summaryAr: "أساس بصري يجعل البراند مميزًا وسهل التذكر.",
    summaryEn: "A visual foundation that is distinctive and memorable.",
    descriptionAr: "توجيهات للهوية تغطي الألوان، الخطوط، والأسلوب العام.",
    descriptionEn:
      "Identity direction covering color, type, and overall visual style.",
    icon: "sparkles",
    displayOrder: 9,
  },
  {
    slug: "build-brand-systems",
    nameAr: "أنظمة البراند",
    nameEn: "Brand systems",
    category: ServiceCategory.BUILD,
    summaryAr: "نظام استخدام يحافظ على الاتساق عبر كل القنوات.",
    summaryEn: "A usage system that keeps every channel consistent.",
    descriptionAr:
      "قواعد تطبيق الهوية على المنشورات، الأغلفة، والمواد التسويقية.",
    descriptionEn:
      "Rules for applying identity across posts, covers, and marketing assets.",
    icon: "grid",
    displayOrder: 10,
  },
  {
    slug: "build-landing-pages",
    nameAr: "صفحات الهبوط",
    nameEn: "Landing pages",
    category: ServiceCategory.BUILD,
    summaryAr: "صفحات مصممة لتحويل الزائر إلى عميل محتمل.",
    summaryEn: "Pages designed to convert visitors into leads.",
    descriptionAr: "هيكلة وتصميم صفحات هبوط تركز على العرض والدعوة للإجراء.",
    descriptionEn:
      "Structure and design landing pages around the offer and CTA.",
    icon: "layout",
    displayOrder: 11,
  },
  {
    slug: "build-campaign-assets",
    nameAr: "أصول الحملات",
    nameEn: "Campaign assets",
    category: ServiceCategory.BUILD,
    summaryAr: "مواد جاهزة للحملات والإعلانات والعروض.",
    summaryEn: "Ready assets for campaigns, ads, and promotions.",
    descriptionAr: "تصميم بنرات ومواد حملة متناسقة مع الهوية والرسالة.",
    descriptionEn:
      "Campaign banners and assets aligned to identity and message.",
    icon: "image",
    displayOrder: 12,
  },
  {
    slug: "grow-page-management",
    nameAr: "إدارة الصفحات",
    nameEn: "Page management",
    category: ServiceCategory.GROW,
    summaryAr: "إدارة يومية منظمة لصفحات السوشيال.",
    summaryEn: "Organized day-to-day social page management.",
    descriptionAr:
      "متابعة الصفحة، الردود الأساسية، وترتيب الأولويات التشغيلية.",
    descriptionEn:
      "Page oversight, basic replies, and operational prioritization.",
    icon: "settings",
    displayOrder: 13,
  },
  {
    slug: "grow-publishing",
    nameAr: "النشر",
    nameEn: "Publishing",
    category: ServiceCategory.GROW,
    summaryAr: "نشر منتظم وفق الجدول والخطة.",
    summaryEn: "Consistent publishing against the content calendar.",
    descriptionAr: "جدولة ونشر المحتوى على المنصات المتفق عليها.",
    descriptionEn: "Schedule and publish content on agreed platforms.",
    icon: "calendar",
    displayOrder: 14,
  },
  {
    slug: "grow-performance-tracking",
    nameAr: "تتبع الأداء",
    nameEn: "Performance tracking",
    category: ServiceCategory.GROW,
    summaryAr: "قراءة النتائج لتحسين المحتوى باستمرار.",
    summaryEn: "Read results to improve content continuously.",
    descriptionAr: "مراجعة مؤشرات الأداء واستخراج ملاحظات عملية للتحسين.",
    descriptionEn:
      "Review performance indicators and extract actionable improvements.",
    icon: "chart",
    displayOrder: 15,
  },
  {
    slug: "grow-campaign-support",
    nameAr: "دعم الحملات",
    nameEn: "Campaign support",
    category: ServiceCategory.GROW,
    summaryAr: "مساندة تشغيلية للحملات والعروض.",
    summaryEn: "Operational support for campaigns and offers.",
    descriptionAr: "تنسيق المواد والتوقيتات ودعم تنفيذ الحملات التسويقية.",
    descriptionEn:
      "Coordinate assets, timing, and support for marketing campaigns.",
    icon: "megaphone",
    displayOrder: 16,
  },
];

async function seedServices() {
  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      create: {
        ...service,
        isActive: true,
      },
      update: {
        nameAr: service.nameAr,
        nameEn: service.nameEn,
        category: service.category,
        summaryAr: service.summaryAr,
        summaryEn: service.summaryEn,
        descriptionAr: service.descriptionAr,
        descriptionEn: service.descriptionEn,
        icon: service.icon,
        displayOrder: service.displayOrder,
        isActive: true,
        deletedAt: null,
      },
    });
  }
}

async function seedPackages() {
  const packages = [
    {
      slug: "think",
      name: "THINK",
      tagline: "الاستراتيجية أولًا",
      description:
        "باكدج التفكير والتحليل: فهم المشروع، المنافسين، وخطة المحتوى قبل التنفيذ. السعر غير مُعدّ بعد — يبقى مسودة حتى يتم ضبط سعر حقيقي.",
      idealFor: "المشاريع التي تحتاج وضوحًا قبل الإنتاج",
      isFeatured: false,
      displayOrder: 1,
      features: [
        { title: "تحليل الأعمال", displayOrder: 1 },
        { title: "تحليل المنافسين", displayOrder: 2 },
        { title: "استراتيجية المحتوى", displayOrder: 3 },
        { title: "تخطيط الإطلاق", displayOrder: 4 },
      ],
    },
    {
      slug: "create",
      name: "CREATE",
      tagline: "إنتاج يبان ويتفاعل",
      description:
        "باكدج الإبداع: تصاميم، كتابة، ومحتوى جاهز للنشر. السعر غير مُعدّ بعد — يبقى مسودة حتى يتم ضبط سعر حقيقي.",
      idealFor: "المشاريع الجاهزة للظهور بمحتوى احترافي",
      isFeatured: true,
      displayOrder: 2,
      features: [
        { title: "تصاميم السوشيال", displayOrder: 1 },
        { title: "كتابة المحتوى", displayOrder: 2 },
        { title: "إنتاج المحتوى", displayOrder: 3 },
        { title: "ريلز وفيديوهات قصيرة", displayOrder: 4 },
      ],
    },
    {
      slug: "grow",
      name: "GROW",
      tagline: "تشغيل ونمو مستمر",
      description:
        "باكدج النمو: إدارة، نشر، وتتبع أداء. السعر غير مُعدّ بعد — يبقى مسودة حتى يتم ضبط سعر حقيقي.",
      idealFor: "المشاريع التي تحتاج تشغيلًا شهريًا منظمًا",
      isFeatured: false,
      displayOrder: 3,
      features: [
        { title: "إدارة الصفحات", displayOrder: 1 },
        { title: "النشر المنتظم", displayOrder: 2 },
        { title: "تتبع الأداء", displayOrder: 3 },
        { title: "دعم الحملات", displayOrder: 4 },
      ],
    },
  ] as const;

  for (const pkg of packages) {
    const existing = await prisma.package.findUnique({
      where: { slug: pkg.slug },
      select: {
        id: true,
        originalPrice: true,
        status: true,
      },
    });

    const hasConfiguredPrice =
      existing?.originalPrice !== null &&
      existing?.originalPrice !== undefined &&
      Number(existing.originalPrice.toString()) > 0;

    const saved = existing
      ? await prisma.package.update({
          where: { slug: pkg.slug },
          data: {
            name: pkg.name,
            tagline: pkg.tagline,
            description: pkg.description,
            idealFor: pkg.idealFor,
            isFeatured: pkg.isFeatured,
            displayOrder: pkg.displayOrder,
            deletedAt: null,
            // Preserve manually configured prices/status; otherwise keep draft + null price.
            ...(hasConfiguredPrice
              ? {}
              : {
                  originalPrice: null,
                  status: ContentStatus.DRAFT,
                }),
          },
        })
      : await prisma.package.create({
          data: {
            slug: pkg.slug,
            name: pkg.name,
            tagline: pkg.tagline,
            description: pkg.description,
            idealFor: pkg.idealFor,
            originalPrice: null,
            currency: "SAR",
            isFeatured: pkg.isFeatured,
            status: ContentStatus.DRAFT,
            displayOrder: pkg.displayOrder,
            features: {
              create: pkg.features.map(feature => ({
                title: feature.title,
                included: true,
                displayOrder: feature.displayOrder,
              })),
            },
          },
        });

    for (const feature of pkg.features) {
      const existingFeature = await prisma.packageFeature.findFirst({
        where: { packageId: saved.id, title: feature.title },
      });
      if (existingFeature) {
        await prisma.packageFeature.update({
          where: { id: existingFeature.id },
          data: {
            included: true,
            displayOrder: feature.displayOrder,
          },
        });
      } else {
        await prisma.packageFeature.create({
          data: {
            packageId: saved.id,
            title: feature.title,
            included: true,
            displayOrder: feature.displayOrder,
          },
        });
      }
    }
  }
}

async function seedFaqs() {
  const faqs = [
    {
      slug: "when-does-work-start",
      question: "متى يبدأ العمل؟",
      answer:
        "يبدأ العمل بعد استلام المتطلبات الأساسية وتأكيد نطاق الباكدج. المدة الدقيقة تُحدد حسب جاهزية المشروع وحجم المحتوى المتفق عليه.",
      displayOrder: 1,
    },
    {
      slug: "are-paid-ads-included",
      question: "هل الإعلانات الممولة ضمن السعر؟",
      answer:
        "ميزانية الإعلانات الممولة عادةً منفصلة عن قيمة الخدمة الإبداعية/الإدارية. يمكن توضيح نموذج الدعم الإعلاني عند اختيار الباكدج.",
      displayOrder: 2,
    },
    {
      slug: "can-package-be-customized",
      question: "هل يمكن تعديل الباكدج؟",
      answer:
        "نعم، يمكن مناقشة تعديلات معقولة على العناصر حسب احتياج المشروع، مع توضيح أي فروقات في النطاق أو السعر قبل البدء.",
      displayOrder: 3,
    },
    {
      slug: "how-many-revisions",
      question: "كم عدد التعديلات؟",
      answer:
        "عدد جولات التعديل يعتمد على الباكدج المتفق عليه. يتم توثيق الحد في عرض الخدمة قبل التنفيذ.",
      displayOrder: 4,
    },
    {
      slug: "is-monthly-subscription-required",
      question: "هل يجب الاشتراك شهريًا؟",
      answer:
        "بعض الباكدجات تناسب العمل الشهري المستمر (خصوصًا الإدارة والنشر)، بينما يمكن تنفيذ أجزاء أخرى كمرحلة محددة حسب الاتفاق.",
      displayOrder: 5,
    },
    {
      slug: "what-is-needed-to-start",
      question: "ما المطلوب لبدء العمل؟",
      answer:
        "عادةً نحتاج معلومات المشروع، الجمهور المستهدف، أمثلة مرجعية إن وجدت، وبيانات الوصول اللازمة للمنصات المتفق عليها.",
      displayOrder: 6,
    },
    {
      slug: "do-you-provide-copywriting",
      question: "هل توفرون كتابة المحتوى؟",
      answer:
        "نعم، كتابة المحتوى ضمن خدمات CREATE ويمكن تضمينها حسب الباكدج المختار.",
      displayOrder: 7,
    },
    {
      slug: "is-publishing-included",
      question: "هل النشر والإدارة ضمن كل باكدج؟",
      answer:
        "النشر والإدارة ضمن باكدجات GROW بشكل أساسي. باكدجات THINK وCREATE تركّز على التحليل والإنتاج ما لم يُتفق خلاف ذلك.",
      displayOrder: 8,
    },
    {
      slug: "how-is-payment-handled",
      question: "كيف يتم دفع قيمة الخدمة؟",
      answer:
        "تفاصيل الدفع تُوضَّح في عرض الخدمة (مثل العربون وجدولة الدفعات). لا تُعرض طرق دفع نهائية هنا حتى يتم اعتمادها تشغيليًا.",
      displayOrder: 9,
    },
  ];

  for (const faq of faqs) {
    await prisma.fAQ.upsert({
      where: { slug: faq.slug },
      create: {
        ...faq,
        category: "general",
        isActive: true,
      },
      update: {
        question: faq.question,
        answer: faq.answer,
        displayOrder: faq.displayOrder,
        isActive: true,
      },
    });
  }
}

async function seedTrustPlaceholders() {
  const placeholders = [
    {
      key: "projects_completed",
      label: "مشاريع منجزة",
      value: "",
      displayOrder: 1,
    },
    {
      key: "clients_served",
      label: "عملاء تم خدمتهم",
      value: "",
      displayOrder: 2,
    },
  ];

  for (const metric of placeholders) {
    const existing = await prisma.trustMetric.findUnique({
      where: { key: metric.key },
      select: { value: true, isVerified: true, isActive: true },
    });

    if (!existing) {
      await prisma.trustMetric.create({
        data: {
          ...metric,
          isVerified: false,
          isActive: false,
        },
      });
      continue;
    }

    // Do not overwrite verified/active metrics or non-empty configured values.
    if (existing.isVerified || existing.isActive || existing.value.trim()) {
      await prisma.trustMetric.update({
        where: { key: metric.key },
        data: {
          label: metric.label,
          displayOrder: metric.displayOrder,
        },
      });
      continue;
    }

    await prisma.trustMetric.update({
      where: { key: metric.key },
      data: {
        label: metric.label,
        value: metric.value,
        isVerified: false,
        isActive: false,
        displayOrder: metric.displayOrder,
      },
    });
  }
}

async function main() {
  console.log("Seeding Creative Marketing foundation data…");
  await seedSiteSettings();
  await seedServices();
  await seedPackages();
  await seedFaqs();
  await seedTrustPlaceholders();

  const [settings, services, packages, faqs, trust] = await Promise.all([
    prisma.siteSetting.count(),
    prisma.service.count(),
    prisma.package.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.fAQ.count(),
    prisma.trustMetric.count(),
  ]);

  console.log("Seed completed (idempotent upserts).");
  console.log(`- Site settings: ${settings}`);
  console.log(`- Services: ${services}`);
  console.log(
    `- Packages by status: ${packages
      .map(row => `${row.status}=${row._count._all}`)
      .join(", ")}`
  );
  console.log(`- FAQs: ${faqs}`);
  console.log(`- Trust placeholders: ${trust}`);
  console.log(
    "Skipped: fake projects, testimonials, client logos, active offers, fabricated metrics."
  );
}

main()
  .catch(error => {
    console.error(
      "Seed failed:",
      error instanceof Error ? error.message : "Unknown error"
    );
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
