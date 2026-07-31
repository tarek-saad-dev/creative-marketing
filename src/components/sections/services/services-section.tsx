import { Container } from "@/components/ui/container";
import { CinematicSection } from "@/components/ui/cinematic-section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { ServiceCategoryCard } from "@/components/sections/services/service-category-card";
import type { ServiceCategoryEcosystem } from "@/server/services/project.service";

type ServicesSectionProps = {
  ecosystem: ServiceCategoryEcosystem[];
};

export function ServicesSection({ ecosystem }: ServicesSectionProps) {
  return (
    <CinematicSection
      id="services"
      aria-labelledby="services-heading"
      className="scroll-mt-nav section-space"
      backdropWord="SYSTEM"
      backdropPosition="center"
    >
      <Container className="space-y-12">
        <Reveal>
          <SectionHeading
            id="services-heading"
            eyebrow="services ecosystem"
            title="مش مجرد تصميمات منفصلة. نبني منظومة كاملة لظهور البراند ونموه."
            description="من التفكير والتحليل، إلى صناعة المحتوى، بناء الهوية، ثم الإدارة والتطوير المستمر."
          />
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2 lg:gap-6">
          {ecosystem.map((group, index) => (
            <Reveal key={group.category} delay={0.04 * index}>
              <ServiceCategoryCard group={group} index={index} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="card-glow rounded-2xl card-glass px-6 py-8 text-center sm:px-10">
            <p className="font-headline text-lg font-semibold text-foreground text-balance sm:text-xl">
              المنظومة جاهزة — التسعير والباكدجات تُعرض عندما تكون الأسعار
              حقيقية ومعتمدة.
            </p>
            <p className="body-text mx-auto mt-3 max-w-2xl">
              لا أسعار تجريبية هنا. انتقل للأسفل عندما تصبح الباكدجات جاهزة
              للنشر، أو ابدأ حديثًا عن مشروعك مباشرة.
            </p>
            <a
              href="#packages"
              className="mt-5 inline-flex min-h-11 items-center justify-center text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              الانتقال إلى قسم الباكدجات
            </a>
          </div>
        </Reveal>
      </Container>
    </CinematicSection>
  );
}
