import type { Metadata } from "next";
import { Suspense } from "react";
import { LearnSession } from "@/components/learning/learn-session";
import { SessionLoading } from "@/components/learning/session-states";

export const metadata: Metadata = {
  title: "Learn",
  robots: { index: false },
};

export default function LearnPage() {
  return (
    <Suspense fallback={<SessionLoading />}>
      <LearnSession />
    </Suspense>
  );
}
