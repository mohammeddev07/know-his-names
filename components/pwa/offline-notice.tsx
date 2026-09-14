"use client";

import { WifiOff } from "lucide-react";
import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

/** A quiet reassurance while offline: learning keeps working locally. */
export function OfflineNotice() {
  const offline = useSyncExternalStore(
    subscribe,
    () => !navigator.onLine,
    () => false,
  );
  if (!offline) return null;
  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+4.25rem)] z-50 flex animate-fade justify-center px-4"
    >
      <p className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm text-bg shadow-card">
        <WifiOff aria-hidden="true" className="size-4 shrink-0" />
        You&apos;re offline. Your progress still saves on this device.
      </p>
    </div>
  );
}
