"use client";

import { useEffect } from "react";
import { NAMES } from "@/lib/content/names";

/** Runs a task when the browser is idle (Safari lacks requestIdleCallback). */
function whenIdle(task: () => void): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(task, { timeout: 10_000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(task, 3_000);
  return () => window.clearTimeout(id);
}

/**
 * Registers the service worker in production builds. Offline support is an
 * enhancement: if registration fails, the app still works online.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const version = encodeURIComponent(
      process.env.NEXT_PUBLIC_BUILD_ID ?? "dev",
    );
    let cancelIdle: (() => void) | undefined;
    let unmounted = false;

    navigator.serviceWorker
      .register(`/sw.js?v=${version}`, { scope: "/", updateViaCache: "none" })
      .then(() => navigator.serviceWorker.ready)
      .then((registration) => {
        if (unmounted) return;
        // Once the app is idle, save every Name page for offline reading.
        cancelIdle = whenIdle(() =>
          registration.active?.postMessage({
            type: "save-pages",
            paths: NAMES.map((name) => `/names/${name.id}`),
          }),
        );
      })
      .catch(() => {
        // Without a service worker the app simply isn't available offline.
      });

    return () => {
      unmounted = true;
      cancelIdle?.();
    };
  }, []);

  return null;
}
