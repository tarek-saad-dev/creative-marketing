"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useId,
  type ReactElement,
  type ReactNode,
} from "react";

export function Field({
  label,
  error,
  hint,
  children,
  htmlFor,
  required,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  htmlFor?: string;
  required?: boolean;
}) {
  const autoId = useId();
  const id = htmlFor ?? autoId;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy =
    [error ? errorId : null, hint && !error ? hintId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  const control = Children.map(children, child => {
    if (!isValidElement(child)) return child;
    const el = child as ReactElement<{
      id?: string;
      "aria-invalid"?: boolean | "true" | "false";
      "aria-describedby"?: string;
      "aria-required"?: boolean | "true" | "false";
    }>;
    return cloneElement(el, {
      id: el.props.id ?? id,
      "aria-invalid": error ? true : el.props["aria-invalid"],
      "aria-describedby": describedBy ?? el.props["aria-describedby"],
      "aria-required": required ? true : el.props["aria-required"],
    });
  });

  return (
    <div>
      <label htmlFor={id} className="admin-label">
        {label}
        {required ? (
          <span className="text-destructive" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
        {required ? <span className="sr-only"> (مطلوب)</span> : null}
      </label>
      {control}
      {hint && !error ? (
        <p id={hintId} className="mt-1 text-xs text-foreground-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-1 text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
