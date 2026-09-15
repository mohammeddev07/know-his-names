# Deployment

Know His Names is a standard Next.js app with static pages. It needs no
database, secrets or server-side state. Any Node.js host works. Vercel is the
simplest, and is the intended target for the Phase 11 public production
launch.

> **Before a public launch**, complete the religious content review in
> [content-review.md](content-review.md). The build succeeds with draft
> content, but PLAN.md forbids publicly launching unverified content.

## Scholar review deployment (GitHub Pages)

This is a **temporary** deployment so qualified reviewers can use the app and
review the Phase 10 religious content directly, before the Phase 11 public
launch (which uses Vercel — see below, unchanged). It is not the production
release, is not announced publicly, and does not mark Phase 10 or Phase 11
complete.

### What's different from production

- `next build` runs with `output: "export"` (a static export, no server) and
  `basePath` set to `/<repo>`, since a GitHub Pages project site is served at
  `https://<owner>.github.io/<repo>/`. This is wired through
  `next.config.ts`, gated on `GITHUB_PAGES=true` so it never affects the
  normal Vercel/Node.js build.
- The app's local-first IndexedDB/FSRS behavior, the PWA manifest and the
  offline service worker are unchanged and still work, now resolving every
  in-app URL under the `/<repo>` sub-path (`lib/site.ts`'s `BASE_PATH`, the
  service worker's own `self.location`-derived base path).
- Next's `headers()` security headers and default `next/image` optimization
  are unsupported by a static export and are skipped for this build only;
  they still apply to the Vercel deployment.
- Content status: reviewers should assume **every** Name is still `pending`
  — see [content-review.md](content-review.md) for the current audit and the
  25 open questions that need a qualified decision. Nothing on this
  deployment should be treated as finally verified.

### Deploying

1. In the repository's **Settings → Pages**, set **Source** to
   **GitHub Actions** (one-time setup).
2. Run the **Scholar review deployment (GitHub Pages)** workflow from the
   **Actions** tab (`workflow_dispatch`, so it never deploys automatically on
   a push). It runs `npm run check`, builds the static export with
   `NEXT_PUBLIC_BASE_PATH` and `NEXT_PUBLIC_SITE_URL` set for the repository,
   and publishes `out/` via `actions/deploy-pages`.
3. The review URL is `https://<owner>.github.io/<repo>/` (printed as the
   workflow's deployment URL).
4. Re-run the workflow after any content or code change reviewers should see;
   it is not automatic.

To build the same export locally first:

```bash
GITHUB_PAGES=true \
NEXT_PUBLIC_BASE_PATH=/know-his-names \
NEXT_PUBLIC_SITE_URL=https://<owner>.github.io/know-his-names/ \
npm run build:gh-pages
# serve out/ with any static file server to check it before pushing
```

### Reporting corrections

Reviewers should report corrections the same way as any other content issue:
through the project's public repository (see the Sources page's Corrections
section, and [content-review.md](content-review.md) for how a review gets
recorded). Do not edit `content/names/names.json` or `content/sources/sources.json`
directly from feedback without going through that review process.

### Known limitation

The offline app shell precaches the same route list either way, but under a
GitHub Pages sub-path a route not yet visited may fall back to the "you're
offline" page instead of a cached copy if opened while offline. This only
affects the temporary review build's offline mode, not the online experience,
and not the Vercel deployment.

## Environment variables

| Variable                     | Required         | Purpose                                                                                              |
| ---------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`       | Yes (production) | Public origin, e.g. `https://knowhisnames.app`. Used for canonical URLs, the sitemap and Open Graph. |
| `NEXT_PUBLIC_REPOSITORY_URL` | No               | Public repository. Shown on the Sources page for corrections.                                        |

## Vercel

1. Import the repository in Vercel. The framework is detected as Next.js.
2. Set `NEXT_PUBLIC_SITE_URL` (and optionally `NEXT_PUBLIC_REPOSITORY_URL`)
   for Production.
3. Deploy. HTTPS is automatic, and it is required for the service worker and
   for installing the PWA.
4. Add the custom domain under **Settings → Domains** when it's available,
   then update `NEXT_PUBLIC_SITE_URL` and redeploy.

Each deploy gets a new service worker version (keyed on the commit), so
returning visitors switch to the new build and old offline caches are
removed.

## Any Node.js host

```bash
npm ci
NEXT_PUBLIC_SITE_URL=https://example.org npm run build
npm start            # serves on port 3000; put it behind HTTPS
```

## Smoke test the public URL

After each production deploy, run the critical journey against the live site:

```bash
PLAYWRIGHT_BASE_URL=https://example.org npm run test:smoke
```

This checks that a new visitor can learn, review with every rating, reload,
export a backup, clear their data, import the backup and get their progress
back, and that the app works offline.

## Monitoring

The app deliberately ships no analytics or error-tracking scripts (PLAN.md
§30). Errors are caught by calm in-app error screens and logged only to the
browser console. If monitoring is added later, collect only what is needed to
understand product quality, and update the Privacy section on the Sources
page.
