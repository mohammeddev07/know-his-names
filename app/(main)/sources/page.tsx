import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Card, Page, PageHeader } from "@/components/ui/page";
import {
  CONTENT_VERSION,
  ENUMERATION_SOURCE,
  NAMES,
  SOURCES,
} from "@/lib/content/names";
import { REPOSITORY_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sources & methodology",
  description:
    "Which list of the 99 Names Know His Names follows, how translations are chosen, the sources used, and how content is reviewed.",
};

function Block({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-line pt-8">
      <h2 className="font-serif text-2xl text-ink">{title}</h2>
      <div className="mt-3 space-y-3 text-[0.9375rem] leading-relaxed text-ink-2">
        {children}
      </div>
    </section>
  );
}

export default function SourcesPage() {
  const tally = { pending: 0, reviewed: 0, verified: 0 };
  for (const name of NAMES) tally[name.verificationStatus] += 1;
  const allVerified = tally.verified === NAMES.length;

  return (
    <Page>
      <PageHeader
        title="Sources & methodology"
        description="Everything the app teaches about the Names comes from reviewed content files, never from its code. Here is where that content comes from and how it is checked."
      />

      <Card className="mb-10 p-5 sm:p-6">
        <p className="font-medium text-ink">
          Content version {CONTENT_VERSION}
          {allVerified ? ", verified" : ", under review"}
        </p>
        <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
          {(["pending", "reviewed", "verified"] as const).map((status) => (
            <div key={status} className="rounded-2xl bg-surface-2 px-2 py-3">
              <dt className="text-xs text-ink-2 capitalize">{status}</dt>
              <dd className="mt-1 font-serif text-2xl text-ink tabular-nums">
                {tally[status]}
              </dd>
            </div>
          ))}
        </dl>
        {!allVerified && (
          <p className="mt-4 text-sm leading-relaxed text-ink-2">
            The Arabic, transliterations and English meanings are awaiting
            scholarly review. Explanations and pronunciation audio will only be
            added once they have been reviewed.
          </p>
        )}
      </Card>

      <div className="space-y-10">
        <Block title="The list this app follows">
          <p>
            The app follows the widely known list of ninety-nine Names recorded
            in {ENUMERATION_SOURCE.title}, in that order. Other lists exist;
            this one was chosen because it is the one most learners encounter.
          </p>
        </Block>

        <Block title="Transliteration">
          <p>
            Transliterations follow one consistent scheme. A line over a vowel
            (ā, ī, ū) marks a long vowel, a dot under a letter (ḥ, ṣ, ḍ, ṭ, ẓ)
            marks an emphatic sound, ʿ marks the letter ʿayn and ʾ marks a
            glottal stop. The definite article is written as it is pronounced,
            as in Ar-Raḥmān.
          </p>
        </Block>

        <Block title="Meanings">
          <p>
            Each Name has one short English rendering, chosen so it is easy to
            recall. No single English phrase can hold the full meaning of a
            Name, so treat each one as a doorway to further study rather than a
            complete definition.
          </p>
        </Block>

        <Block title="Sources">
          <ul className="space-y-3">
            {SOURCES.map((source) => (
              <li
                key={source.id}
                className="rounded-2xl border border-line bg-surface p-4"
              >
                <p className="font-medium text-ink">{source.title}</p>
                <p className="mt-1 text-sm">{source.citation}</p>
                <p className="mt-1 text-sm">
                  <span className="text-ink">Used for:</span> {source.usedFor}
                </p>
                {source.url && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary-soft-ink underline-offset-4 hover:underline"
                  >
                    View source
                    <ExternalLink aria-hidden="true" className="size-3.5" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                )}
              </li>
            ))}
          </ul>
        </Block>

        <Block title="How content is reviewed">
          <p>
            Before public launch, every entry is checked for Arabic spelling,
            ordering, transliteration, translation, explanation, sources,
            pronunciation and attribution. Each Name records its own status:
            pending, reviewed or verified. Reviewed content is released with a
            new content version, and verified content is never changed without
            another review.
          </p>
        </Block>

        <Block title="Corrections">
          <p>
            If you notice a mistake, please report it
            {REPOSITORY_URL ? (
              <>
                {" "}
                through the{" "}
                <a
                  href={REPOSITORY_URL}
                  className="font-medium text-primary-soft-ink underline underline-offset-4"
                >
                  project&apos;s public repository
                </a>
              </>
            ) : (
              " through the project's public repository"
            )}
            . Every report is reviewed before any content changes.
          </p>
        </Block>

        <Block id="privacy" title="Privacy">
          <p>
            Know His Names has no accounts, no advertising and no tracking. Your
            progress is stored only in this browser on this device and is never
            sent to a server. Backup files you export stay wherever you save
            them.
          </p>
          <p>
            Because progress lives on your device, clearing this site&apos;s
            data or losing the device removes it. Export a backup from Settings
            to keep a copy.
          </p>
        </Block>
      </div>
    </Page>
  );
}
