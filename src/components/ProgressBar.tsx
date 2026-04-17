import { cn } from "@/lib/utils";

interface Props {
  value: number; // 0-100
  className?: string;
  variant?: "hero" | "electric" | "sunset" | "success";
  showLabel?: boolean;
  height?: string;
}

export function ProgressBar({ value, className, variant = "electric", showLabel, height = "h-3" }: Props) {
  const v = Math.max(0, Math.min(100, value));
  const grad = {
    hero: "gradient-hero",
    electric: "gradient-electric",
    sunset: "gradient-sunset",
    success: "gradient-success",
  }[variant];

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("w-full bg-muted rounded-full overflow-hidden", height)}>
        <div
          className={cn(grad, "h-full rounded-full transition-all duration-700 ease-out animate-fill-bar")}
          style={{ width: `${v}%` }}
        />
      </div>
      {showLabel && (
        <div className="text-xs text-muted-foreground mt-1 text-right">{Math.round(v)}%</div>
      )}
    </div>
  );
}
