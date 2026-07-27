"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/components/motion/reduced-motion";
import { useLeadFunnel } from "@/components/lead/lead-funnel-provider";
import { cn } from "@/lib/utils";

/**
 * Mobile sticky CTA opens the Lead Funnel (not WhatsApp directly).
 */
export function MobileStickyCta() {
  const [visible, setVisible] = useState(false);
  const reduced = usePrefersReducedMotion();
  const { open, isOpen } = useLeadFunnel();

  useEffect(() => {
    const update = () => {
      const hero = document.getElementById("hero");
      const footer = document.querySelector("footer");
      const heroBottom = hero
        ? hero.getBoundingClientRect().bottom
        : window.innerHeight;
      const footerTop = footer
        ? footer.getBoundingClientRect().top
        : Number.POSITIVE_INFINITY;

      const pastHero =
        window.scrollY > 120 && heroBottom < window.innerHeight * 0.4;
      const nearFooter = footerTop < window.innerHeight - 24;
      setVisible(pastHero && !nearFooter && !isOpen);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [isOpen]);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-sticky px-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden",
        "transition-all duration-base ease-standard",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0",
        reduced && !visible && "hidden"
      )}
      aria-hidden={!visible}
    >
      <button
        type="button"
        tabIndex={visible ? 0 : -1}
        onClick={() => open({ source: "mobile_sticky_cta" })}
        className="flex min-h-12 w-full items-center justify-center rounded-pill bg-[image:var(--gradient-cta)] px-5 text-sm font-bold text-primary-foreground shadow-floating focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        ابدأ مشروعك على واتساب
      </button>
    </div>
  );
}
