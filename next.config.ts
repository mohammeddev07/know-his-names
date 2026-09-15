import type { NextConfig } from "next";

// A per-build identifier. The service worker is registered with it so every
// deploy installs a fresh worker and discards the previous build's caches.
const buildId =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? Date.now().toString(36);

// Set by the GitHub Pages review-deployment workflow (see
// docs/deployment.md § Scholar Review Deployment). Unset for the normal
// Vercel/Node.js production build, which is unaffected by any of this.
const isGithubPagesBuild = process.env.GITHUB_PAGES === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  ...(isGithubPagesBuild
    ? {
        // GitHub Pages only serves static files: no server, no headers(),
        // no next/image optimization endpoint. basePath makes next/link,
        // next/image and Next's own asset URLs resolve under the project
        // site's `/<repo>` sub-path. trailingSlash emits `<route>/index.html`
        // for every page, which every static file server (GitHub Pages
        // included) resolves unambiguously for a directory request — the
        // default flat `<route>.html` output relies on GitHub Pages'
        // extensionless-file resolution instead, which is harder to verify.
        output: "export",
        basePath,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
  env: {
    NEXT_PUBLIC_BUILD_ID: buildId,
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version ?? "dev",
  },
  // Unsupported by `output: "export"` (see static-exports docs); the
  // security headers below only apply to the Vercel/Node.js deployment.
  ...(isGithubPagesBuild
    ? {}
    : {
        async headers() {
          return [
            {
              source: "/(.*)",
              headers: [
                { key: "X-Content-Type-Options", value: "nosniff" },
                { key: "X-Frame-Options", value: "DENY" },
                {
                  key: "Referrer-Policy",
                  value: "strict-origin-when-cross-origin",
                },
                {
                  key: "Permissions-Policy",
                  value:
                    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
                },
              ],
            },
            {
              source: "/sw.js",
              headers: [
                {
                  key: "Content-Type",
                  value: "application/javascript; charset=utf-8",
                },
                {
                  key: "Cache-Control",
                  value: "no-cache, no-store, must-revalidate",
                },
                {
                  key: "Content-Security-Policy",
                  value: "default-src 'self'; script-src 'self'",
                },
              ],
            },
          ];
        },
      }),
};

export default nextConfig;
