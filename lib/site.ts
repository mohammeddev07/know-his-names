export const SITE_NAME = "Know His Names";
export const SITE_DESCRIPTION =
  "Learn and remember the 99 Names of Allah with active recall and spaced repetition. Free, private, and no account needed.";

/**
 * Public origin for canonical URLs, the sitemap and Open Graph. Set
 * NEXT_PUBLIC_SITE_URL in production; on Vercel the production domain is
 * used automatically so links never point at localhost. Always ends with a
 * trailing slash so it can carry a sub-path (e.g. a GitHub Pages review
 * deployment at `https://user.github.io/repo/`) without `new URL()` dropping
 * it when joining a root-relative path below.
 */
const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
export const SITE_URL = rawSiteUrl.endsWith("/")
  ? rawSiteUrl
  : `${rawSiteUrl}/`;

/**
 * Path Next.js is served under (e.g. `/know-his-names` for a GitHub Pages
 * project site). Empty at the site root. Kept in sync with `basePath` in
 * next.config.ts via the same `NEXT_PUBLIC_BASE_PATH` env var, since
 * next/link auto-prefixes hrefs with it but hand-written absolute paths
 * (the manifest, the service worker registration) don't.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Resolves an app-relative path (e.g. `/names/al-latif`) to a full URL under SITE_URL, preserving any sub-path. */
export function absoluteUrl(path: string): string {
  return new URL(path.replace(/^\//, ""), SITE_URL).toString();
}

export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev";
/** Public repository for corrections and issues, when configured. */
export const REPOSITORY_URL = process.env.NEXT_PUBLIC_REPOSITORY_URL;
