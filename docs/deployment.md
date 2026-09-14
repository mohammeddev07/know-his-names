# Deployment

Know His Names is a standard Next.js app with static pages. It needs no
database, secrets or server-side state. Any Node.js host works. Vercel is the
simplest.

> **Before a public launch**, complete the religious content review in
> [content-review.md](content-review.md). The build succeeds with draft
> content, but PLAN.md forbids publicly launching unverified content.

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
