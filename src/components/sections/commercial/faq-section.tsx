"use client";

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";
import { CinematicSection } from "@/components/ui/cinematic-section";
import { SectionHeading } from "@/components/ui/section-heading";
import type { PublicFaq } from "@/server/services/commercial-landing.service";

type FaqSectionProps = {
  faqs: PublicFaq[];
};

export function FaqSection({ faqs }: FaqSectionProps) {
  if (faqs.length === 0) return null;

  return (
    <CinematicSection
      aria-labelledby="faq-heading"
      className="scroll-mt-nav section-space"
      backdropWord="FAQ"
      backdropPosition="end"
    >
      <Container className="space-y-10">
        <SectionHeading
          id="faq-heading"
          eyebrow="FAQ"
          title="أسئلة تتكرر قبل ما نبدأ."
        />
        <div className="card-glow divide-y divide-white/10 rounded-2xl card-glass">
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
                        "h-5 w-5 shrink-0 text-primary transition-transform",
                        open && "rotate-180"
                      )}
                      aria-hidden="true"
                    />
                  </DisclosureButton>
                  <DisclosurePanel className="body-text px-4 pb-4">
                    {faq.answer}
                  </DisclosurePanel>
                </>
              )}
            </Disclosure>
          ))}
        </div>
      </Container>
    </CinematicSection>
  );
}
