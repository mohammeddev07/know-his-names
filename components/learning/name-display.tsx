import type { DivineName } from "@/lib/content/names";
import { cn } from "@/lib/cn";

type Size = "hero" | "lg" | "md";

const arabicSize: Record<Size, string> = {
  hero: "text-arabic-hero",
  lg: "text-arabic-lg",
  md: "text-arabic-md",
};

// Scheherazade's deep descenders (ح, ن, ئ) need room above the transliteration.
const transliterationSize: Record<Size, string> = {
  hero: "mt-3 text-[1.375rem] sm:text-2xl",
  lg: "mt-2 text-xl",
  md: "mt-1 text-lg",
};

interface NameDisplayProps {
  name: Pick<DivineName, "arabic" | "transliteration">;
  size?: Size;
  showTransliteration?: boolean;
  as?: "h1" | "h2" | "div";
  className?: string;
}

/** The Arabic Name, visually dominant, with its transliteration beneath. */
export function NameDisplay({
  name,
  size = "hero",
  showTransliteration = true,
  as: Tag = "div",
  className,
}: NameDisplayProps) {
  return (
    <Tag className={cn("flex flex-col items-center text-center", className)}>
      <span
        lang="ar"
        dir="rtl"
        className={cn("block font-normal text-ink", arabicSize[size])}
      >
        {name.arabic}
      </span>
      <span
        className={cn(
          showTransliteration
            ? cn(
                "block font-serif font-normal text-ink-2 italic",
                transliterationSize[size],
              )
            : "sr-only",
        )}
      >
        {name.transliteration}
      </span>
    </Tag>
  );
}
