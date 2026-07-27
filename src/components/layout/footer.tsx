import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background/30">
      <div className="container-brand flex flex-col items-center gap-4 py-10 md:flex-row md:justify-between">
        <div className="text-center md:text-start">
          <p className="font-headline text-base font-semibold text-foreground">
            Creative Marketing
          </p>
          <p className="mt-1 text-xs tracking-wide text-muted-foreground">
            WE THINK. WE CREATE. YOU GROW.
          </p>
        </div>
        <nav aria-label="تذييل الموقع">
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            الرئيسية
          </Link>
        </nav>
        <p className="text-center text-xs text-muted-foreground md:text-end">
          © {new Date().getFullYear()} Creative Marketing
        </p>
      </div>
    </footer>
  );
}
