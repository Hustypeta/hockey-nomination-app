"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ListOrdered, Loader2, MessageCircle, Users, X } from "lucide-react";
import { toast } from "sonner";
import {
  COMMUNITY_CATEGORY_LABELS,
  COMMUNITY_CATEGORY_ORDER,
} from "@/lib/community/categories";
import type { CommunityPostCategory } from "@prisma/client";
import type { MyLineupPick } from "@/lib/community/types";
import { fetchLineupCapturePayload } from "@/lib/community/fetchLineupCapturePayload";
import { uploadForumPosterFrame } from "@/lib/community/uploadForumPosterFrame";
import { FORUM_POST_BODY_MAX, FORUM_POST_TITLE_MAX } from "@/lib/community/validate";
import { FIFA_BTN_PRIMARY, FIFA_INPUT } from "@/lib/fifa/fifaUiClasses";
import {
  ForumLineupPosterCaptureStage,
  type ForumLineupPosterCaptureHandle,
} from "@/components/komunita/ForumLineupPosterCaptureStage";
import type { Player } from "@/types";

const ADMIN_API = "/api/admin/komunita";

type PostType = "normal" | "lineup" | "nomination";

export function NewPostModal({
  open,
  onClose,
  onCreated,
  apiBase = ADMIN_API,
  fifaUi = false,
  staffPost = false,
  players: playersProp,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  apiBase?: string;
  fifaUi?: boolean;
  /** Admin komunita — příspěvek jako staff (badge Admin). */
  staffPost?: boolean;
  /** Hráči pro generování náhledu sestavy (volitelné — načte se z /api/players). */
  players?: Player[];
}) {
  const [title, setTitle] = useState("");
  const [bodyMd, setBodyMd] = useState("");
  const [category, setCategory] = useState<CommunityPostCategory>("GENERAL");
  const [postType, setPostType] = useState<PostType>("normal");
  const [busy, setBusy] = useState(false);
  const [picks, setPicks] = useState<MyLineupPick[]>([]);
  const [picksLoading, setPicksLoading] = useState(false);
  const [selectedPick, setSelectedPick] = useState<MyLineupPick | null>(null);
  const [playersLocal, setPlayersLocal] = useState<Player[]>([]);
  const captureRef = useRef<ForumLineupPosterCaptureHandle>(null);

  const players = playersProp?.length ? playersProp : playersLocal;

  const lineupsUrl = apiBase === "/api/forum" ? "/api/forum/my-lineups" : `${apiBase}/my-lineups`;

  useEffect(() => {
    if (!open || playersProp?.length) return;
    fetch("/api/players")
      .then((r) => r.json())
      .then((d: { players?: Player[] }) => setPlayersLocal(d.players ?? []))
      .catch(() => setPlayersLocal([]));
  }, [open, playersProp?.length]);

  useEffect(() => {
    if (!open) return;
    setPicksLoading(true);
    fetch(lineupsUrl, { credentials: "include" })
      .then((r) => r.json())
      .then((d: { picks?: MyLineupPick[]; error?: string }) => {
        if (d.error && !d.picks) toast.error(d.error);
        setPicks(d.picks ?? []);
      })
      .catch(() => setPicks([]))
      .finally(() => setPicksLoading(false));
  }, [open, lineupsUrl]);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setBodyMd("");
      setCategory("GENERAL");
      setPostType("normal");
      setSelectedPick(null);
    }
  }, [open]);

  const filteredPicks = useMemo(() => {
    if (postType === "nomination") return picks.filter((p) => p.kind === "NOMINATION");
    if (postType === "lineup") return picks.filter((p) => p.kind !== "NOMINATION");
    return picks;
  }, [picks, postType]);

  if (!open) return null;

  const selectPostType = (type: PostType) => {
    setPostType(type);
    setSelectedPick(null);
    if (type === "nomination") setCategory("LINEUP_NOMINATION");
    else if (type === "lineup") setCategory("FANTASY");
  };

  const attachmentPayload = selectedPick
    ? [
        selectedPick.kind === "NOMINATION"
          ? { kind: "NOMINATION" as const, nominationId: selectedPick.id }
          : selectedPick.kind === "MATCH_LINEUP"
            ? { kind: "MATCH_LINEUP" as const, code: selectedPick.id }
            : { kind: "FANTASY_LINEUP" as const, lineupId: selectedPick.id },
      ]
    : [];

  const buildAttachmentsWithFrame = async () => {
    if (!selectedPick || selectedPick.kind === "FANTASY_LINEUP") return attachmentPayload;
    if (!players.length) return attachmentPayload;

    const capturePayload = await fetchLineupCapturePayload(selectedPick, players);
    if (!capturePayload) return attachmentPayload;

    const blob = await captureRef.current?.captureForumFrame(capturePayload);
    if (!blob) {
      toast.error("Nepodařilo se vygenerovat náhled sestavy pro fórum.");
      return null;
    }

    const imageUrl = await uploadForumPosterFrame(blob);
    const base = attachmentPayload[0];
    if (base.kind === "NOMINATION") {
      return [{ ...base, forumFrameImageUrl: imageUrl }];
    }
    if (base.kind === "MATCH_LINEUP") {
      return [{ ...base, forumFrameImageUrl: imageUrl }];
    }
    return attachmentPayload;
  };

  const submit = async () => {
    if (!title.trim()) {
      toast.error("Vyplň nadpis příspěvku.");
      return;
    }
    setBusy(true);
    try {
      const attachments = await buildAttachmentsWithFrame();
      if (attachments === null) return;

      const res = await fetch(`${apiBase}/posts`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          bodyMd: bodyMd.trim() || title,
          category,
          tags: [],
          attachments,
          ...(staffPost ? { asStaff: true } : {}),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Uložení selhalo.");
        return;
      }
      toast.success("Příspěvek byl úspěšně publikován!");
      onCreated();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const shellClass = fifaUi ? "fifa-forum-new-modal" : "max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/15 bg-[#0b1220] p-5 shadow-2xl";
  const labelClass = fifaUi
    ? "block text-[10px] font-bold uppercase tracking-wider text-[var(--fifa-text-muted)] mb-1.5"
    : "block text-xs font-medium uppercase tracking-wider text-white/50";
  const inputClass = fifaUi
    ? `${FIFA_INPUT} !rounded-2xl`
    : "mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white";

  return (
    <div
      className={`fixed inset-0 z-[120] flex items-end justify-center p-4 sm:items-center ${fifaUi ? "fifa-forum-modal-backdrop" : "bg-black/70"}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div className={shellClass} role="dialog" aria-modal aria-labelledby="new-post-title">
        <div className="fifa-forum-new-modal__head">
          <h2 id="new-post-title" className="text-xl font-semibold text-[var(--fifa-text)]">
            {staffPost ? "Nový admin příspěvek" : "Nový příspěvek"}
          </h2>
          <button type="button" onClick={onClose} className="fifa-forum-detail-modal__close" aria-label="Zavřít">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="fifa-forum-new-modal__body">
          <div>
            <p className={labelClass}>Typ příspěvku</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => selectPostType("normal")}
                className={`fifa-forum-type-btn ${postType === "normal" ? "fifa-forum-type-btn--active" : ""}`}
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                Diskuze
              </button>
              <button
                type="button"
                onClick={() => selectPostType("lineup")}
                className={`fifa-forum-type-btn ${postType === "lineup" ? "fifa-forum-type-btn--active" : ""}`}
              >
                <ListOrdered className="h-4 w-4" aria-hidden />
                Sestava
              </button>
              <button
                type="button"
                onClick={() => selectPostType("nomination")}
                className={`fifa-forum-type-btn ${postType === "nomination" ? "fifa-forum-type-btn--active" : ""}`}
              >
                <Users className="h-4 w-4" aria-hidden />
                Nominace
              </button>
            </div>
          </div>

          <label className="block">
            <span className={labelClass}>Nadpis</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={FORUM_POST_TITLE_MAX}
              placeholder="Např. Moje ideální sestava na MS 2026"
              className={inputClass}
            />
            <span className="mt-1 block text-right text-[10px] text-[var(--fifa-text-muted)]">
              {title.length}/{FORUM_POST_TITLE_MAX}
            </span>
          </label>

          <label className="block">
            <span className={labelClass}>Text příspěvku</span>
            <textarea
              value={bodyMd}
              onChange={(e) => setBodyMd(e.target.value)}
              maxLength={FORUM_POST_BODY_MAX}
              rows={4}
              placeholder="Co chceš sdílet s komunitou?"
              className={`${inputClass} resize-y`}
            />
            <span className="mt-1 block text-right text-[10px] text-[var(--fifa-text-muted)]">
              {bodyMd.length}/{FORUM_POST_BODY_MAX}
            </span>
          </label>

          <label className="block">
            <span className={labelClass}>Kategorie</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CommunityPostCategory)}
              className={`${inputClass} w-full`}
            >
              {COMMUNITY_CATEGORY_ORDER.map((c) => (
                <option key={c} value={c}>
                  {COMMUNITY_CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </label>

          {postType !== "normal" ? (
            <div className="fifa-forum-lineup-picker">
              <p className={labelClass}>
                {postType === "nomination" ? "Přiložit nominaci" : "Přiložit sestavu"}
              </p>
              {picksLoading ? (
                <p className="flex items-center gap-2 text-sm text-[var(--fifa-text-muted)]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Načítám tvoje sestavy…
                </p>
              ) : filteredPicks.length === 0 ? (
                <p className="text-xs text-[var(--fifa-text-muted)]">
                  Žádné uložené {postType === "nomination" ? "nominace" : "sestavy"} — nejdřív je vytvoř v editoru.
                </p>
              ) : (
                <ul className="max-h-36 space-y-1 overflow-y-auto">
                  {filteredPicks.map((p) => (
                    <li key={`${p.kind}-${p.id}`}>
                      <button
                        type="button"
                        onClick={() => setSelectedPick(selectedPick?.id === p.id ? null : p)}
                        className={`fifa-forum-lineup-pick ${selectedPick?.id === p.id ? "fifa-forum-lineup-pick--active" : ""}`}
                      >
                        {p.title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </div>

        <div className="fifa-forum-new-modal__foot">
          <button type="button" onClick={onClose} className="text-sm font-medium text-[var(--fifa-text-muted)] hover:text-[var(--fifa-text)]">
            Zrušit
          </button>
          <button type="button" disabled={busy || !title.trim()} onClick={() => void submit()} className={FIFA_BTN_PRIMARY}>
            {busy ? (selectedPick && selectedPick.kind !== "FANTASY_LINEUP" ? "Generuji náhled…" : "Odesílám…") : "Odeslat příspěvek"}
          </button>
        </div>
      </div>
      <ForumLineupPosterCaptureStage ref={captureRef} />
    </div>
  );
}
