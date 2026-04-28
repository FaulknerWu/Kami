import type { AdminContentStatus } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: AdminContentStatus }) {
  const isPublished = status === "published";

  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1.5 rounded-sm border px-2 text-[11px] font-normal",
        isPublished
          ? "border-border bg-background text-foreground"
          : "border-border bg-muted text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isPublished ? "bg-foreground" : "bg-muted-foreground",
        )}
        aria-hidden
      />
      {isPublished ? "已发布" : "草稿"}
    </span>
  );
}
