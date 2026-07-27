import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const brandButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill text-sm font-semibold transition-all duration-base ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 min-h-11 px-6",
  {
    variants: {
      variant: {
        primary:
          "bg-[image:var(--gradient-cta)] text-primary-foreground shadow-soft hover:brightness-105",
        secondary:
          "border border-border-strong bg-surface-glass text-foreground hover:bg-muted/60",
        ghost: "text-foreground hover:bg-muted/50",
      },
      size: {
        default: "min-h-11 px-6 text-sm",
        lg: "min-h-12 px-8 text-base",
        sm: "min-h-10 px-4 text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

type BrandButtonProps = VariantProps<typeof brandButtonVariants> & {
  className?: string;
  children: React.ReactNode;
  href?: string;
  type?: "button" | "submit" | "reset";
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  disabled?: boolean;
  "aria-label"?: string;
};

export function BrandButton({
  className,
  variant,
  size,
  href,
  children,
  type = "button",
  onClick,
  disabled,
  ...props
}: BrandButtonProps) {
  const classes = cn(
    brandButtonVariants({ variant, size }),
    disabled && "pointer-events-none opacity-50",
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export { brandButtonVariants };
