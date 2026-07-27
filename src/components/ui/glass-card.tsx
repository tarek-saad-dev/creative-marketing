import { cn } from "@/lib/utils";

type GlassCardProps = React.HTMLAttributes<HTMLDivElement>;

export function GlassCard({ className, ...props }: GlassCardProps) {
  return (
    <div
      className={cn("glass-panel rounded-xl p-4 shadow-card", className)}
      {...props}
    />
  );
}
