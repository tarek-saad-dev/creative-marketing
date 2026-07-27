import { cn } from "@/lib/utils";

type LightCardProps = React.HTMLAttributes<HTMLDivElement>;

export function LightCard({ className, ...props }: LightCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/40 bg-surface-light p-4 text-brand-navy shadow-soft",
        className
      )}
      {...props}
    />
  );
}
