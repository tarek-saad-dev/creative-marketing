import Link from "next/link";
import { Eye } from "lucide-react";

/** Soft non-blocking notice when Cloudinary is unavailable. */
export function ManualImageHint() {
  return (
    <p className="rounded-md border border-border bg-muted/60 px-3 py-2 text-xs text-foreground-muted">
      يمكنك استخدام روابط الصور الآن، وربط Cloudinary لاحقًا.
    </p>
  );
}

export function ViewerReadonlyBanner({ canEdit }: { canEdit: boolean }) {
  if (canEdit) return null;
  return (
    <div
      role="status"
      className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
    >
      لديك صلاحية مشاهدة فقط.
    </div>
  );
}

export function OpenSiteLink({
  className = "",
  label = "فتح الموقع",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <a
      href="/"
      target="_blank"
      rel="noopener noreferrer"
      className={
        className ||
        "inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-semibold text-foreground-muted transition-colors hover:bg-muted hover:text-foreground"
      }
    >
      <Eye className="h-3.5 w-3.5" aria-hidden />
      {label}
    </a>
  );
}

export function ContentQuickStatus({
  items,
}: {
  items: Array<{ label: string; value: string | number; href?: string }>;
}) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map(item => {
        const body = (
          <>
            <p className="text-lg font-bold text-foreground">{item.value}</p>
            <p className="text-xs text-foreground-muted">{item.label}</p>
          </>
        );
        if (item.href) {
          return (
            <Link
              key={item.label}
              href={item.href}
              className="admin-card p-3 transition-shadow hover:shadow-card"
            >
              {body}
            </Link>
          );
        }
        return (
          <div key={item.label} className="admin-card p-3">
            {body}
          </div>
        );
      })}
    </div>
  );
}
