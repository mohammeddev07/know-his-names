import namesFile from "@/content/names/names.json";
import sourcesFile from "@/content/sources/sources.json";
import { namesFileSchema, sourcesFileSchema } from "./schema";

export interface ContentIssue {
  path: string;
  message: string;
}

function findDuplicates<T>(values: readonly T[]): T[] {
  const seen = new Set<T>();
  const duplicates = new Set<T>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

/**
 * Checks the shape of the content files and the rules a schema cannot express:
 * unique ids and orders, a contiguous order, and resolvable source references.
 */
export function validateContent(
  namesInput: unknown,
  sourcesInput: unknown,
): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const names = namesFileSchema.safeParse(namesInput);
  const sources = sourcesFileSchema.safeParse(sourcesInput);

  for (const [file, result] of [
    ["names", names],
    ["sources", sources],
  ] as const) {
    if (!result.success) {
      for (const issue of result.error.issues) {
        issues.push({
          path: [file, ...issue.path].join("."),
          message: issue.message,
        });
      }
    }
  }
  if (!names.success || !sources.success) return issues;

  const list = names.data.names;
  for (const id of findDuplicates(list.map((n) => n.id))) {
    issues.push({ path: "names", message: `duplicate id "${id}"` });
  }
  for (const order of findDuplicates(list.map((n) => n.order))) {
    issues.push({ path: "names", message: `duplicate order ${order}` });
  }
  for (const arabic of findDuplicates(list.map((n) => n.arabic))) {
    issues.push({ path: "names", message: `duplicate Arabic "${arabic}"` });
  }
  list.forEach((name, index) => {
    if (name.order !== index + 1) {
      issues.push({
        path: `names.${index}.order`,
        message: `expected order ${index + 1} but found ${name.order}; names must be listed in order without gaps`,
      });
    }
  });

  const sourceIds = new Set(sources.data.sources.map((s) => s.id));
  for (const id of findDuplicates(sources.data.sources.map((s) => s.id))) {
    issues.push({ path: "sources", message: `duplicate source id "${id}"` });
  }
  if (!sourceIds.has(sources.data.enumerationSourceId)) {
    issues.push({
      path: "sources.enumerationSourceId",
      message: `unknown source "${sources.data.enumerationSourceId}"`,
    });
  }
  list.forEach((name, index) => {
    for (const ref of name.sourceIds) {
      if (!sourceIds.has(ref)) {
        issues.push({
          path: `names.${index}.sourceIds`,
          message: `"${name.id}" references unknown source "${ref}"`,
        });
      }
    }
  });

  const nameIds = new Set(list.map((n) => n.id));
  list.forEach((name, index) => {
    for (const pairing of name.pairings ?? []) {
      if (pairing.withId && !nameIds.has(pairing.withId)) {
        issues.push({
          path: `names.${index}.pairings`,
          message: `"${name.id}" pairs with unknown Name "${pairing.withId}"`,
        });
      }
    }
  });

  return issues;
}

/** Throws with every problem listed. Called during the build so malformed content never ships. */
export function assertValidContent(
  namesInput: unknown = namesFile,
  sourcesInput: unknown = sourcesFile,
) {
  const issues = validateContent(namesInput, sourcesInput);
  if (issues.length > 0) {
    throw new Error(
      `Content validation failed:\n${issues.map((i) => `  - ${i.path}: ${i.message}`).join("\n")}`,
    );
  }
}
