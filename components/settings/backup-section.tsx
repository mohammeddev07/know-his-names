"use client";

// Phase 2: static placeholder. Export and import are wired in Phase 7.
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, Section } from "@/components/ui/page";

export function BackupSection() {
  return (
    <Section title="Backup">
      <Card className="p-5 sm:p-6">
        <p className="text-[0.9375rem] leading-relaxed text-ink-2">
          Your progress is saved only in this browser on this device. Export a
          backup from time to time, and use it to restore your progress here or
          on another device.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Button variant="secondary" disabled>
            <Download aria-hidden="true" className="size-4" />
            Export progress
          </Button>
          <Button variant="secondary" disabled>
            <Upload aria-hidden="true" className="size-4" />
            Import progress
          </Button>
        </div>
      </Card>
    </Section>
  );
}
