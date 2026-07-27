"use client";

import Link from "next/link";
import {
  CONTENT_SECTIONS,
  type ContentSectionId,
} from "@/lib/admin/content-sections";

export function ContentSectionNav({ active }: { active: ContentSectionId }) {
  return (
    <>
      {/* Mobile: select */}
      <div className="mb-4 md:hidden">
        <label className="admin-label" htmlFor="content-section-select">
          قسم المحتوى
        </label>
        <select
          id="content-section-select"
          className="admin-input"
          value={active}
          onChange={event => {
            window.location.href = `/admin/content?section=${event.target.value}`;
          }}
        >
          {CONTENT_SECTIONS.map(section => (
            <option key={section.id} value={section.id}>
              {section.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tablet/desktop: horizontal tabs */}
      <nav
        className="mb-6 hidden gap-1 overflow-x-auto pb-1 md:flex"
        aria-label="أقسام محتوى الموقع"
      >
        {CONTENT_SECTIONS.map(section => {
          const isActive = section.id === active;
          return (
            <Link
              key={section.id}
              href={`/admin/content?section=${section.id}`}
              aria-current={isActive ? "page" : undefined}
              className={
                isActive
                  ? "shrink-0 rounded-full bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground"
                  : "shrink-0 rounded-full px-3.5 py-2 text-sm font-medium text-foreground-muted hover:bg-muted hover:text-foreground"
              }
            >
              {section.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
