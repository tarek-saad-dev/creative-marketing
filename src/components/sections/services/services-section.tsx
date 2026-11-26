import { InteractiveServices } from "./interactive-services";
import type { ServiceCategoryEcosystem } from "@/server/services/project.service";

type ServicesSectionProps = {
  ecosystem: ServiceCategoryEcosystem[];
};

export function ServicesSection({ ecosystem }: ServicesSectionProps) {
  return <InteractiveServices ecosystem={ecosystem} />;
}
