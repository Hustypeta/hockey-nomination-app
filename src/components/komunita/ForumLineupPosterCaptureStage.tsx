"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Nhl25SharePoster } from "@/components/Nhl25SharePoster";
import { MatchLineupNamesFullPoster } from "@/components/match/MatchFixtureNamesFullPoster";
import { MatchLineupFullJerseyExportPoster } from "@/components/match/MatchLineupFullJerseyExportPoster";
import { captureElementToCanvas } from "@/lib/captureSharePoster";
import { ensureFreshPosterIceBackground } from "@/lib/posterRosterIceBg";
import { isLineupComplete, normalizeLineupStructure } from "@/lib/lineupUtils";
import {
  FORUM_POST_FRAME_H,
  FORUM_POST_FRAME_W,
  FORUM_POSTER_EXPORT_PIXEL_RATIO,
  NOMINATION_WEB_POSTER_W,
} from "@/lib/sharePosterLayout";
import type { LineupStructure, Player } from "@/types";

const FORUM_FRAME_BG = "#05080f";
const FORUM_CAPTURE_W = FORUM_POST_FRAME_W * FORUM_POSTER_EXPORT_PIXEL_RATIO;
const FORUM_CAPTURE_H = FORUM_POST_FRAME_H * FORUM_POSTER_EXPORT_PIXEL_RATIO;

export type ForumCaptureLineupPayload =
  | {
      kind: "NOMINATION";
      players: Player[];
      lineup: LineupStructure;
      captainId: string | null;
      title?: string | null;
      createdAtIso?: string;
    }
  | {
      kind: "MATCH_LINEUP";
      players: Player[];
      lineup: LineupStructure;
      captainId: string | null;
      title?: string | null;
      defenseCount: 6 | 7 | 8;
      allowExtraForward: boolean;
      poolKey?: string | null;
      posterVariant: "names" | "jerseys";
      /** Jen Vítěz nominací jersey capture — zápas / editor dál berou trenéra z poolu. */
      coachName?: string | null;
    };

export type ForumLineupPosterCaptureHandle = {
  captureForumFrame: (payload: ForumCaptureLineupPayload) => Promise<Blob | null>;
};

function measureFitScale(posterHeight: number): number {
  const h = Math.max(1, posterHeight);
  return Math.min(FORUM_CAPTURE_W / NOMINATION_WEB_POSTER_W, FORUM_CAPTURE_H / h);
}

export const ForumLineupPosterCaptureStage = forwardRef<
  ForumLineupPosterCaptureHandle,
  object
>(function ForumLineupPosterCaptureStage(_, ref) {
  const stageRef = useRef<HTMLDivElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const [payload, setPayload] = useState<ForumCaptureLineupPayload | null>(null);
  const [visible, setVisible] = useState(false);
  const [fitScale, setFitScale] = useState(1);

  useImperativeHandle(
    ref,
    () => ({
      async captureForumFrame(p) {
        const ls = normalizeLineupStructure(p.lineup, {
          mode: p.kind === "MATCH_LINEUP" ? "match" : "nomination",
        });
        if (p.kind === "NOMINATION" && !isLineupComplete(ls)) return null;

        flushSync(() => {
          setPayload(p);
          setVisible(true);
          setFitScale(1);
        });

        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        );

        const posterNode = posterRef.current;
        if (!posterNode) return null;

        const scale = measureFitScale(posterNode.offsetHeight);
        flushSync(() => setFitScale(scale));

        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        );

        const stage = stageRef.current;
        if (!stage) return null;

        await ensureFreshPosterIceBackground(posterNode);

        try {
          const canvas = await captureElementToCanvas(stage, {
            scale: 1,
            backgroundColor: FORUM_FRAME_BG,
            captureWidth: FORUM_CAPTURE_W,
            captureHeight: FORUM_CAPTURE_H,
          });
          return await new Promise<Blob | null>((resolve) => {
            canvas.toBlob((blob) => resolve(blob), "image/png", 1);
          });
        } finally {
          flushSync(() => {
            setVisible(false);
            setPayload(null);
            setFitScale(1);
          });
        }
      },
    }),
    []
  );

  const ls = payload
    ? normalizeLineupStructure(payload.lineup, {
        mode: payload.kind === "MATCH_LINEUP" ? "match" : "nomination",
      })
    : null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed left-[-9999px] top-0 z-[-1] overflow-hidden"
      style={{ visibility: visible ? "visible" : "hidden" }}
    >
      <div
        ref={stageRef}
        style={{
          width: FORUM_CAPTURE_W,
          height: FORUM_CAPTURE_H,
          background: FORUM_FRAME_BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <div
          ref={posterRef}
          style={{
            width: NOMINATION_WEB_POSTER_W,
            flexShrink: 0,
            transform: `scale(${fitScale})`,
            transformOrigin: "center center",
          }}
        >
          {payload?.kind === "NOMINATION" && ls ? (
            <Nhl25SharePoster
              players={payload.players}
              lineup={ls}
              captainId={payload.captainId}
              assistantIds={ls.assistantIds ?? []}
              nominationTitle={payload.title ?? undefined}
              siteUrl=""
              footerInstantIso={payload.createdAtIso}
            />
          ) : null}
          {payload?.kind === "MATCH_LINEUP" &&
          payload.posterVariant === "names" &&
          ls ? (
            <MatchLineupNamesFullPoster
              headline={payload.title ?? "Zápasová sestava"}
              players={payload.players}
              lineup={ls}
              defenseCount={payload.defenseCount}
              allowExtraForward={payload.allowExtraForward}
              poolKey={payload.poolKey}
              captainId={payload.captainId}
              siteUrl=""
            />
          ) : null}
          {payload?.kind === "MATCH_LINEUP" &&
          payload.posterVariant === "jerseys" &&
          ls ? (
            <MatchLineupFullJerseyExportPoster
              lineupTitle={payload.title ?? "Zápasová sestava"}
              players={payload.players}
              lineup={ls}
              defenseCount={payload.defenseCount}
              allowExtraForward={payload.allowExtraForward}
              poolKey={payload.poolKey}
              captainId={payload.captainId}
              coachName={payload.coachName}
              siteUrl=""
            />
          ) : null}
        </div>
      </div>
    </div>
  );
});
