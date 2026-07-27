import { Eye } from "lucide-react";
import { enablePreviewAction } from "@/server/actions/preview.action";

export function PreviewButton({
  path,
  label = "معاينة",
}: {
  path: string;
  label?: string;
}) {
  return (
    <form action={enablePreviewAction.bind(null, path)}>
      <button
        type="submit"
        className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-semibold text-foreground-muted hover:bg-muted hover:text-foreground"
      >
        <Eye className="h-3.5 w-3.5" />
        {label}
      </button>
    </form>
  );
}
