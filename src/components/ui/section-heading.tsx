import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "start" | "center";
  className?: string;
  titleAs?: "h1" | "h2" | "h3";
};

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = "start",
  className,
  titleAs: TitleTag = "h2",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-3xl space-y-3",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow ? <EyebrowInline>{eyebrow}</EyebrowInline> : null}
      <TitleTag
        id={id}
        className="font-headline text-display-md text-foreground text-balance"
      >
        {title}
      </TitleTag>
      {description ? (
        <p className="text-base leading-8 text-foreground-muted sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function EyebrowInline({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase sm:text-sm">
      {children}
    </p>
  );
}
