import { cn } from "@/lib/utils";

type AmbientGlowProps = {
  position:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "center-top"
    | "center-bottom";
  tone?: "violet" | "aqua" | "cyan";
  size?: "sm" | "md" | "lg";
  className?: string;
};

const toneColors: Record<string, string> = {
  violet: "rgba(109, 40, 217, 0.22)",
  aqua: "rgba(39, 232, 199, 0.16)",
  cyan: "rgba(34, 211, 238, 0.16)",
};

const positionClasses: Record<string, string> = {
  "top-left": "-start-24 -top-24",
  "top-right": "-end-24 -top-24",
  "bottom-left": "-start-24 -bottom-24",
  "bottom-right": "-end-24 -bottom-24",
  "center-top": "start-1/2 -top-32 -translate-x-1/2",
  "center-bottom": "start-1/2 -bottom-32 -translate-x-1/2",
};

const sizeClasses: Record<string, string> = {
  sm: "h-64 w-64",
  md: "h-96 w-96",
  lg: "h-[28rem] w-[28rem]",
};

/**
 * A large, soft radial glow used as a section atmospheric element.
 * It is not interactive and is hidden from assistive technologies.
 */
export function AmbientGlow({
  position,
  tone = "violet",
  size = "md",
  className,
}: AmbientGlowProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute rounded-full blur-[90px] animate-shimmer",
        positionClasses[position],
        sizeClasses[size],
        className
      )}
      style={{
        background: `radial-gradient(circle at center, ${toneColors[tone]}, transparent 65%)`,
      }}
    />
  );
}
