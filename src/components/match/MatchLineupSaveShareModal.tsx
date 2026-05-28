"use client";

import { useMemo } from "react";
import { X } from "lucide-react";
import { TipsportPartnerBanner } from "@/components/marketing/TipsportPartnerBanner";
import { MatchLineupImageExportButton } from "@/components/match/MatchLineupImageExportButton";
import type { LineupStructure, Player } from "@/types";

export function MatchLineupSaveShareModal({
  open,
  onClose,
  shareTitle,
  onShareTitleChange,
  shareUrl,
  saving,
  valid,
  onSave,
  posterModalOpen,
  onPosterModalOpenChange,
  lineup,
  players,
  defenseCount,
  allowExtraForward,
  shareSlug,
  siteOrigin,
}: {
  open: boolean;
  onClose: () => void;
  shareTitle: string;
  onShareTitleChange: (v: string) => void;
  shareUrl: string;
  saving: boolean;
  valid: boolean;
  onSave: () => Promise<string | null>;
  posterModalOpen: boolean;
  onPosterModalOpenChange: (open: boolean) => void;
  lineup: LineupStructure;
  players: Player[];
  defenseCount: 6 | 7 | 8;
  allowExtraForward: boolean;
  shareSlug?: string | null;
  siteOrigin: string;
}) {
  const canShare = valid && !saving;

  const titleHint = useMemo(() => {
    const t = shareTitle.trim();
    return t ? "" : "Název (volitelné)";
  }, [shareTitle]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={() => !saving && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Uložit a sdílet sestavu na zápas"
        className="max-h-[min(92vh,760px)] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/12 bg-[#0b1220] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/50">Sdílení</p>
            <h2 className="mt-1 font-display text-lg font-black text-white">Uložit & sdílet</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/80 hover:bg-white/[0.08] disabled:opacity-50"
            aria-label="Zavřít"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-[0.22em] text-white/50">
              Název sestavy
            </label>
            <input
              value={shareTitle}
              onChange={(e) => onShareTitleChange(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-sm font-semibold text-white outline-none focus:border-[#00B4FF]/45 focus:ring-1 focus:ring-[#00B4FF]/30"
              placeholder={titleHint}
            />
          </div>

          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => void onSave()}
              disabled={!canShare}
              className="rounded-xl bg-gradient-to-r from-[#c8102e] to-[#003087] px-4 py-2.5 text-sm font-black text-white shadow-[0_16px_44px_rgba(0,0,0,0.22)] ring-1 ring-white/15 hover:brightness-110 disabled:opacity-50"
            >
              {saving ? "Ukládám…" : "Uložit"}
            </button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/50">Plakát</p>
            <div className="mt-3">
              <MatchLineupImageExportButton
                modalOpen={posterModalOpen}
                onModalOpenChange={onPosterModalOpenChange}
                shareTitle={shareTitle}
                lineup={lineup}
                players={players}
                defenseCount={defenseCount}
                allowExtraForward={allowExtraForward}
                shareSlug={shareSlug}
                siteOrigin={siteOrigin}
                disabled={!valid}
              />
            </div>
          </div>

          <TipsportPartnerBanner compact className="mt-6 border-t border-white/10 pt-6" />
        </div>
      </div>
    </div>
  );
}

