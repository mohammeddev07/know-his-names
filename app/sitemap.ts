import type { MetadataRoute } from "next";
import { NAMES } from "@/lib/content/names";
import { absoluteUrl } from "@/lib/site";

// Required for `output: "export"` (GitHub Pages review builds).
export const dynamic = "force-static";

/** Public, indexable pages. Personal pages (learn, review, progress, settings) are excluded. */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", "/explore", "/sources"].map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: "monthly" as const,
    priority: path === "/" ? 1 : 0.8,
  }));
  const names = NAMES.map((name) => ({
    url: absoluteUrl(`/names/${name.id}`),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
  return [...pages, ...names];
}
