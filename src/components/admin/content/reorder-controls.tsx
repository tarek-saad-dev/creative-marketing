"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { moveServiceAction } from "@/server/actions/admin/service.action";
import { moveFaqAction } from "@/server/actions/admin/faq.action";

function MoveButtons({
  onUp,
  onDown,
  pending,
  label,
}: {
  onUp: () => void;
  onDown: () => void;
  pending: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        disabled={pending}
        onClick={onUp}
        className="flex h-9 w-9 items-center justify-center rounded-md text-foreground-muted hover:bg-muted hover:text-foreground disabled:opacity-40"
        aria-label={`نقل ${label} للأعلى`}
      >
        <ChevronUp className="h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={onDown}
        className="flex h-9 w-9 items-center justify-center rounded-md text-foreground-muted hover:bg-muted hover:text-foreground disabled:opacity-40"
        aria-label={`نقل ${label} للأسفل`}
      >
        <ChevronDown className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

export function ServiceMoveControls({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function move(direction: "up" | "down") {
    startTransition(async () => {
      await moveServiceAction(id, direction);
      router.refresh();
    });
  }

  return (
    <MoveButtons
      pending={pending}
      label="الخدمة"
      onUp={() => move("up")}
      onDown={() => move("down")}
    />
  );
}

export function FaqMoveControls({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function move(direction: "up" | "down") {
    startTransition(async () => {
      await moveFaqAction(id, direction);
      router.refresh();
    });
  }

  return (
    <MoveButtons
      pending={pending}
      label="السؤال"
      onUp={() => move("up")}
      onDown={() => move("down")}
    />
  );
}
