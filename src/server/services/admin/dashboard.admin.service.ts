import "server-only";

import { prisma } from "@/lib/db/prisma";
import { ContentStatus, LeadStatus, OfferStatus } from "@/generated/prisma";
import { isCloudinaryConfigured } from "@/lib/env/server";
import { hasValidConfiguredPrice } from "@/lib/validation/pricing";
import { STRUCTURED_SETTING_KEYS } from "@/lib/validation/admin/structured-settings";

export type AdminDashboardWarning = {
  id: string;
  message: string;
  href?: string;
};

export type AdminDashboardData = {
  counts: {
    projectsPublished: number;
    projectsDraft: number;
    services: number;
    packagesPublished: number;
    packagesDraft: number;
    offersActive: number;
    testimonialsPublished: number;
    trustMetricsActive: number;
    clientLogosActive: number;
    faqsActive: number;
    leadsNew: number;
    leadsTotal: number;
    adminUsers: number;
    auditLogEntries: number;
  };
  warnings: AdminDashboardWarning[];
  cloudinaryConfigured: boolean;
};

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const now = new Date();

  const [
    projectsPublished,
    projectsDraft,
    services,
    packages,
    offersActive,
    testimonialsPublished,
    testimonialsUnapprovedPublished,
    trustMetricsActive,
    trustMetricsIncomplete,
    clientLogosActive,
    faqsActive,
    leadsNew,
    leadsTotal,
    adminUsers,
    auditLogEntries,
    whatsappSetting,
  ] = await Promise.all([
    prisma.project.count({
      where: { deletedAt: null, status: ContentStatus.PUBLISHED },
    }),
    prisma.project.count({
      where: { deletedAt: null, status: ContentStatus.DRAFT },
    }),
    prisma.service.count({ where: { deletedAt: null, isActive: true } }),
    prisma.package.findMany({
      where: { deletedAt: null },
      select: { status: true, originalPrice: true },
    }),
    prisma.limitedOffer.count({
      where: {
        isActive: true,
        status: OfferStatus.ACTIVE,
        startsAt: { lte: now },
        endsAt: { gte: now },
      },
    }),
    prisma.testimonial.count({
      where: { deletedAt: null, status: ContentStatus.PUBLISHED },
    }),
    prisma.testimonial.count({
      where: {
        deletedAt: null,
        status: ContentStatus.PUBLISHED,
        publicApprovalConfirmed: false,
      },
    }),
    prisma.trustMetric.count({ where: { isActive: true, isVerified: true } }),
    prisma.trustMetric.count({
      where: { OR: [{ isActive: false }, { isVerified: false }] },
    }),
    prisma.clientLogo.count({ where: { isActive: true } }),
    prisma.fAQ.count({ where: { isActive: true } }),
    prisma.lead.count({ where: { status: LeadStatus.NEW } }),
    prisma.lead.count(),
    prisma.adminUser.count({ where: { deletedAt: null, isActive: true } }),
    prisma.adminAuditLog.count(),
    prisma.siteSetting.findUnique({
      where: { key: STRUCTURED_SETTING_KEYS.whatsapp },
      select: { value: true },
    }),
  ]);

  const packagesPublished = packages.filter(
    pkg => pkg.status === ContentStatus.PUBLISHED
  );
  const packagesDraft = packages.filter(
    pkg => pkg.status === ContentStatus.DRAFT
  ).length;
  const packagesWithoutPrice = packages.filter(
    pkg => !hasValidConfiguredPrice(pkg.originalPrice)
  ).length;
  const packagesInvalidPrice = packagesPublished.filter(
    pkg => !hasValidConfiguredPrice(pkg.originalPrice)
  ).length;

  const rawWhatsapp = whatsappSetting?.value;
  const whatsappValue =
    typeof rawWhatsapp === "string"
      ? rawWhatsapp.trim()
      : rawWhatsapp &&
          typeof rawWhatsapp === "object" &&
          "toString" in rawWhatsapp
        ? String(rawWhatsapp).trim()
        : "";
  // Prisma Json may store a JSON string value including quotes — normalize.
  const whatsappNormalized = whatsappValue.replace(/^"|"$/g, "").trim();

  const warnings: AdminDashboardWarning[] = [];

  if (projectsPublished === 0) {
    warnings.push({
      id: "no-published-projects",
      message: "لا توجد مشاريع منشورة.",
      href: "/admin/content?section=projects",
    });
  }
  if (packagesWithoutPrice > 0) {
    warnings.push({
      id: "packages-no-price",
      message: "الباكدجات بدون أسعار.",
      href: "/admin/content?section=packages",
    });
  } else if (packagesInvalidPrice > 0) {
    warnings.push({
      id: "packages-invalid-price",
      message: "بعض الباكدجات المنشورة بلا سعر صالح ولن تظهر للعامة.",
      href: "/admin/content?section=packages",
    });
  }
  if (!whatsappNormalized) {
    warnings.push({
      id: "whatsapp-missing",
      message: "رقم واتساب غير مضاف.",
      href: "/admin/content?section=settings",
    });
  }
  if (offersActive === 0) {
    warnings.push({
      id: "no-active-offer",
      message: "لا يوجد عرض حالي.",
      href: "/admin/content?section=offers",
    });
  }
  if (testimonialsPublished === 0) {
    warnings.push({
      id: "no-testimonials",
      message: "لا توجد شهادات عملاء.",
      href: "/admin/content?section=testimonials",
    });
  }
  if (trustMetricsIncomplete > 0) {
    warnings.push({
      id: "trust-incomplete",
      message: "هناك أرقام ثقة غير جاهزة للعرض العام.",
      href: "/admin/content?section=trust",
    });
  }
  if (testimonialsUnapprovedPublished > 0) {
    warnings.push({
      id: "testimonials-unapproved",
      message: "رأي عميل منشور بدون تأكيد موافقة النشر.",
      href: "/admin/content?section=testimonials",
    });
  }
  if (leadsNew > 0) {
    warnings.push({
      id: "leads-new",
      message: `${leadsNew} طلب عميل جديد بانتظار المتابعة.`,
      href: "/admin/leads",
    });
  }
  if (!isCloudinaryConfigured()) {
    warnings.push({
      id: "cloudinary-not-configured",
      message: "رفع الصور المباشر غير متاح حاليًا، ويمكن استخدام رابط صورة.",
      href: "/admin/content?section=projects",
    });
  }
  if (adminUsers <= 1) {
    warnings.push({
      id: "single-admin",
      message: "يوجد مسؤول واحد فقط — يُفضّل إضافة حساب احتياطي.",
    });
  }

  return {
    counts: {
      projectsPublished,
      projectsDraft,
      services,
      packagesPublished: packagesPublished.length,
      packagesDraft,
      offersActive,
      testimonialsPublished,
      trustMetricsActive,
      clientLogosActive,
      faqsActive,
      leadsNew,
      leadsTotal,
      adminUsers,
      auditLogEntries,
    },
    warnings,
    cloudinaryConfigured: isCloudinaryConfigured(),
  };
}

export type { AdminDashboardData as DashboardData };

export async function getRecentAuditActivity() {
  return prisma.adminAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    select: {
      id: true,
      action: true,
      entityType: true,
      entityId: true,
      createdAt: true,
      adminUser: { select: { name: true } },
    },
  });
}
