"use client";

import { useMemo } from "react";
import { X } from "lucide-react";
import { TipsportPartnerBanner } from "@/components/marketing/TipsportPartnerBanner";
import { MatchLineupImageExportButton } from "@/components/match/MatchLineupImageExportButton";
import type { LineupStructure, Player } from "@/types";
import {
  MATCH_LINEUP_SHARE_TITLE_MAX_LENGTH,
  clampMatchLineupShareTitle,
} from "@/lib/matchLineupShareTitle";
import { FIFA_BTN_PRIMARY, FIFA_INPUT, FIFA_KICKER } from "@/lib/fifa/fifaUiClasses";

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
  poolKey,
  captainId = null,
  guestMode = false,
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
  poolKey?: string | null;
  captainId?: string | null;
  /** Host — jen plakát, bez uložení. */
  guestMode?: boolean;
}) {
  const canShare = valid && !saving;

  const titleHint = useMemo(() => {
    const t = shareTitle.trim();
    return t ? "" : "Název (volitelné)";
  }, [shareTitle]);

  if (!open) return null;

  return (
    <div
      className="fifa-share-modal-backdrop z-[300]"
      onClick={() => !saving && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={guestMode ? "Plakát" : "Uložit a sdílet sestavu na zápas"}
        className="fifa-share-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="fifa-share-modal__head">
          <div>
            <p className={FIFA_KICKER}>{guestMode ? "Host" : "Sdílení"}</p>
            <h2 className="mt-1 font-display text-lg font-bold tracking-wide text-[var(--fifa-text)]">
              {guestMode ? "Plakát" : "Uložit & sdílet"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="fifa-forum-modal__close disabled:opacity-50"
            aria-label="Zavřít"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="fifa-share-modal__body">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className={`${FIFA_KICKER} block`}>Název sestavy</label>
              <span className="tabular-nums text-[11px] font-semibold text-[var(--fifa-text-muted)]">
                {shareTitle.length}/{MATCH_LINEUP_SHARE_TITLE_MAX_LENGTH}
              </span>
            </div>
            <input
              value={shareTitle}
              maxLength={MATCH_LINEUP_SHARE_TITLE_MAX_LENGTH}
              onChange={(e) => onShareTitleChange(clampMatchLineupShareTitle(e.target.value))}
              className={FIFA_INPUT}
              placeholder={titleHint}
            />
          </div>

          {!guestMode ? (
            <button
              type="button"
              onClick={() => void onSave()}
              disabled={!canShare}
              className={`${FIFA_BTN_PRIMARY} w-full py-3 disabled:opacity-50`}
            >
              {saving ? "Ukládám…" : "Uložit"}
            </button>
          ) : null}

          <div className="fifa-share-field">
            <p className={FIFA_KICKER}>Plakát</p>
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
                poolKey={poolKey}
                captainId={captainId}
                disabled={!valid}
              />
            </div>
          </div>

          <TipsportPartnerBanner compact className="fifa-design-tipsport-compact border-t border-[var(--fifa-border)] pt-4" />
        </div>
      </div>
    </div>
  );
}

