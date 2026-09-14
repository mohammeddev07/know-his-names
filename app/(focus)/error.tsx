"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function SessionError(props: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return <ErrorState {...props} />;
}
