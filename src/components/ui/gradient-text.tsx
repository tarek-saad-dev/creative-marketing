import { cn } from "@/lib/utils";

type GradientTextProps = React.HTMLAttributes<HTMLSpanElement>;

/**
 * Applies violet→cyan gradient to a short phrase only.
 * Do not wrap long paragraphs.
 */
export function GradientText({
  className,
  children,
  ...props
}: GradientTextProps) {
  return (
    <span className={cn("gradient-text font-semibold", className)} {...props}>
      {children}
    </span>
  );
}
