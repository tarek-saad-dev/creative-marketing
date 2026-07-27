"use client";

import { BrandButton, brandButtonVariants } from "@/components/ui/brand-button";
import { useLeadFunnel } from "@/components/lead/lead-funnel-provider";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

type LeadOpenButtonProps = VariantProps<typeof brandButtonVariants> & {
  source: string;
  packageId?: string | null;
  isCustom?: boolean;
  children: React.ReactNode;
  className?: string;
};

export function LeadOpenButton({
  source,
  packageId,
  isCustom,
  children,
  className,
  variant,
  size,
}: LeadOpenButtonProps) {
  const { open } = useLeadFunnel();

  return (
    <BrandButton
      type="button"
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={() => open({ source, packageId, isCustom })}
    >
      {children}
    </BrandButton>
  );
}
