import { cn } from "@/lib/utils";

interface MockFeatureButtonProps {
  feature: string;
  children: React.ReactNode;
  className?: string;
}

// TODO(ADR-0004): 搜索与分享等交互仍未接入真实能力，先显式保留 Mock 标记。
export function MockFeatureButton({
  feature,
  children,
  className,
}: MockFeatureButtonProps) {
  return (
    <button
      type="button"
      data-kami-mock-feature={feature}
      className={cn(className)}
    >
      {children}
    </button>
  );
}
