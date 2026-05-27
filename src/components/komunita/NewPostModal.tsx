"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import {
  COMMUNITY_CATEGORY_LABELS,
  COMMUNITY_CATEGORY_ORDER,
} from "@/lib/community/categories";
import type { CommunityPostCategory } from "@prisma/client";
import type { MyLineupPick } from "@/lib/community/types";

export function NewPostModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [bodyMd, setBodyMd] = useState("");
  const [category, setCategory] = useState<CommunityPostCategory>("GENERAL");
  const [tagInput, setTagInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [picks, setPicks] = useState<MyLineupPick[]>([]);
  const [picksLoading, setPicksLoading] = useState(false);
  const [selectedPick, setSelectedPick] = useState<MyLineupPick | null>(null);

  useEffect(() => {
    if (!open) return;
    setPicksLoading(true);
    fetch("/api/admin/komunita/my-lineups", { credentials: "include" })
      .then((r) => r.json())
      .then((d: { picks?: MyLineupPick[]; error?: string }) => {
        if (d.error && !d.picks) toast.error(d.error);
        setPicks(d.picks ?? []);
      })
      .catch(() => setPicks([]))
      .finally(() => setPicksLoading(false));
  }, [open]);

  if (!open) return null;

  const tags = tagInput
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const attachmentPayload = selectedPick
    ? [
        selectedPick.kind === "NOMINATION"
          ? { kind: "NOMINATION", nominationId: selectedPick.id }
          : selectedPick.kind === "MATCH_LINEUP"
            ? { kind: "MATCH_LINEUP", code: selectedPick.id }
            : { kind: "FANTASY_LINEUP", lineupId: selectedPick.id },
      ]
    : [];

  const submit = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/komunita/posts", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, bodyMd, category, tags, attachments: attachmentPayload }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Uložení selhalo.");
        return;
      }
      toast.success("Příspěvek publikován.");
      setTitle("");
      setBodyMd("");
      setTagInput("");
      setSelectedPick(null);
      onCreated();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/15 bg-[#0b1220] p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold text-white">Nový příspěvek</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-white/60 hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <label className="block text-xs font-medium uppercase tracking-wider text-white/50">
            Kategorie
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CommunityPostCategory)}
              className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
            >
              {COMMUNITY_CATEGORY_ORDER.map((c) => (
                <option key={c} value={c}>
                  {COMMUNITY_CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-medium uppercase tracking-wider text-white/50">
            Nadpis
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
            />
          </label>

          <label className="block text-xs font-medium uppercase tracking-wider text-white/50">
            Text (podporuje **tučné**)
            <textarea
              value={bodyMd}
              onChange={(e) => setBodyMd(e.target.value)}
              rows={5}
              className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
            />
          </label>

          <label className="block text-xs font-medium uppercase tracking-wider text-white/50">
            Tagy (čárkou)
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="ms2026, nominace"
              className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
            />
          </label>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/50">
              Přiložit sestavu (volitelné)
            </p>
            {picksLoading ? (
              <p className="mt-2 flex items-center gap-2 text-sm text-white/50">
                <Loader2 className="h-4 w-4 animate-spin" />
                Načítám tvoje sestavy…
              </p>
            ) : picks.length === 0 ? (
              <p className="mt-2 text-xs text-white/45">
                Žádné sestavy — ulož nominaci, zápasovou sestavu nebo fantasy.
              </p>
            ) : (
              <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto">
                {picks.map((p) => (
                  <li key={`${p.kind}-${p.id}`}>
                    <button
                      type="button"
                      onClick={() => setSelectedPick(selectedPick?.id === p.id ? null : p)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                        selectedPick?.id === p.id
                          ? "bg-cyan-600/30 text-white"
                          : "bg-white/5 text-white/80 hover:bg-white/10"
                      }`}
                    >
                      <span className="font-medium">{p.title}</span>
                      <span className="ml-2 text-[11px] text-white/45">{p.kind}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <button
          type="button"
          disabled={busy || !title.trim() || !bodyMd.trim()}
          onClick={() => void submit()}
          className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#c8102e] to-[#003087] py-3 text-sm font-bold text-white disabled:opacity-40"
        >
          {busy ? "Ukládám…" : "Publikovat"}
        </button>
      </div>
    </div>
  );
}
