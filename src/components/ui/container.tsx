import { cn } from "@/lib/utils";

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  width?: "default" | "wide" | "reading";
  as?: "div" | "section" | "header" | "footer" | "nav" | "main";
};

export function Container({
  className,
  width = "default",
  as: Tag = "div",
  ...props
}: ContainerProps) {
  const widthClass =
    width === "wide"
      ? "container-wide"
      : width === "reading"
        ? "container-reading"
        : "container-brand";

  return <Tag className={cn(widthClass, className)} {...props} />;
}
