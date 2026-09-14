import namesFile from "@/content/names/names.json";
import sourcesFile from "@/content/sources/sources.json";
import type { ContentSource, DivineName } from "./schema";

// Content is validated against ./schema at build time (see validate.ts), so the
// client can read it without shipping the validator.
export type { ContentSource, DivineName, VerificationStatus } from "./schema";

export const CONTENT_VERSION: string = namesFile.version;
export const NAMES = namesFile.names as DivineName[];
export const SOURCES = sourcesFile.sources as ContentSource[];

const byId = new Map(NAMES.map((name) => [name.id, name]));
const sourcesById = new Map(SOURCES.map((source) => [source.id, source]));

/** The source whose list and order the app follows. */
export const ENUMERATION_SOURCE = sourcesById.get(
  sourcesFile.enumerationSourceId,
)!;

export function getNameById(id: string): DivineName | undefined {
  return byId.get(id);
}

export function getSourcesFor(name: DivineName): ContentSource[] {
  return name.sourceIds.flatMap((id) => sourcesById.get(id) ?? []);
}

export function getAdjacentNames(name: DivineName) {
  const index = NAMES.indexOf(name);
  return { previous: NAMES[index - 1], next: NAMES[index + 1] };
}

/** A different Name each calendar day, the same for everyone on that day. */
export function getNameOfTheDay(date: Date): DivineName {
  const dayNumber = Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000,
  );
  return NAMES[dayNumber % NAMES.length];
}
