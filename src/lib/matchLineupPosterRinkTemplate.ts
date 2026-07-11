import type { CSSProperties, ReactNode } from "react";
import {
  FIFA_RINK_TEMPLATE_MOBILE_HEIGHT,
  FIFA_RINK_TEMPLATE_MOBILE_SRC,
  FIFA_RINK_TEMPLATE_MOBILE_WIDTH,
  FIFA_RINK_TEMPLATE_SLOTS_MOBILE,
  type FifaRinkSlotRect,
  type FifaRinkTemplatePos,
} from "@/lib/fifa/fifaRinkTemplate";

/** Portrétní led se štíty — stejné sloty jako mobilní editor sestavy (803×1024). */
export const MATCH_LINEUP_POSTER_RINK_SRC = FIFA_RINK_TEMPLATE_MOBILE_SRC;
export const MATCH_LINEUP_POSTER_RINK_WIDTH = FIFA_RINK_TEMPLATE_MOBILE_WIDTH;
export const MATCH_LINEUP_POSTER_RINK_HEIGHT = FIFA_RINK_TEMPLATE_MOBILE_HEIGHT;
export const MATCH_LINEUP_POSTER_RINK_ASPECT =
  MATCH_LINEUP_POSTER_RINK_WIDTH / MATCH_LINEUP_POSTER_RINK_HEIGHT;

export const MATCH_LINEUP_POSTER_RINK_SLOTS = FIFA_RINK_TEMPLATE_SLOTS_MOBILE;

export function matchLineupPosterRinkSlotStyle(slot: FifaRinkSlotRect): CSSProperties {
  return {
    position: "absolute",
    left: `${slot.left}%`,
    top: `${slot.top}%`,
    width: `${slot.width}%`,
    aspectRatio: "1 / 1",
    height: "auto",
    transform: "translate(-50%, -50%) perspective(720px) rotateX(22deg)",
    transformStyle: "preserve-3d",
    zIndex: 3,
  };
}

export type MatchLineupPosterRinkPlacement = {
  pos: FifaRinkTemplatePos;
  node: ReactNode;
};