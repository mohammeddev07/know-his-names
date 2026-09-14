import type { Metadata } from "next";
import { Suspense } from "react";
import { ReviewSession } from "@/components/learning/review-session";
import { SessionLoading } from "@/components/learning/session-states";

export const metadata: Metadata = {
  title: "Review",
  robots: { index: false },
};

export default function ReviewPage() {
  return (
    <Suspense fallback={<SessionLoading />}>
      <ReviewSession />
    </Suspense>
  );
}
