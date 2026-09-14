import { cn } from "@/lib/cn";
import type { DayCount } from "@/lib/learning/progress";

const weekday = new Intl.DateTimeFormat(undefined, { weekday: "short" });
const fullDate = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
});

/** Recent study days. Shows presence, never a streak to lose. */
export function ConsistencyStrip({ days }: { days: readonly DayCount[] }) {
  return (
    <ol
      className="grid grid-cols-7 gap-1.5 sm:grid-cols-14"
      aria-label="Recent days"
    >
      {days.map((d) => (
        <li
          key={d.day}
          title={`${fullDate.format(d.date)}: ${d.count} ${d.count === 1 ? "review" : "reviews"}`}
          className={cn(
            "aspect-square rounded-lg",
            d.count === 0 && "border border-dashed border-line-strong",
            d.count > 0 && d.count < 10 && "bg-primary/35",
            d.count >= 10 && d.count < 25 && "bg-primary/70",
            d.count >= 25 && "bg-primary",
          )}
        >
          <span className="sr-only">
            {fullDate.format(d.date)}: {d.count}{" "}
            {d.count === 1 ? "review" : "reviews"}
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Reviews coming due over the next days. */
export function ForecastBars({ days }: { days: readonly DayCount[] }) {
  const max = Math.max(1, ...days.map((d) => d.count));
  return (
    <ol
      className="grid grid-cols-7 items-end gap-2"
      aria-label="Reviews coming up"
    >
      {days.map((d, i) => (
        <li key={d.day} className="flex flex-col items-center gap-1.5">
          <span className="text-xs text-ink-2 tabular-nums" aria-hidden="true">
            {d.count}
          </span>
          <span className="flex h-24 w-full items-end" aria-hidden="true">
            <span
              className={cn(
                "w-full rounded-t-md transition-[height] duration-300 ease-calm",
                d.count > 0 ? "bg-primary/75" : "bg-surface-3",
              )}
              style={{ height: `${Math.max(4, (d.count / max) * 100)}%` }}
            />
          </span>
          <span className="text-xs text-ink-3" aria-hidden="true">
            {i === 0 ? "Today" : weekday.format(d.date)}
          </span>
          <span className="sr-only">
            {i === 0 ? "Today" : fullDate.format(d.date)}: {d.count}{" "}
            {d.count === 1 ? "review" : "reviews"}
          </span>
        </li>
      ))}
    </ol>
  );
}
