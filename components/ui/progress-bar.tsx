import { cn } from "@/lib/cn";

interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
  className?: string;
}

/** Thin, calm progress track. */
export function ProgressBar({
  value,
  max,
  label,
  className,
}: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn(
        "h-1.5 overflow-hidden rounded-full bg-surface-3",
        className,
      )}
    >
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-250 ease-calm"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
