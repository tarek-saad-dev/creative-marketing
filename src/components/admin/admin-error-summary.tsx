export function AdminErrorSummary({
  error,
  fieldErrors,
}: {
  error?: string | null;
  fieldErrors?: Record<string, string[]> | null;
}) {
  if (!error && (!fieldErrors || Object.keys(fieldErrors).length === 0)) {
    return null;
  }

  return (
    <div
      role="alert"
      className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
    >
      {error ? <p>{error}</p> : null}
      {fieldErrors
        ? Object.entries(fieldErrors).map(([field, messages]) => (
            <p key={field} className="mt-1 text-xs">
              {field}: {messages.join(" · ")}
            </p>
          ))
        : null}
    </div>
  );
}
