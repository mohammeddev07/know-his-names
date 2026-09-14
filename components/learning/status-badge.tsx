import { starPoints } from "@/components/ui/star";
import { cn } from "@/lib/cn";
import { STATUS_LABELS, type LearningStatus } from "@/lib/learning/status";

const STAR = starPoints(16, 1);

/**
 * Each status has its own shape (dashed ring, dot, half, star) so it reads
 * without relying on colour.
 */
export function StatusGlyph({
  status,
  className,
}: {
  status: LearningStatus;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      fill="none"
    >
      {status === "strong" ? (
        <polygon points={STAR} fill="currentColor" />
      ) : (
        <circle
          cx="8"
          cy="8"
          r="5.75"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray={status === "not-started" ? "2.4 2.1" : undefined}
        />
      )}
      {status === "learning" && (
        <circle cx="8" cy="8" r="2.25" fill="currentColor" />
      )}
      {status === "reviewing" && (
        <path d="M8 2.25a5.75 5.75 0 0 1 0 11.5Z" fill="currentColor" />
      )}
    </svg>
  );
}

const badgeTone: Record<LearningStatus, string> = {
  "not-started": "text-ink-3",
  learning: "bg-gold-soft px-2.5 text-gold-ink",
  reviewing: "bg-primary-soft px-2.5 text-primary-soft-ink",
  strong: "bg-primary px-2.5 text-primary-ink",
};

export function StatusBadge({
  status,
  className,
}: {
  status: LearningStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full text-xs font-medium whitespace-nowrap",
        badgeTone[status],
        className,
      )}
    >
      <StatusGlyph status={status} className="size-3.5" />
      {STATUS_LABELS[status]}
    </span>
  );
}
