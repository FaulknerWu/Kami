import { Button } from "@/components/ui/button";

export function AdminLoadingState({ label = "正在加载" }: { label?: string }) {
  return (
    <div className="flex min-h-[280px] items-center justify-center rounded-md border border-border bg-background px-6 text-sm text-muted-foreground">
      {label}
    </div>
  );
}

export function AdminErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-md border border-border bg-background px-6 text-center"
    >
      <div className="text-sm font-medium">加载失败</div>
      <div className="max-w-md text-xs text-muted-foreground">{message}</div>
      {onRetry ? (
        <Button type="button" variant="outline" size="sm" className="h-8" onClick={onRetry}>
          重试
        </Button>
      ) : null}
    </div>
  );
}
