import { cn } from "@/lib/utils";
import { AmbientGlow } from "@/components/ui/ambient-glow";

type CinematicSectionProps = React.HTMLAttributes<HTMLElement> & {
  as?: "section" | "div";
  backdropWord?: string;
  backdropPosition?: "start" | "center" | "end";
  innerClassName?: string;
  glowTone?: "violet" | "aqua" | "cyan";
};

/**
 * Editorial section shell:
 * - layered gradient bridge between sections
 * - optional huge low-opacity backdrop word used as a visual anchor
 * - content sits on a clear z-10 layer
 */
export function CinematicSection({
  as: Tag = "section",
  className,
  children,
  backdropWord,
  backdropPosition = "start",
  innerClassName,
  glowTone = "violet",
  ...props
}: CinematicSectionProps) {
  return (
    <Tag
      className={cn("editorial-section", className)}
      {...props}
    >
      <AmbientGlow
        position="top-left"
        tone={glowTone}
        size="lg"
        className="opacity-60"
      />
      <AmbientGlow
        position="bottom-right"
        tone={glowTone === "violet" ? "cyan" : glowTone}
        size="md"
        className="opacity-40"
      />
      {backdropWord ? (
        <span
          aria-hidden="true"
          className={cn(
            "bg-word",
            "top-1/2 -translate-y-1/2 text-[18vw] sm:text-[16vw] lg:text-[13vw]",
            backdropPosition === "start" && "start-0 -translate-x-[5%]",
            backdropPosition === "center" &&
              "start-1/2 -translate-x-1/2 text-center",
            backdropPosition === "end" && "end-0 translate-x-[5%]"
          )}
        >
          {backdropWord}
        </span>
      ) : null}
      <div className={cn("relative z-10", innerClassName)}>{children}</div>
    </Tag>
  );
}
