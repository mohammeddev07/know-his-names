import namesFile from "@/content/names/names.json";
import sourcesFile from "@/content/sources/sources.json";

export type VerificationStatus = "pending" | "reviewed" | "verified";

export interface DivineName {
  id: string;
  order: number;
  arabic: string;
  transliteration: string;
  shortMeaning: string;
  explanation?: string;
  audioUrl?: string;
  sourceIds: string[];
  verificationStatus: VerificationStatus;
}

export interface ContentSource {
  id: string;
  title: string;
  kind: string;
  citation: string;
  url?: string;
  usedFor: string;
  verificationStatus: VerificationStatus;
}

export const CONTENT_VERSION: string = namesFile.version;
export const NAMES = namesFile.names as DivineName[];
export const SOURCES = sourcesFile.sources as ContentSource[];

const byId = new Map(NAMES.map((name) => [name.id, name]));
const sourcesById = new Map(SOURCES.map((source) => [source.id, source]));

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
