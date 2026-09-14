"use client";

import { ErrorState } from "@/components/ui/error-state";
import "./globals.css";

/** Replaces the root layout if it fails, so it renders its own document. */
export default function GlobalError(props: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en" dir="ltr">
      <body>
        <main id="main">
          <ErrorState {...props} />
        </main>
      </body>
    </html>
  );
}
