const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Local calendar day as YYYY-MM-DD. Daily limits follow the learner's own day. */
export function localDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Whole calendar days from `from` to `to` (DST-safe). */
export function calendarDaysBetween(from: Date, to: Date): number {
  return Math.round(
    (startOfLocalDay(to).getTime() - startOfLocalDay(from).getTime()) / DAY,
  );
}

function plural(n: number, unit: string) {
  return `${n} ${unit}${n === 1 ? "" : "s"}`;
}

/** Human phrasing for when something is due, e.g. "in 3 days". */
export function formatDue(due: Date, now: Date): string {
  const diff = due.getTime() - now.getTime();
  if (diff <= 0) return "now";
  if (diff < HOUR)
    return `in ${plural(Math.max(1, Math.round(diff / MINUTE)), "minute")}`;
  const days = calendarDaysBetween(now, due);
  if (days === 0) return `in ${plural(Math.round(diff / HOUR), "hour")}`;
  if (days === 1) return "tomorrow";
  if (days < 45) return `in ${plural(days, "day")}`;
  if (days < 365) return `in ${plural(Math.round(days / 30), "month")}`;
  return `in ${plural(Math.round(days / 365), "year")}`;
}

/** Compact interval label for rating buttons, e.g. "10m", "3d". */
export function formatInterval(ms: number): string {
  if (ms < HOUR) return `${Math.max(1, Math.round(ms / MINUTE))}m`;
  if (ms < DAY) return `${Math.round(ms / HOUR)}h`;
  const days = Math.round(ms / DAY);
  if (days < 45) return `${days}d`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${Math.round(days / 365)}y`;
}

/** Long form of formatInterval for screen readers. */
export function describeInterval(ms: number): string {
  if (ms < HOUR) return plural(Math.max(1, Math.round(ms / MINUTE)), "minute");
  if (ms < DAY) return plural(Math.round(ms / HOUR), "hour");
  const days = Math.round(ms / DAY);
  if (days < 45) return plural(days, "day");
  if (days < 365) return plural(Math.round(days / 30), "month");
  return plural(Math.round(days / 365), "year");
}
