"use client";

import { CircleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { StatusGlyph } from "@/components/learning/status-badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, Page, PageHeader, Section } from "@/components/ui/page";
import { useNow } from "@/hooks/use-now";
import { useProgress } from "@/hooks/use-progress";
import { NAMES } from "@/lib/content/names";
import {
  reviewForecast,
  reviewsByDay,
  summarizeProgress,
} from "@/lib/learning/progress";
import {
  getStatus,
  needsAttention,
  STATUS_LABELS,
} from "@/lib/learning/status";
import type { ReviewEvent } from "@/lib/learning/types";
import { ConsistencyStrip, ForecastBars } from "./activity";
import { Mosaic, MosaicLegend } from "./mosaic";

const CONSISTENCY_DAYS = 14;
const FORECAST_DAYS = 7;

export function ProgressView() {
  const progress = useProgress();
  const now = useNow();
  const [history, setHistory] = useState<ReviewEvent[] | null>(null);
  const { status, loadHistory, reviewsToday } = progress;

  useEffect(() => {
    if (status !== "ready") return;
    let active = true;
    loadHistory()
      .then((events) => active && setHistory(events))
      .catch(() => active && setHistory([]));
    return () => {
      active = false;
    };
  }, [status, loadHistory, reviewsToday]);

  if (status === "loading") {
    return (
      <Page width="wide">
        <PageHeader title="Your journey" />
        <div
          className="h-96 animate-pulse rounded-3xl bg-surface-2"
          aria-busy="true"
        />
      </Page>
    );
  }

  const { cards } = progress;
  const summary = summarizeProgress(NAMES, cards, now);
  const items = NAMES.map((name) => ({
    id: name.id,
    order: name.order,
    label: name.transliteration,
    status: getStatus(cards.get(name.id)),
  }));
  const attentionNames = NAMES.filter((name) =>
    needsAttention(cards.get(name.id)),
  );
  const forecast = reviewForecast(cards.values(), FORECAST_DAYS, now);
  const recent = history ? reviewsByDay(history, CONSISTENCY_DAYS, now) : null;
  const activeDays = recent?.filter((d) => d.count > 0).length ?? 0;
  const started = summary.introduced > 0;

  return (
    <Page width="wide">
      <PageHeader
        title="Your journey"
        description={
          started
            ? "Every Name you meet takes its place in the pattern below."
            : "As you learn, each Name takes its place in the pattern below."
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Card className="p-5 sm:p-7">
          <p className="flex items-baseline gap-2">
            <span className="font-serif text-[3.5rem] leading-none text-ink tabular-nums">
              {summary.introduced}
            </span>
            <span className="font-serif text-2xl text-ink-3">
              / {summary.total}
            </span>
          </p>
          <p className="mt-1 text-ink-2">Names introduced</p>
          <Mosaic
            className="mt-6"
            items={items}
            label={`${summary.introduced} of ${summary.total} Names introduced.`}
          />
          <MosaicLegend counts={summary.counts} className="mt-5" />
          {!started && (
            <ButtonLink href="/learn" size="lg" block className="mt-6">
              Start learning
            </ButtonLink>
          )}
        </Card>

        <div className="grid grid-cols-2 gap-3 self-start">
          <Stat
            label={STATUS_LABELS.strong}
            value={summary.counts.strong}
            icon={
              <StatusGlyph status="strong" className="size-4 text-primary" />
            }
          />
          <Stat
            label={STATUS_LABELS.reviewing}
            value={summary.counts.reviewing}
            icon={
              <StatusGlyph status="reviewing" className="size-4 text-primary" />
            }
          />
          <Stat
            label={STATUS_LABELS.learning}
            value={summary.counts.learning}
            icon={
              <StatusGlyph status="learning" className="size-4 text-gold" />
            }
          />
          <Stat
            label="Need attention"
            value={summary.attention}
            icon={
              <CircleAlert aria-hidden="true" className="size-4 text-danger" />
            }
          />
          <Stat label="Ready to review" value={summary.dueNow} />
          <Stat
            label="Reviews completed"
            value={history ? history.length : null}
          />
        </div>
      </div>

      <div className="grid gap-x-8 lg:grid-cols-2">
        <Section
          title="Recent consistency"
          description={
            recent
              ? `You studied on ${activeDays} of the last ${CONSISTENCY_DAYS} days.`
              : undefined
          }
        >
          <Card className="p-5">
            {recent ? (
              <ConsistencyStrip days={recent} />
            ) : (
              <div className="h-12 animate-pulse rounded-lg bg-surface-2" />
            )}
            <p className="mt-4 text-sm text-ink-2">
              Missed a day? That&apos;s fine. Reviews simply wait for you.
            </p>
          </Card>
        </Section>

        <Section
          title="Coming up"
          description="Reviews due over the next week."
        >
          <Card className="p-5">
            <ForecastBars days={forecast} />
          </Card>
        </Section>
      </div>

      <Section
        title="Needs attention"
        description="Names you've recently forgotten. They will come back more often."
      >
        {attentionNames.length > 0 ? (
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {attentionNames.map((name) => (
              <li key={name.id}>
                <Link
                  href={`/names/${name.id}`}
                  className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-2 transition-colors duration-200 hover:border-line-strong"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-ink">
                      {name.transliteration}
                    </span>
                    <span className="block truncate text-sm text-ink-2">
                      {name.shortMeaning}
                    </span>
                  </span>
                  <span
                    lang="ar"
                    dir="rtl"
                    className="shrink-0 text-arabic-sm text-ink"
                  >
                    {name.arabic}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-line-strong px-5 py-6 text-sm text-ink-2">
            Nothing needs extra attention right now.
          </p>
        )}
      </Section>
    </Page>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | null;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
      <p className="flex items-center gap-2 text-sm text-ink-2">
        {icon}
        {label}
      </p>
      <p className="mt-1.5 font-serif text-[2rem] leading-none text-ink tabular-nums">
        {value ?? "–"}
      </p>
    </div>
  );
}
