"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import {
  FORUM_POST_BODY_MAX,
  FORUM_POST_BODY_MAX_LINES,
  FORUM_POST_TITLE_MAX,
} from "@/lib/community/validate";

export function EditPostModal({
  open,
  initialTitle,
  initialBodyMd,
  busy,
  onClose,
  onSave,
}: {
  open: boolean;
  initialTitle: string;
  initialBodyMd: string;
  busy: boolean;
  onClose: () => void;
  onSave: (title: string, bodyMd: string) => void;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [bodyMd, setBodyMd] = useState(initialBodyMd);

  useEffect(() => {
    if (!open) return;
    setTitle(initialTitle);
    setBodyMd(initialBodyMd);
  }, [open, initialTitle, initialBodyMd]);

  if (!open) return null;

  const titleOverLimit = title.length > FORUM_POST_TITLE_MAX;
  const bodyLineCount = bodyMd.split(/\r\n?|\n/).length;
  const bodyOverLimit =
    bodyMd.length > FORUM_POST_BODY_MAX || bodyLineCount > FORUM_POST_BODY_MAX_LINES;

  const clampBody = (value: string) => {
    const limited = value.length > FORUM_POST_BODY_MAX ? value.slice(0, FORUM_POST_BODY_MAX) : value;
    const lines = limited.split(/\r\n?|\n/);
    if (lines.length <= FORUM_POST_BODY_MAX_LINES) return limited;
    return lines.slice(0, FORUM_POST_BODY_MAX_LINES).join("\n");
  };

  const submit = () => {
    if (!title.trim() || titleOverLimit || bodyOverLimit) return;
    onSave(title, bodyMd);
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-black/70 p-4 sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/15 bg-[#0b1220] p-5 shadow-2xl"
        role="dialog"
        aria-modal
        aria-labelledby="edit-post-title"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="edit-post-title" className="text-lg font-semibold text-white">
            Upravit příspěvek
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-lg p-1 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-40"
            aria-label="Zavřít"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <label className="mt-4 block">
          <span className="block text-xs font-medium uppercase tracking-wider text-white/50">
            Nadpis
          </span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, FORUM_POST_TITLE_MAX))}
            maxLength={FORUM_POST_TITLE_MAX}
            className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
          />
          <span className="mt-1 block text-right text-[10px] text-white/40">
            {title.length}/{FORUM_POST_TITLE_MAX}
          </span>
        </label>

        <label className="mt-3 block">
          <span className="block text-xs font-medium uppercase tracking-wider text-white/50">
            Text příspěvku
          </span>
          <textarea
            value={bodyMd}
            onChange={(e) => setBodyMd(clampBody(e.target.value))}
            maxLength={FORUM_POST_BODY_MAX}
            rows={8}
            className="mt-1 w-full resize-y rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
          />
          <span className="mt-1 block text-right text-[10px] text-white/40">
            {bodyMd.length}/{FORUM_POST_BODY_MAX}
            {" · "}
            {bodyLineCount}/{FORUM_POST_BODY_MAX_LINES} ř.
          </span>
        </label>

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="text-sm text-white/55 hover:text-white disabled:opacity-40"
          >
            Zrušit
          </button>
          <button
            type="button"
            disabled={busy || !title.trim() || titleOverLimit || bodyOverLimit}
            onClick={submit}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c8102e] to-[#003087] px-4 py-2 text-sm font-bold disabled:opacity-40"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Uložit
          </button>
        </div>
      </div>
    </div>
  );
}
