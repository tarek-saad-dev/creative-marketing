"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Menu, X } from "lucide-react";
import type { BrandAssets } from "@/lib/content/brand-assets";
import { BrandLogo } from "@/components/brand/logo";
import { BrandButton } from "@/components/ui/brand-button";
import { IconButton } from "@/components/ui/icon-button";
import { Container } from "@/components/ui/container";
import {
  marketingNavItems,
  marketingPrimaryCta,
} from "@/components/layout/nav-config";
import { cn } from "@/lib/utils";

type MarketingHeaderProps = {
  brandName: string;
  assets?: BrandAssets;
  contactHref?: string;
  visualPreview?:boolean;
};

export function MarketingHeader({ brandName, assets, contactHref = marketingPrimaryCta.href, visualPreview=false }: MarketingHeaderProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [activeAnchor, setActiveAnchor] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (pathname !== "/") return;
    const targets = marketingNavItems.map(item => document.getElementById(item.href.split("#")[1])).filter((node): node is HTMLElement => Boolean(node));
    let frame = 0;
    function update() {
      frame = 0;
      const marker = Math.min(window.innerHeight * 0.35, 220);
      let current = "";
      for (const target of targets) {
        if (target.getBoundingClientRect().top <= marker) current = target.id;
      }
      setActiveAnchor(current);
    }
    function schedule() { if (!frame) frame = window.requestAnimationFrame(update); }
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          visualPreview?"relative z-0":"fixed inset-x-0 top-0 z-header transition-[background-color,box-shadow,border-color,backdrop-filter,height] duration-base ease-standard",
          (scrolled || pathname !== "/")
            ? "border-b border-border/60 bg-background-elevated/90 shadow-soft backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        )}
      >
        <Container className="flex h-nav items-center justify-between gap-4">
          <BrandLogo brandName={brandName} assets={assets} priority />

          <nav
            className="hidden items-center gap-2 lg:flex"
            aria-label="التنقل الرئيسي"
          >
            {marketingNavItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === "/" && item.href === "/#" + activeAnchor ? "location" : undefined}
                className="rounded-full px-3 py-2 text-sm font-semibold text-foreground/90 transition-colors hover:text-primary aria-[current=location]:bg-white/10 aria-[current=location]:text-primary"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:block">
            <BrandButton href={contactHref} size="sm">
              {marketingPrimaryCta.name}
            </BrandButton>
          </div>

          <div className="lg:hidden">
            <IconButton
              label="فتح قائمة التنقل"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </IconButton>
          </div>
        </Container>
      </header>

      <Transition show={mobileOpen}>
        <Dialog
          onClose={setMobileOpen}
          className="relative z-modal lg:hidden"
          aria-label={`قائمة ${brandName}`}
        >
          <TransitionChild
            enter="transition duration-base ease-standard"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition duration-fast ease-standard"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/45" aria-hidden="true" />
          </TransitionChild>

          <div className="fixed inset-0 flex justify-start">
            <TransitionChild
              enter="transition duration-base ease-emphasized"
              enterFrom="translate-x-8 opacity-0"
              enterTo="translate-x-0 opacity-100"
              leave="transition duration-fast ease-standard"
              leaveFrom="translate-x-0 opacity-100"
              leaveTo="translate-x-8 opacity-0"
            >
              <DialogPanel className="flex h-full w-full max-w-sm flex-col overflow-y-auto bg-gradient-to-br from-[#39247f] to-[#1a245a] px-5 py-6 shadow-floating">
                <div className="flex items-center justify-between gap-3">
                  <DialogTitle className="sr-only">قائمة التنقل</DialogTitle>
                  <BrandLogo brandName={brandName} assets={assets} priority />
                  <IconButton
                    label="إغلاق قائمة التنقل"
                    onClick={() => setMobileOpen(false)}
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </IconButton>
                </div>

                <nav
                  className="mt-8 flex flex-col gap-1"
                  aria-label="تنقل الجوال"
                >
                  {marketingNavItems.map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={pathname === "/" && item.href === "/#" + activeAnchor ? "location" : undefined}
                      className="rounded-lg px-3 py-3 text-base font-semibold text-foreground transition-colors hover:bg-muted aria-[current=location]:bg-white/10 aria-[current=location]:text-primary"
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>

                <div className="mt-auto pt-8">
                  <BrandButton
                    href={contactHref}
                    className="w-full"
                    onClick={() => setMobileOpen(false)}
                  >
                    {marketingPrimaryCta.name}
                  </BrandButton>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
