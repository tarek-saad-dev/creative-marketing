import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "start" | "center";
  className?: string;
  titleAs?: "h1" | "h2" | "h3";
  variant?: "editorial" | "default";
};

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = "start",
  className,
  titleAs: TitleTag = "h2",
  variant = "editorial",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-3xl space-y-4",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow ? <EyebrowInline>{eyebrow}</EyebrowInline> : null}
      <TitleTag
        id={id}
        className={cn(
          "font-headline text-foreground text-balance text-editorial",
          variant === "editorial" && "text-display-lg",
          variant === "default" && "text-display-md"
        )}
      >
        {title}
      </TitleTag>
      {description ? (
        <p className="body-text max-w-2xl">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function EyebrowInline({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase sm:text-sm">
      {children}
    </p>
  );
}
