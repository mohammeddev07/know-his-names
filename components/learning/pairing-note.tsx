import { Users } from "lucide-react";
import Link from "next/link";
import { getNameById, type DivineName } from "@/lib/content/names";
import { cn } from "@/lib/cn";

/**
 * Teaching/companion context for Names best understood alongside another.
 * "strong" pairs (e.g. Aḍ-Ḍārr/An-Nāfiʿ) are never meant to stand alone;
 * "teaching" pairs are a non-disruptive complementary link; "companion" is
 * an explanatory link to a related Name outside the 99 (Al-Māniʿ/Al-Muʿṭī).
 * See docs/content-review.md "Paired Names".
 */
export function PairingNote({
  name,
  centered = false,
}: {
  name: DivineName;
  /** Narrow, centered layout for the flashcard-style learn/review cards. */
  centered?: boolean;
}) {
  const pairings = name.pairings;
  if (!pairings || pairings.length === 0) return null;

  return (
    <div className={cn("mt-3 space-y-2", centered && "mx-auto max-w-sm")}>
      {pairings.map((pairing, index) => {
        const paired = pairing.withId ? getNameById(pairing.withId) : undefined;
        const label = paired?.transliteration ?? pairing.withLabel;
        return (
          <p
            key={index}
            className={cn(
              "flex items-start gap-2.5 rounded-2xl px-4 py-3 text-left text-sm leading-relaxed",
              pairing.mode === "strong"
                ? "bg-gold-soft text-gold-ink"
                : "bg-surface-2 text-ink-2",
            )}
          >
            <Users aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>
              {paired ? (
                <>
                  Learn alongside{" "}
                  <Link
                    href={`/names/${paired.id}`}
                    className="font-medium underline underline-offset-4"
                  >
                    {label}
                  </Link>
                  .{" "}
                </>
              ) : (
                label && <>Companion: {label}. </>
              )}
              {pairing.note}
            </span>
          </p>
        );
      })}
    </div>
  );
}
