"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Builds page hrefs internally from serializable `basePath` + `searchParams`
 * (never accepts a function prop — functions cannot cross the server/client
 * boundary from an RSC into this Client Component).
 */
export function AdminPagination({
  page,
  totalPages,
  basePath,
  searchParams = {},
}: {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function hrefForPage(targetPage: number): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) params.set(key, value);
    }
    params.set("page", String(targetPage));
    return `${basePath}?${params.toString()}`;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).slice(
    0,
    20
  );

  return (
    <nav
      className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs"
      aria-label="ترقيم الصفحات"
    >
      {page > 1 ? (
        <Link
          href={hrefForPage(page - 1)}
          className="rounded-md border border-border px-2 py-1"
        >
          السابق
        </Link>
      ) : null}
      {pages.map(p => (
        <Link
          key={p}
          href={hrefForPage(p)}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md",
            p === page
              ? "bg-primary text-primary-foreground"
              : "text-foreground-muted hover:bg-muted"
          )}
          aria-current={p === page ? "page" : undefined}
        >
          {p}
        </Link>
      ))}
      {page < totalPages ? (
        <Link
          href={hrefForPage(page + 1)}
          className="rounded-md border border-border px-2 py-1"
        >
          التالي
        </Link>
      ) : null}
    </nav>
  );
}
