import { cn } from "@/lib/utils";

type Tone = "neutral" | "success" | "warning" | "danger" | "info";

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-brand-indigo/10 text-brand-indigo",
};

export function ToneBadge({
  label,
  tone = "neutral",
  className,
}: {
  label: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        TONE_CLASSES[tone],
        className
      )}
    >
      {label}
    </span>
  );
}

const CONTENT_STATUS_MAP: Record<string, { label: string; tone: Tone }> = {
  DRAFT: { label: "مسودة", tone: "neutral" },
  PUBLISHED: { label: "منشور", tone: "success" },
  ARCHIVED: { label: "مؤرشف", tone: "warning" },
};

export function ContentStatusBadge({ status }: { status: string }) {
  const meta = CONTENT_STATUS_MAP[status] ?? {
    label: status,
    tone: "neutral" as Tone,
  };
  return <ToneBadge label={meta.label} tone={meta.tone} />;
}

const LEAD_STATUS_MAP: Record<string, { label: string; tone: Tone }> = {
  NEW: { label: "جديد", tone: "info" },
  CONTACTED: { label: "تم التواصل", tone: "warning" },
  QUALIFIED: { label: "مؤهل", tone: "info" },
  WON: { label: "تم الفوز به", tone: "success" },
  LOST: { label: "خسارة", tone: "danger" },
  ARCHIVED: { label: "مؤرشف", tone: "neutral" },
};

export function LeadStatusBadge({ status }: { status: string }) {
  const meta = LEAD_STATUS_MAP[status] ?? {
    label: status,
    tone: "neutral" as Tone,
  };
  return <ToneBadge label={meta.label} tone={meta.tone} />;
}

const OFFER_STATUS_MAP: Record<string, { label: string; tone: Tone }> = {
  DRAFT: { label: "مسودة", tone: "neutral" },
  SCHEDULED: { label: "مجدول", tone: "info" },
  ACTIVE: { label: "نشط", tone: "success" },
  EXPIRED: { label: "منتهي", tone: "warning" },
  DISABLED: { label: "معطل", tone: "danger" },
};

export function OfferStatusBadge({ status }: { status: string }) {
  const meta = OFFER_STATUS_MAP[status] ?? {
    label: status,
    tone: "neutral" as Tone,
  };
  return <ToneBadge label={meta.label} tone={meta.tone} />;
}

const EFFECTIVE_OFFER_MAP: Record<string, { label: string; tone: Tone }> = {
  upcoming: { label: "يبدأ قريبًا", tone: "info" },
  active: { label: "نشط الآن", tone: "success" },
  full: { label: "مكتمل", tone: "warning" },
  expired: { label: "منتهي", tone: "warning" },
  disabled: { label: "متوقف", tone: "danger" },
  invalid: { label: "بيانات العرض غير مكتملة", tone: "danger" },
};

export function EffectiveOfferStatusBadge({ status }: { status: string }) {
  const meta = EFFECTIVE_OFFER_MAP[status] ?? {
    label: status,
    tone: "neutral" as Tone,
  };
  return <ToneBadge label={meta.label} tone={meta.tone} />;
}

const ROLE_MAP: Record<string, { label: string; tone: Tone }> = {
  OWNER: { label: "مالك", tone: "info" },
  ADMIN: { label: "مدير", tone: "success" },
  EDITOR: { label: "محرر", tone: "warning" },
  VIEWER: { label: "مشاهد", tone: "neutral" },
};

export function RoleBadge({ role }: { role: string }) {
  const meta = ROLE_MAP[role] ?? { label: role, tone: "neutral" as Tone };
  return <ToneBadge label={meta.label} tone={meta.tone} />;
}
