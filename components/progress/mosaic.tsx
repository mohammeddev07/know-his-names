import { starPoints } from "@/components/ui/star";
import { cn } from "@/lib/cn";
import {
  LEARNING_STATUSES,
  STATUS_LABELS,
  type LearningStatus,
} from "@/lib/learning/status";

export interface MosaicItem {
  id: string;
  order: number;
  label: string;
  status: LearningStatus;
}

const CELL = 24;
const COLUMNS = 11;
const STAR = starPoints(CELL, 1.25);

/**
 * Tile styling per status. Shape differs too: outline, outline with dot,
 * filled, filled with dot — so status never depends on colour alone.
 */
const tileClass: Record<LearningStatus, string> = {
  "not-started": "fill-transparent stroke-line-strong",
  learning: "fill-gold-soft stroke-gold",
  reviewing: "fill-primary-soft stroke-primary",
  strong: "fill-primary stroke-primary",
};

const hasDot = (status: LearningStatus) =>
  status === "learning" || status === "strong";

/** All 99 Names as a field of eight-pointed stars that fills as you learn. */
export function Mosaic({
  items,
  label,
  className,
}: {
  items: readonly MosaicItem[];
  label: string;
  className?: string;
}) {
  const rows = Math.ceil(items.length / COLUMNS);
  return (
    <svg
      viewBox={`0 0 ${COLUMNS * CELL} ${rows * CELL}`}
      role="img"
      aria-label={label}
      className={cn("block h-auto w-full", className)}
    >
      {items.map((item, i) => (
        <g
          key={item.id}
          transform={`translate(${(i % COLUMNS) * CELL} ${Math.floor(i / COLUMNS) * CELL})`}
          className={cn(
            "transition-[fill,stroke] duration-300 ease-calm",
            tileClass[item.status],
          )}
        >
          <title>{`${item.order}. ${item.label}: ${STATUS_LABELS[item.status]}`}</title>
          <polygon points={STAR} strokeWidth={1.1} strokeLinejoin="round" />
          {hasDot(item.status) && (
            <circle
              cx={CELL / 2}
              cy={CELL / 2}
              r={2.3}
              className="fill-gold stroke-none"
            />
          )}
        </g>
      ))}
    </svg>
  );
}

const LEGEND_STAR = starPoints(16, 1);

export function MosaicLegend({
  counts,
  className,
}: {
  counts: Record<LearningStatus, number>;
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:flex sm:flex-wrap sm:gap-x-5",
        className,
      )}
    >
      {LEARNING_STATUSES.map((status) => (
        <li key={status} className="flex items-center gap-2 text-ink-2">
          <svg
            viewBox="0 0 16 16"
            aria-hidden="true"
            className="size-4 shrink-0"
          >
            <g className={tileClass[status]}>
              <polygon
                points={LEGEND_STAR}
                strokeWidth={1.1}
                strokeLinejoin="round"
              />
              {hasDot(status) && (
                <circle
                  cx="8"
                  cy="8"
                  r="1.6"
                  className="fill-gold stroke-none"
                />
              )}
            </g>
          </svg>
          {STATUS_LABELS[status]}
          <span className="font-medium text-ink tabular-nums">
            {counts[status]}
          </span>
        </li>
      ))}
    </ul>
  );
}
