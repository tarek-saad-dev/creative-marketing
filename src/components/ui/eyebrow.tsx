import { cn } from "@/lib/utils";

type EyebrowProps = React.HTMLAttributes<HTMLParagraphElement> & {
  as?: "p" | "span";
};

export function Eyebrow({
  className,
  as: Tag = "p",
  children,
  ...props
}: EyebrowProps) {
  return (
    <Tag
      className={cn(
        "inline-flex items-center gap-2 rounded-pill border border-border/70 bg-surface-glass px-3.5 py-1.5 text-xs font-semibold tracking-wide text-primary sm:text-sm",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
