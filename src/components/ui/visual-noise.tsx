import { cn } from "@/lib/utils";

type VisualNoiseProps = {
  className?: string;
  opacity?: number;
};

/**
 * Subtle grain overlay. Pure CSS; decorative only.
 */
export function VisualNoise({ className, opacity = 0.04 }: VisualNoiseProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        opacity,
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")",
        backgroundSize: "180px 180px",
        mixBlendMode: "soft-light",
      }}
    />
  );
}
