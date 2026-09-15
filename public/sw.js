/*
 * Know His Names service worker: an offline app shell and offline access to
 * the bundled content. Hand-written, with no build step.
 *
 * The page registers it as /sw.js?v=<build id>, so each deploy installs a new
 * worker and removes the previous build's caches.
 *
 * - Pages: network first, falling back to the cached copy when offline.
 * - /_next/static assets: cache first (their URLs change with their content).
 * - Next.js data (RSC) requests: network only. Offline they fail, and Next.js
 *   falls back to a full page load, which the page cache then serves.
 * - Learning progress lives in IndexedDB and never passes through here.
 */

const VERSION = new URL(self.location.href).searchParams.get("v") || "dev";
const PAGES = `khn-pages-${VERSION}`;
const ASSETS = `khn-assets-${VERSION}`;
// Works both at the domain root (Vercel) and under a sub-path (a GitHub
// Pages project site), since the worker's own URL already carries it.
const BASE_PATH = self.location.pathname.replace(/\/sw\.js$/, "");
const SW_PATH = `${BASE_PATH}/sw.js`;
const CORE_ROUTES = [
  "/",
  "/learn",
  "/review",
  "/explore",
  "/progress",
  "/settings",
  "/sources",
].map((path) => (path === "/" ? `${BASE_PATH}/` : `${BASE_PATH}${path}`));
const STATIC_ASSET = new RegExp(
  `${BASE_PATH.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/_next/static/[^"'\\s)\\\\]+`,
  "g",
);

const OFFLINE_PAGE = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline — Know His Names</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f6f3eb;color:#1d2320;font:16px/1.5 system-ui,sans-serif;text-align:center;padding:24px}@media(prefers-color-scheme:dark){body{background:#0e1512;color:#ede8dd}a{color:#69bf9c}}h1{font:400 28px Georgia,serif;margin:0 0 8px}a{color:#0e5a44;font-weight:600}</style></head><body><main><h1>You're offline</h1><p>This page hasn't been saved for offline use yet.</p><p><a href="${BASE_PATH}/">Go to home</a></p></main></body></html>`;

/** Caches the static assets a page or stylesheet refers to. */
async function cacheAssetsIn(text, seen) {
  const assets = await caches.open(ASSETS);
  const urls = [...new Set(text.match(STATIC_ASSET) || [])].filter(
    (url) => !seen.has(url),
  );
  await Promise.all(
    urls.map(async (url) => {
      seen.add(url);
      if (await assets.match(url)) return;
      const response = await fetch(url);
      if (!response.ok) return;
      if (url.endsWith(".css")) {
        await cacheAssetsIn(await response.clone().text(), seen);
      }
      await assets.put(url, response);
    }),
  );
}

/** Saves pages (and everything they load) for offline use. */
async function savePages(paths, { stopOnFailure }) {
  const pages = await caches.open(PAGES);
  const seen = new Set();
  for (const path of paths) {
    if (typeof path !== "string" || !path.startsWith("/")) continue;
    if (await pages.match(path)) continue;
    try {
      const response = await fetch(path, { cache: "reload" });
      if (!response.ok) throw new Error(`${path}: ${response.status}`);
      // A trailing-slash redirect (GitHub Pages builds export every route as
      // `<route>/index.html`) is followed transparently by fetch(); cache
      // under the URL it actually resolved to, so it's found by pathname at
      // navigation time even when that differs from the requested path.
      const key = new URL(response.url).pathname;
      if (key !== path && (await pages.match(key))) continue;
      await cacheAssetsIn(await response.clone().text(), seen);
      await pages.put(key, response);
    } catch (error) {
      if (stopOnFailure) throw error;
      return;
    }
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    savePages(CORE_ROUTES, { stopOnFailure: true }).then(() =>
      self.skipWaiting(),
    ),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const current = new Set([PAGES, ASSETS]);
      for (const key of await caches.keys()) {
        if (key.startsWith("khn-") && !current.has(key))
          await caches.delete(key);
      }
      await self.clients.claim();
    })(),
  );
});

/** The page asks for extra pages (every Name) to be saved when it is idle. */
self.addEventListener("message", (event) => {
  const { data } = event;
  if (data && data.type === "save-pages" && Array.isArray(data.paths)) {
    event.waitUntil(
      savePages(data.paths.slice(0, 200), { stopOnFailure: false }),
    );
  }
});

async function networkFirstPage(request) {
  const pages = await caches.open(PAGES);
  // /learn?name=… and /learn share one cached shell.
  const key = new URL(request.url).pathname;
  try {
    const response = await fetch(request);
    if (response.ok && response.type === "basic") {
      await pages.put(key, response.clone());
    }
    return response;
  } catch {
    return (
      (await pages.match(key)) ||
      new Response(OFFLINE_PAGE, {
        status: 503,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      })
    );
  }
}

async function cacheFirst(request) {
  const assets = await caches.open(ASSETS);
  const cached = await assets.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) await assets.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(event) {
  const assets = await caches.open(ASSETS);
  const cached = await assets.match(event.request);
  const refresh = fetch(event.request)
    .then(async (response) => {
      if (response.ok) await assets.put(event.request, response.clone());
      return response;
    })
    .catch(() => undefined);
  if (cached) {
    event.waitUntil(refresh);
    return cached;
  }
  return (await refresh) || Response.error();
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.headers.get("RSC") === "1" || url.searchParams.has("_rsc"))
    return;

  const nextPath = `${BASE_PATH}/_next/`;
  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request));
  } else if (url.pathname.startsWith(`${nextPath}static/`)) {
    event.respondWith(cacheFirst(request));
  } else if (!url.pathname.startsWith(nextPath) && url.pathname !== SW_PATH) {
    event.respondWith(staleWhileRevalidate(event));
  }
});
