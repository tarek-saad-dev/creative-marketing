import { cn } from "@/lib/utils";

export type FloatingCardModel = {
  id: string;
  title: string;
  subtitle: string;
  accent: "violet" | "aqua" | "cyan" | "soft";
};

type FloatingContentCardProps = {
  card: FloatingCardModel;
  className?: string;
};

const accentMap = {
  violet: "from-brand-violet/40 to-transparent",
  aqua: "from-brand-aqua/35 to-transparent",
  cyan: "from-brand-cyan/35 to-transparent",
  soft: "from-white/20 to-transparent",
};

export function FloatingContentCard({
  card,
  className,
}: FloatingContentCardProps) {
  return (
    <div
      className={cn(
        "w-[9.5rem] rounded-xl border border-white/15 bg-surface-glass p-3 shadow-card backdrop-blur-md sm:w-[10.5rem]",
        className
      )}
      aria-hidden="true"
    >
      <div
        className={cn(
          "mb-3 h-14 rounded-lg bg-gradient-to-br",
          accentMap[card.accent]
        )}
      />
      <p className="font-heading-en text-xs font-semibold tracking-wide text-brand-soft">
        {card.title}
      </p>
      <p className="mt-1 text-[11px] leading-4 text-foreground-muted">
        {card.subtitle}
      </p>
    </div>
  );
}

export const defaultFloatingCards: FloatingCardModel[] = [
  {
    id: "branding",
    title: "Branding",
    subtitle: "Identity systems",
    accent: "violet",
  },
  {
    id: "social",
    title: "Social Media",
    subtitle: "Feed & stories",
    accent: "aqua",
  },
  {
    id: "content",
    title: "Content Creation",
    subtitle: "Copy & visuals",
    accent: "cyan",
  },
  {
    id: "campaign",
    title: "Campaign Strategy",
    subtitle: "Launch plans",
    accent: "soft",
  },
];
