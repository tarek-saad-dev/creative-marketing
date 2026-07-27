"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/components/motion/reduced-motion";

type OfferCountdownProps = {
  endsAtIso: string;
  onExpired?: () => void;
  className?: string;
};

type Parts = { days: number; hours: number; minutes: number; seconds: number };

function diffParts(endsAt: number, now: number): Parts | null {
  const ms = endsAt - now;
  if (ms <= 0) return null;
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

export function OfferCountdown({
  endsAtIso,
  onExpired,
  className,
}: OfferCountdownProps) {
  const endsAt = useMemo(() => new Date(endsAtIso).getTime(), [endsAtIso]);
  const reduced = usePrefersReducedMotion();
  const [now, setNow] = useState(() => Date.now());
  const parts = diffParts(endsAt, now);

  useEffect(() => {
    if (!parts) {
      onExpired?.();
      return;
    }
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [parts, onExpired]);

  if (!parts) {
    return (
      <p className={cn("text-sm font-medium text-brand-navy", className)}>
        انتهى العرض
      </p>
    );
  }

  const showSeconds = parts.days < 1;
  const deadlineLabel = new Date(endsAt).toLocaleString("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm text-brand-navy/80">
        ينتهي العرض في <time dateTime={endsAtIso}>{deadlineLabel}</time>
      </p>
      <div
        className="flex flex-wrap gap-2"
        role="timer"
        aria-live="polite"
        aria-atomic="true"
        aria-label={`متبقي ${parts.days} يوم و ${parts.hours} ساعة و ${parts.minutes} دقيقة`}
      >
        {[
          { label: "يوم", value: pad(parts.days) },
          { label: "ساعة", value: pad(parts.hours) },
          { label: "دقيقة", value: pad(parts.minutes) },
          ...(showSeconds
            ? [{ label: "ثانية", value: pad(parts.seconds) }]
            : []),
        ].map(unit => (
          <div
            key={unit.label}
            className="min-w-[4.25rem] rounded-xl border border-brand-indigo/10 bg-white px-3 py-2 text-center shadow-soft"
          >
            <div
              className={cn(
                "font-heading-en text-xl font-bold tabular-nums text-brand-navy",
                reduced && "transition-none"
              )}
            >
              {unit.value}
            </div>
            <div className="text-[11px] text-brand-navy/70">{unit.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
