import { Container } from "@/components/ui/container";
import { CinematicSection } from "@/components/ui/cinematic-section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { PackageCard } from "@/components/sections/commercial/package-card";
import { PackageComparison } from "@/components/sections/commercial/package-comparison";
import { LeadOpenButton } from "@/components/lead/lead-open-button";
import { DistributedProof } from "@/components/sections/commercial/distributed-proof";
import type { PublicPackageCard } from "@/server/services/commercial-landing.service";
import type { PublicTestimonial } from "@/server/services/commercial-landing.service";

type PricingSectionProps = {
  packages: PublicPackageCard[];
  featuredTestimonial?: PublicTestimonial | null;
  hasActiveOffer: boolean;
};

export function PricingSection({
  packages,
  featuredTestimonial,
  hasActiveOffer,
}: PricingSectionProps) {
  return (
    <CinematicSection
      id="packages"
      aria-labelledby="packages-heading"
      className="scroll-mt-nav section-space"
      backdropWord="PACKAGES"
      backdropPosition="start"
    >
      <Container className="space-y-12">
        <Reveal>
          <SectionHeading
            id="packages-heading"
            eyebrow="packages"
            title="اختار البداية المناسبة لمشروعك."
            description={
              packages.length > 0
                ? hasActiveOffer
                  ? "مستويات واضحة مع أسعار عرض سارية الآن على الباكدجات المؤهلة."
                  : "ثلاث مستويات واضحة، من تأسيس الاتجاه إلى الإدارة والتطوير المستمر."
                : undefined
            }
          />
        </Reveal>

        {packages.length === 0 ? (
          <div className="card-glow rounded-2xl card-glass p-8">
            <p className="font-headline text-xl font-semibold text-foreground">
              نعمل حاليًا على تجهيز الباكدجات بصورتها النهائية.
            </p>
            <p className="body-text mt-3 max-w-2xl">
              يمكنك إرسال تفاصيل مشروعك للحصول على عرض مناسب.
            </p>
            <LeadOpenButton
              source="packages_empty"
              isCustom
              className="mt-5"
              variant="primary"
            >
              أرسل تفاصيل مشروعك
            </LeadOpenButton>
          </div>
        ) : (
          <>
            <div className="grid gap-5 lg:grid-cols-3">
              {packages.map(pkg => (
                <Reveal key={pkg.id} delay={0.04}>
                  <PackageCard pkg={pkg} />
                </Reveal>
              ))}
            </div>

            {featuredTestimonial ? (
              <DistributedProof
                testimonial={featuredTestimonial}
                slot="pricing"
              />
            ) : null}

            <PackageComparison packages={packages} />

            <div className="card-glow rounded-2xl card-glass px-6 py-6 text-center">
              <p className="font-headline text-lg font-semibold text-foreground">
                تحتاج عرضًا مخصصًا؟
              </p>
              <p className="body-text-muted mt-2">
                صف نطاق مشروعك وسنقترح مسار عمل بدون سعر مفبرك.
              </p>
              <LeadOpenButton
                source="custom_package"
                isCustom
                className="mt-4"
                variant="secondary"
              >
                اطلب عرضًا مخصصًا
              </LeadOpenButton>
            </div>
          </>
        )}
      </Container>
    </CinematicSection>
  );
}
