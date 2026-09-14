"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { StatusGlyph } from "@/components/learning/status-badge";
import { Button } from "@/components/ui/button";
import { SearchField } from "@/components/ui/search-field";
import { useProgress } from "@/hooks/use-progress";
import { cn } from "@/lib/cn";
import { NAMES, type DivineName } from "@/lib/content/names";
import { matchesQuery } from "@/lib/content/search";
import {
  getStatus,
  LEARNING_STATUSES,
  STATUS_LABELS,
  type LearningStatus,
} from "@/lib/learning/status";

type Filter = LearningStatus | "all";

export function ExploreView() {
  const { cards, status: loadStatus } = useProgress();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const deferredQuery = useDeferredValue(query);
  const ready = loadStatus === "ready";

  const statuses = useMemo(
    () =>
      new Map(NAMES.map((name) => [name.id, getStatus(cards.get(name.id))])),
    [cards],
  );

  const counts = useMemo(() => {
    const tally = { all: NAMES.length } as Record<Filter, number>;
    for (const status of LEARNING_STATUSES) tally[status] = 0;
    for (const status of statuses.values()) tally[status] += 1;
    return tally;
  }, [statuses]);

  const visible = NAMES.filter(
    (name) =>
      (filter === "all" || statuses.get(name.id) === filter) &&
      matchesQuery(name, deferredQuery),
  );

  const filters: Filter[] = ["all", ...LEARNING_STATUSES];

  return (
    <div>
      <SearchField
        label="Search the Names"
        placeholder="Search by name, meaning or number"
        value={query}
        onChange={setQuery}
      />

      {ready && (
        <div
          role="group"
          aria-label="Filter by learning status"
          className="mt-3 flex flex-wrap gap-2"
        >
          {filters.map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(f)}
                className={cn(
                  "inline-flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors duration-200",
                  active
                    ? "border-transparent bg-ink text-bg"
                    : "border-line bg-surface text-ink-2 hover:border-line-strong hover:text-ink",
                )}
              >
                {f !== "all" && <StatusGlyph status={f} className="size-3.5" />}
                {f === "all" ? "All" : STATUS_LABELS[f]}
                <span
                  className={cn(
                    "tabular-nums",
                    active ? "text-bg/70" : "text-ink-3",
                  )}
                >
                  {counts[f]}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <p className="sr-only" role="status" aria-live="polite">
        {visible.length === NAMES.length
          ? ""
          : `${visible.length} ${visible.length === 1 ? "Name" : "Names"} shown`}
      </p>

      {visible.length > 0 ? (
        <ul className="mt-6 grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3">
          {visible.map((name) => (
            <li key={name.id}>
              <NameRow
                name={name}
                status={ready ? statuses.get(name.id) : undefined}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-10 rounded-3xl border border-dashed border-line-strong px-6 py-10 text-center">
          <p className="font-serif text-xl text-ink">No Names match</p>
          <p className="mx-auto mt-2 max-w-xs text-sm text-ink-2">
            {query
              ? "Try a meaning such as “mercy”, a Name such as “Rahman”, or a number."
              : "No Names have this status yet."}
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-5"
            onClick={() => {
              setQuery("");
              setFilter("all");
            }}
          >
            Show all Names
          </Button>
        </div>
      )}
    </div>
  );
}

function NameRow({
  name,
  status,
}: {
  name: DivineName;
  status?: LearningStatus;
}) {
  return (
    <Link
      href={`/names/${name.id}`}
      className="flex min-h-[4.75rem] items-center gap-3 rounded-2xl border border-line bg-surface py-3 pr-4 pl-3 shadow-card transition-[border-color,background-color] duration-200 hover:border-line-strong hover:bg-surface-2/40 sm:gap-4 sm:pl-4"
    >
      <span className="w-7 shrink-0 text-center text-sm text-ink-3 tabular-nums">
        {String(name.order).padStart(2, "0")}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate font-medium text-ink">
            {name.transliteration}
          </span>
          {status && (
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1 text-xs",
                status === "not-started"
                  ? "text-ink-3"
                  : "text-primary-soft-ink",
                status === "learning" && "text-gold-ink",
              )}
              title={STATUS_LABELS[status]}
            >
              <StatusGlyph status={status} className="size-3.5" />
              <span className="sr-only sm:not-sr-only">
                {STATUS_LABELS[status]}
              </span>
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-sm leading-snug text-ink-2">
          {name.shortMeaning}
        </span>
      </span>
      <span
        lang="ar"
        dir="rtl"
        className="max-w-[42%] shrink-0 text-right text-arabic-sm leading-snug text-ink"
      >
        {name.arabic}
      </span>
    </Link>
  );
}
