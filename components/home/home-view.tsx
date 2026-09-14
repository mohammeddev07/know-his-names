"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Card, Page } from "@/components/ui/page";
import { starPoints } from "@/components/ui/star";
import { Mosaic, MosaicLegend } from "@/components/progress/mosaic";
import { useNow } from "@/hooks/use-now";
import { useProgress } from "@/hooks/use-progress";
import { getNameOfTheDay, NAMES, type DivineName } from "@/lib/content/names";
import { formatDue, localDayKey } from "@/lib/learning/dates";
import {
  countIntroducedOn,
  nextDueDate,
  summarizeProgress,
} from "@/lib/learning/progress";
import { remainingNewToday, selectNewNames } from "@/lib/learning/session";
import { getStatus } from "@/lib/learning/status";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
const namesLabel = (n: number) => `${n} ${n === 1 ? "Name" : "Names"}`;

/** Shown while progress loads, so the greeting paints immediately. */
const DEFAULT_SUBLINE = "Begin learning the Names of Allah, a few at a time.";

const HOME_GRID =
  "grid gap-x-12 gap-y-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]";

export function HomeView() {
  const progress = useProgress();
  const now = useNow();

  if (progress.status === "loading") return <HomeSkeleton />;

  const { cards, preferences, reviewsToday, lastActivityAt } = progress;
  const summary = summarizeProgress(NAMES, cards, now);
  const today = localDayKey(now);
  const learnedToday = countIntroducedOn(cards.values(), today);
  const newAvailable = selectNewNames(
    NAMES,
    cards,
    remainingNewToday(cards, preferences, now),
  ).length;
  const due = summary.dueNow;
  const firstVisit = summary.introduced === 0;
  const returning =
    lastActivityAt !== null && localDayKey(new Date(lastActivityAt)) !== today;
  const nextDue = nextDueDate(cards.values());
  const unavailable = progress.status === "unavailable";

  let subline: string;
  if (unavailable)
    subline = "Explore the 99 Names. Progress can't be saved in this browser.";
  else if (firstVisit) subline = DEFAULT_SUBLINE;
  else if (due > 0)
    subline = `${returning ? "Welcome back. " : ""}You have ${namesLabel(due)} ready to review.`;
  else if (newAvailable > 0)
    subline = `${returning ? "Welcome back. " : ""}Today's new Names are ready when you are.`;
  else subline = "You're all caught up for now.";

  const todayParts = [
    learnedToday > 0 && `learned ${namesLabel(learnedToday)}`,
    reviewsToday > 0 && `completed ${plural(reviewsToday, "review")}`,
  ].filter(Boolean);

  const mosaicItems = NAMES.map((name) => ({
    id: name.id,
    order: name.order,
    label: name.transliteration,
    status: getStatus(cards.get(name.id)),
  }));

  return (
    <Page width="wide">
      <div className={HOME_GRID}>
        <div className="mb-4 lg:col-start-1 lg:row-start-1 lg:mb-0">
          <HomeHeader subline={subline} />

          {!unavailable && (
            <NextStep
              due={due}
              newAvailable={newAvailable}
              firstVisit={firstVisit}
              allIntroduced={summary.introduced === summary.total}
              nextDue={nextDue ? formatDue(nextDue, now) : null}
            />
          )}

          {!unavailable && due > 0 && newAvailable > 0 && (
            <ButtonLink
              href="/learn"
              variant="secondary"
              size="lg"
              block
              className="mt-3"
            >
              Learn {newAvailable} new {newAvailable === 1 ? "Name" : "Names"}
            </ButtonLink>
          )}

          {todayParts.length > 0 && (
            <p className="mt-6 text-sm text-ink-2">
              Today you {todayParts.join(" and ")}.
            </p>
          )}

          {firstVisit && !unavailable && <HowItWorks />}
        </div>

        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <Card className="p-5 sm:p-6">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-base font-semibold text-ink">
                Your progress
              </h2>
              <Link
                href="/progress"
                className="-my-2 rounded-lg py-2 text-sm font-medium text-primary-soft-ink underline-offset-4 hover:underline"
              >
                See details
              </Link>
            </div>
            <p className="mt-1 text-sm text-ink-2">
              <span className="font-serif text-[1.625rem] text-ink tabular-nums">
                {summary.introduced}
              </span>{" "}
              of {summary.total} Names introduced
            </p>
            <Mosaic
              className="mt-5"
              items={mosaicItems}
              label={`${summary.introduced} of ${summary.total} Names introduced: ${summary.counts.strong} strong, ${summary.counts.reviewing} reviewing, ${summary.counts.learning} learning.`}
            />
            <MosaicLegend counts={summary.counts} className="mt-5" />
          </Card>
        </div>

        <div className="lg:col-start-1 lg:row-start-2">
          <NameOfTheDay name={getNameOfTheDay(now)} />
        </div>
      </div>
    </Page>
  );
}

function HomeHeader({ subline }: { subline: string }) {
  return (
    <header className="mb-7">
      <h1 className="font-serif text-[2.375rem] leading-[1.05] tracking-[-0.015em] text-ink sm:text-[2.875rem]">
        Assalamu alaikum
      </h1>
      <p className="mt-2.5 text-[1.0625rem] leading-relaxed text-ink-2">
        {subline}
      </p>
    </header>
  );
}

const HERO_STAR_OUTER = starPoints(200, 2);
const HERO_STAR_INNER = starPoints(200, 38);

function NextStep({
  due,
  newAvailable,
  firstVisit,
  allIntroduced,
  nextDue,
}: {
  due: number;
  newAvailable: number;
  firstVisit: boolean;
  allIntroduced: boolean;
  nextDue: string | null;
}) {
  let title: string;
  let body: string;
  let action: { href: string; label: string };

  if (due > 0) {
    title = `Review ${namesLabel(due)}`;
    body = "Recall each meaning, then rate how well you remembered it.";
    action = { href: "/review", label: "Start review" };
  } else if (newAvailable > 0) {
    title = firstVisit
      ? `Begin with ${namesLabel(newAvailable)}`
      : `Learn ${newAvailable} new ${newAvailable === 1 ? "Name" : "Names"}`;
    body = "Meet each Name, then practise recalling its meaning.";
    action = {
      href: "/learn",
      label: firstVisit ? "Start learning" : "Continue learning",
    };
  } else if (allIntroduced) {
    title = "All caught up";
    body = nextDue
      ? `You've met all 99 Names. Your next review is ${nextDue}.`
      : "You've met all 99 Names.";
    action = { href: "/explore", label: "Explore the Names" };
  } else {
    title = "Today's Names are learned";
    body = nextDue
      ? `Your next review is ${nextDue}. New Names will be ready tomorrow.`
      : "New Names will be ready tomorrow.";
    action = { href: "/explore", label: "Explore the Names" };
  }

  return (
    <section
      aria-labelledby="next-step-title"
      className="relative isolate overflow-hidden rounded-[1.75rem] bg-hero p-6 text-hero-ink shadow-raised sm:p-8"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 200 200"
        className="pointer-events-none absolute -top-20 -right-24 -z-10 size-56 text-hero-motif opacity-20 sm:-top-16 sm:-right-16 sm:size-64"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <polygon points={HERO_STAR_OUTER} />
        <polygon points={HERO_STAR_INNER} />
      </svg>
      <h2
        id="next-step-title"
        className="max-w-[18ch] font-serif text-[2rem] leading-[1.08] tracking-[-0.01em] sm:text-[2.375rem]"
      >
        {title}
      </h2>
      <p className="mt-2.5 max-w-[34ch] text-[0.9375rem] leading-relaxed text-hero-ink-2">
        {body}
      </p>
      <ButtonLink
        href={action.href}
        variant="hero"
        size="lg"
        block
        className="mt-7"
      >
        {action.label}
      </ButtonLink>
      {!allIntroduced && due === 0 && newAvailable === 0 && (
        <Link
          href="/learn?more=1"
          className="mt-3 block rounded-lg py-2 text-center text-sm font-medium text-hero-ink-2 underline-offset-4 hover:text-hero-ink hover:underline"
        >
          Learn more today
        </Link>
      )}
    </section>
  );
}

function HowItWorks() {
  const steps = [
    ["Meet a Name", "See it in Arabic, with its transliteration and meaning."],
    ["Recall it", "Before the meaning is shown, try to remember it yourself."],
    [
      "Review at the right time",
      "Names you find hard come back sooner. Names you know well come back later.",
    ],
  ];
  return (
    <section
      aria-labelledby="how-it-works"
      className="mt-8 rounded-3xl border border-line bg-surface p-6 shadow-card"
    >
      <h2 id="how-it-works" className="font-serif text-xl text-ink">
        How it works
      </h2>
      <ol className="mt-4 space-y-4">
        {steps.map(([title, text], i) => (
          <li key={title} className="flex gap-4">
            <span
              aria-hidden="true"
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gold-soft text-sm font-semibold text-gold-ink"
            >
              {i + 1}
            </span>
            <div>
              <p className="font-medium text-ink">{title}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-ink-2">
                {text}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-5 border-t border-line pt-4 text-sm text-ink-2">
        No account needed. Your progress is saved on this device.
      </p>
    </section>
  );
}

function NameOfTheDay({ name }: { name: DivineName }) {
  return (
    <Link
      href={`/names/${name.id}`}
      className="group block rounded-3xl border border-line bg-surface p-5 shadow-card transition-colors duration-200 hover:border-line-strong sm:p-6"
    >
      <span className="flex items-center justify-between text-base font-semibold text-ink">
        Name of the day
        <ChevronRight
          aria-hidden="true"
          className="size-4 text-ink-3 transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </span>
      <span className="mt-3 flex items-end justify-between gap-4">
        <span className="min-w-0">
          <span className="block font-serif text-lg text-ink italic">
            {name.transliteration}
          </span>
          <span className="block text-sm text-ink-2">{name.shortMeaning}</span>
        </span>
        <span lang="ar" dir="rtl" className="shrink-0 text-arabic-md text-ink">
          {name.arabic}
        </span>
      </span>
    </Link>
  );
}

/** The greeting renders at once; only the progress-dependent parts wait. */
function HomeSkeleton() {
  return (
    <Page width="wide">
      <div aria-busy="true" className={HOME_GRID}>
        <span className="sr-only" role="status">
          Loading your progress
        </span>
        <div className="mb-4 lg:col-start-1 lg:row-start-1 lg:mb-0">
          <HomeHeader subline={DEFAULT_SUBLINE} />
          <div className="h-64 animate-pulse rounded-[1.75rem] bg-surface-2" />
        </div>
        <div className="h-80 animate-pulse rounded-3xl bg-surface-2 lg:col-start-2 lg:row-span-2 lg:row-start-1" />
      </div>
    </Page>
  );
}
