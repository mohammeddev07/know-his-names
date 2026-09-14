export const SITE_NAME = "Know His Names";
export const SITE_DESCRIPTION =
  "Learn and remember the 99 Names of Allah with active recall and spaced repetition. Free, private, and no account needed.";

/**
 * Public origin for canonical URLs, the sitemap and Open Graph. Set
 * NEXT_PUBLIC_SITE_URL in production; on Vercel the production domain is
 * used automatically so links never point at localhost.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev";
/** Public repository for corrections and issues, when configured. */
export const REPOSITORY_URL = process.env.NEXT_PUBLIC_REPOSITORY_URL;
