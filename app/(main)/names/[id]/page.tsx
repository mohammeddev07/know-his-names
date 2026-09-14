import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Explanation } from "@/components/learning/explanation";
import { NameDisplay } from "@/components/learning/name-display";
import { Ornament } from "@/components/learning/ornament";
import { NameProgressPanel } from "@/components/names/name-progress-panel";
import { Card, Page, Section } from "@/components/ui/page";
import {
  getAdjacentNames,
  getNameById,
  getSourcesFor,
  NAMES,
} from "@/lib/content/names";

export const dynamicParams = false;

export function generateStaticParams() {
  return NAMES.map((name) => ({ id: name.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/names/[id]">): Promise<Metadata> {
  const { id } = await params;
  const name = getNameById(id);
  if (!name) return {};
  return {
    title: `${name.transliteration} (${name.arabic}): ${name.shortMeaning}`,
    description: `${name.transliteration}, ${name.arabic}, is one of the 99 Names of Allah, often rendered as “${name.shortMeaning}”. Learn and remember its meaning.`,
    alternates: { canonical: `/names/${name.id}` },
    openGraph: {
      title: `${name.transliteration}: ${name.shortMeaning}`,
      description: `One of the 99 Names of Allah. Learn and remember it with Know His Names.`,
      url: `/names/${name.id}`,
    },
  };
}

export default async function NamePage({ params }: PageProps<"/names/[id]">) {
  const { id } = await params;
  const name = getNameById(id);
  if (!name) notFound();

  const { previous, next } = getAdjacentNames(name);
  const sources = getSourcesFor(name);

  return (
    <Page>
      <div className="mb-5 flex items-center justify-between gap-4">
        <Link
          href="/explore"
          className="-ml-2 inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-ink-2 transition-colors duration-200 hover:bg-surface-2 hover:text-ink"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          All Names
        </Link>
        <p className="text-sm text-ink-3 tabular-nums">
          {name.order} of {NAMES.length}
        </p>
      </div>

      <article>
        <Card className="px-6 pt-9 pb-10 text-center sm:px-10 sm:pt-12 sm:pb-12">
          <NameDisplay as="h1" name={name} />
          <Ornament className="my-6" />
          <p className="font-serif text-[1.875rem] leading-[1.15] text-balance text-ink sm:text-[2.25rem]">
            {name.shortMeaning}
          </p>
        </Card>

        <div className="mt-4">
          <NameProgressPanel nameId={name.id} />
        </div>

        <Section title="Explanation">
          <Explanation text={name.explanation} />
        </Section>

        <Section title="Sources">
          <ul className="space-y-3">
            {sources.map((source) => (
              <li
                key={source.id}
                className="rounded-2xl border border-line bg-surface p-4 text-sm"
              >
                <p className="font-medium text-ink">{source.title}</p>
                <p className="mt-1 leading-relaxed text-ink-2">
                  {source.usedFor}
                </p>
                {source.url && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 font-medium text-primary-soft-ink underline-offset-4 hover:underline"
                  >
                    View source
                    <ExternalLink aria-hidden="true" className="size-3.5" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                )}
              </li>
            ))}
          </ul>
          {name.verificationStatus !== "verified" && (
            <p className="mt-4 text-sm leading-relaxed text-ink-2">
              This entry is{" "}
              {name.verificationStatus === "pending"
                ? "awaiting scholarly review"
                : "reviewed and awaiting final verification"}
              .{" "}
              <Link
                href="/sources"
                className="font-medium text-primary-soft-ink underline underline-offset-4"
              >
                How content is reviewed
              </Link>
            </p>
          )}
        </Section>
      </article>

      <nav
        aria-label="Neighbouring Names"
        className="mt-12 grid grid-cols-2 gap-3"
      >
        {previous ? (
          <Link
            href={`/names/${previous.id}`}
            className="group flex min-h-16 flex-col justify-center rounded-2xl border border-line bg-surface px-4 py-3 transition-colors duration-200 hover:border-line-strong"
          >
            <span className="flex items-center gap-1 text-xs text-ink-3">
              <ArrowLeft aria-hidden="true" className="size-3.5" />
              Previous
            </span>
            <span className="mt-0.5 truncate font-medium text-ink">
              {previous.transliteration}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={`/names/${next.id}`}
            className="group flex min-h-16 flex-col items-end justify-center rounded-2xl border border-line bg-surface px-4 py-3 text-right transition-colors duration-200 hover:border-line-strong"
          >
            <span className="flex items-center gap-1 text-xs text-ink-3">
              Next
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </span>
            <span className="mt-0.5 max-w-full truncate font-medium text-ink">
              {next.transliteration}
            </span>
          </Link>
        )}
      </nav>
    </Page>
  );
}
