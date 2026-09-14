import type { MetadataRoute } from "next";
import { NAMES } from "@/lib/content/names";
import { SITE_URL } from "@/lib/site";

/** Public, indexable pages. Personal pages (learn, review, progress, settings) are excluded. */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", "/explore", "/sources"].map((path) => ({
    url: new URL(path, SITE_URL).toString(),
    changeFrequency: "monthly" as const,
    priority: path === "/" ? 1 : 0.8,
  }));
  const names = NAMES.map((name) => ({
    url: new URL(`/names/${name.id}`, SITE_URL).toString(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
  return [...pages, ...names];
}
