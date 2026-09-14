"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Card, Page, PageHeader, Section } from "@/components/ui/page";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Switch } from "@/components/ui/switch";
import { useProgress } from "@/hooks/use-progress";
import { CONTENT_VERSION } from "@/lib/content/names";
import { NEW_NAMES_PER_DAY_OPTIONS } from "@/lib/learning/types";
import { APP_VERSION } from "@/lib/site";
import type { ThemePreference } from "@/lib/theme";
import { BackupSection } from "./backup-section";

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export function SettingsView() {
  const { preferences, updatePreferences, status } = useProgress();
  const disabled = status !== "ready";

  return (
    <Page>
      <PageHeader title="Settings" />

      <Section title="Learning" className="mt-0">
        <Card className="space-y-7 p-5 sm:p-6">
          <div>
            <SegmentedControl
              legend="New Names per day"
              options={NEW_NAMES_PER_DAY_OPTIONS.map((n) => ({
                value: n,
                label: String(n),
              }))}
              value={preferences.newNamesPerDay}
              onChange={(newNamesPerDay) =>
                void updatePreferences({ newNamesPerDay })
              }
              disabled={disabled}
            />
            <p className="mt-2 text-sm text-ink-2">
              Small daily steps help each Name settle. Three a day is a good
              start.
            </p>
          </div>
          <Switch
            label="Show transliteration in reviews"
            description="Turn this off to practise reading the Arabic on its own."
            checked={preferences.showTransliteration}
            onChange={(showTransliteration) =>
              void updatePreferences({ showTransliteration })
            }
            disabled={disabled}
          />
        </Card>
      </Section>

      <Section title="Appearance">
        <Card className="p-5 sm:p-6">
          <SegmentedControl
            legend="Theme"
            options={THEME_OPTIONS}
            value={preferences.theme}
            onChange={(theme) => void updatePreferences({ theme })}
            disabled={disabled}
          />
        </Card>
      </Section>

      <BackupSection />

      <Section title="About">
        <Card as="section" className="divide-y divide-line overflow-hidden">
          <Link
            href="/sources"
            className="flex min-h-14 items-center justify-between gap-4 px-5 py-3 text-ink transition-colors duration-200 hover:bg-surface-2 sm:px-6"
          >
            <span>
              <span className="block font-medium">
                Sources &amp; methodology
              </span>
              <span className="block text-sm text-ink-2">
                Where the content comes from and how it is reviewed
              </span>
            </span>
            <ChevronRight
              aria-hidden="true"
              className="size-4 shrink-0 text-ink-3"
            />
          </Link>
          <Link
            href="/sources#privacy"
            className="flex min-h-14 items-center justify-between gap-4 px-5 py-3 text-ink transition-colors duration-200 hover:bg-surface-2 sm:px-6"
          >
            <span>
              <span className="block font-medium">Privacy</span>
              <span className="block text-sm text-ink-2">
                No accounts, no tracking. Progress stays on this device.
              </span>
            </span>
            <ChevronRight
              aria-hidden="true"
              className="size-4 shrink-0 text-ink-3"
            />
          </Link>
          <p className="px-5 py-4 text-sm text-ink-3 sm:px-6">
            Version {APP_VERSION}, content {CONTENT_VERSION}
          </p>
        </Card>
      </Section>
    </Page>
  );
}
