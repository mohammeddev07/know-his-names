"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function MainError(props: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return <ErrorState {...props} />;
}
