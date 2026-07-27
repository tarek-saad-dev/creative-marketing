"use client";

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import type { PublicFaq } from "@/server/services/commercial-landing.service";

type FaqSectionProps = {
  faqs: PublicFaq[];
};

export function FaqSection({ faqs }: FaqSectionProps) {
  if (faqs.length === 0) return null;

  return (
    <section
      aria-labelledby="faq-heading"
      className="scroll-mt-nav section-space border-t border-border/30"
    >
      <Container className="space-y-8">
        <SectionHeading
          id="faq-heading"
          eyebrow="FAQ"
          title="أسئلة تتكرر قبل ما نبدأ."
        />
        <div className="divide-y divide-border/30 rounded-2xl border border-border/40 bg-surface-glass">
          {faqs.map(faq => (
            <Disclosure key={faq.id} as="div" className="p-1">
              {({ open }) => (
                <>
                  <DisclosureButton
                    id={`faq-${faq.slug}`}
                    className="flex w-full min-h-14 items-center justify-between gap-3 px-4 py-3 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="font-semibold text-foreground">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 shrink-0 text-foreground-muted transition-transform",
                        open && "rotate-180"
                      )}
                      aria-hidden="true"
                    />
                  </DisclosureButton>
                  <DisclosurePanel className="px-4 pb-4 text-sm leading-7 text-foreground-muted">
                    {faq.answer}
                  </DisclosurePanel>
                </>
              )}
            </Disclosure>
          ))}
        </div>
      </Container>
    </section>
  );
}
