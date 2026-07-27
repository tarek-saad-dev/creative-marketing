import { cn } from "@/lib/utils";

type BackgroundGlowProps = {
  className?: string;
  tone?: "aqua" | "violet" | "cyan";
};

export function BackgroundGlow({
  className,
  tone = "violet",
}: BackgroundGlowProps) {
  const toneClass =
    tone === "aqua"
      ? "bg-brand-aqua/20"
      : tone === "cyan"
        ? "bg-brand-cyan/20"
        : "bg-brand-violet/25";

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute rounded-full blur-3xl",
        toneClass,
        className
      )}
    />
  );
}
