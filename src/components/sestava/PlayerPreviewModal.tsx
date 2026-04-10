"use client";

import { X } from "lucide-react";
import type { Player } from "@/types";
import type { Role } from "@/types";
import { ROLE_LABELS, POSITION_LABELS } from "@/types";
import { PlayerAvatar } from "./PlayerAvatar";

export function PlayerPreviewModal({
  player,
  onClose,
}: {
  player: Player | null;
  onClose: () => void;
}) {
  if (!player) return null;

  const teamLine = [player.club, player.league].filter(Boolean).join(" · ");

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-white/10 bg-[#141414] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <PlayerAvatar name={player.name} position={player.position} role={player.role} size="lg" />
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-2xl font-bold text-white">{player.name}</h3>
              {teamLine ? (
                <p className="mt-1 truncate text-base font-medium text-white/85" title={teamLine}>
                  {teamLine}
                </p>
              ) : null}
              <p className="mt-1 text-sm text-[#d4af37]/90">{POSITION_LABELS[player.position]}</p>
              {player.role && ROLE_LABELS[player.role as Role] && (
                <p className="text-xs text-white/50">{ROLE_LABELS[player.role as Role]}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-white/50 hover:bg-white/10 hover:text-white"
            aria-label="Zavřít"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <dl className="mt-6 space-y-3 border-t border-white/10 pt-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-white/45">Klub</dt>
            <dd className="text-right font-medium text-white">{player.club || "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-white/45">Liga</dt>
            <dd className="text-right text-white/90">{player.league || "—"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
