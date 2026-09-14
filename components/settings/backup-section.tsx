"use client";

import { Download, Undo2, Upload } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Card, Section } from "@/components/ui/page";
import { useProgress } from "@/hooks/use-progress";
import { cn } from "@/lib/cn";
import {
  BackupError,
  backupFileName,
  createBackup,
  MAX_BACKUP_BYTES,
  parseBackup,
  serializeBackup,
  type ParsedBackup,
} from "@/lib/storage/backup";

type Message = { tone: "success" | "error"; text: string };

const dateTime = new Intl.DateTimeFormat(undefined, {
  dateStyle: "long",
  timeStyle: "short",
});

const count = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

function download(text: string, filename: string) {
  const url = URL.createObjectURL(
    new Blob([text], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

/** Export, import (with confirmation) and undo of a local progress backup. */
export function BackupSection() {
  const progress = useProgress();
  const { status, getRollbackSavedAt } = progress;
  const fileInput = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<ParsedBackup | null>(null);
  const [message, setMessage] = useState<Message | null>(null);
  const [busy, setBusy] = useState(false);
  const [rollbackAt, setRollbackAt] = useState<string | null>(null);
  const ready = status === "ready";

  useEffect(() => {
    if (!ready) return;
    let active = true;
    getRollbackSavedAt()
      .then((savedAt) => active && setRollbackAt(savedAt))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [ready, getRollbackSavedAt]);

  async function exportProgress() {
    setBusy(true);
    setMessage(null);
    try {
      const now = new Date();
      const filename = backupFileName(now);
      const snapshot = await progress.exportSnapshot();
      download(serializeBackup(createBackup(snapshot, now)), filename);
      setMessage({ tone: "success", text: `Backup saved as ${filename}.` });
    } catch {
      setMessage({
        tone: "error",
        text: "The backup couldn't be created. Please try again.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setMessage(null);
    if (file.size > MAX_BACKUP_BYTES) {
      setMessage({
        tone: "error",
        text: "This file is too large to be a Know His Names backup.",
      });
      return;
    }
    try {
      setPending(parseBackup(await file.text()));
    } catch (error) {
      setMessage({
        tone: "error",
        text:
          error instanceof BackupError
            ? error.message
            : "This file couldn't be read. Please choose another file.",
      });
    }
  }

  async function confirmImport() {
    if (!pending) return;
    setBusy(true);
    try {
      await progress.replaceProgress(pending.snapshot);
      setRollbackAt(await getRollbackSavedAt());
      setMessage({
        tone: "success",
        text: "Progress imported. Your previous progress was kept, so you can undo this.",
      });
    } catch {
      setMessage({
        tone: "error",
        text: "The import didn't complete, so nothing was changed. Please try again.",
      });
    } finally {
      setPending(null);
      setBusy(false);
    }
  }

  async function undoImport() {
    setBusy(true);
    setMessage(null);
    try {
      await progress.restoreRollback();
      setRollbackAt(null);
      setMessage({ tone: "success", text: "Your previous progress is back." });
    } catch {
      setMessage({
        tone: "error",
        text: "Your previous progress couldn't be restored. Please try again.",
      });
    } finally {
      setBusy(false);
    }
  }

  const currentIntroduced = progress.cards.size;

  return (
    <Section title="Backup">
      <Card className="p-5 sm:p-6">
        <p className="text-[0.9375rem] leading-relaxed text-ink-2">
          Your progress is saved only in this browser on this device. Export a
          backup from time to time, and use it to restore your progress here or
          on another device.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Button
            variant="secondary"
            onClick={exportProgress}
            disabled={!ready || busy}
          >
            <Download aria-hidden="true" className="size-4" />
            Export progress
          </Button>
          <Button
            variant="secondary"
            onClick={() => fileInput.current?.click()}
            disabled={!ready || busy}
          >
            <Upload aria-hidden="true" className="size-4" />
            Import progress
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            onChange={chooseFile}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>

        {rollbackAt && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface-2 px-4 py-3">
            <p className="text-sm text-ink-2">
              You replaced your progress on{" "}
              {dateTime.format(new Date(rollbackAt))}.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={undoImport}
              disabled={busy}
            >
              <Undo2 aria-hidden="true" className="size-4" />
              Undo import
            </Button>
          </div>
        )}

        <p
          role={message?.tone === "error" ? "alert" : "status"}
          className={cn(
            "text-sm empty:hidden",
            message && "mt-4 rounded-2xl px-4 py-3",
            message?.tone === "error" && "bg-danger-soft text-danger",
            message?.tone === "success" &&
              "bg-primary-soft text-primary-soft-ink",
          )}
        >
          {message?.text}
        </p>
      </Card>

      <Dialog
        open={pending !== null}
        onClose={() => setPending(null)}
        title="Replace your progress?"
        actions={
          <>
            <Button
              variant="quiet"
              onClick={() => setPending(null)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button onClick={confirmImport} disabled={busy}>
              Replace progress
            </Button>
          </>
        }
      >
        {pending && (
          <>
            <p>
              This backup is from{" "}
              {dateTime.format(new Date(pending.summary.exportedAt))}. It has{" "}
              {count(pending.summary.namesIntroduced, "Name")} introduced and{" "}
              {count(pending.summary.reviews, "review")}.
            </p>
            <p className="mt-3">
              Importing replaces the progress on this device (
              {count(currentIntroduced, "Name")} introduced). Your current
              progress is kept, so you can undo the import afterwards.
            </p>
            {pending.summary.unknownNames > 0 && (
              <p className="mt-3">
                It also includes {count(pending.summary.unknownNames, "Name")}{" "}
                this version of the app doesn&apos;t have. They will be kept but
                not shown.
              </p>
            )}
          </>
        )}
      </Dialog>
    </Section>
  );
}
