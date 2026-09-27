"use client";

import { FifaExtraligaDraftFantasyCardArt } from "@/components/fifa/FifaExtraligaDraftFantasyCardArt";
import { FifaHubMenuCard } from "@/components/fifa/FifaHubMenuCard";
import {
  EXTRALIGA_DRAFT_FANTASY_HEADLINE,
  EXTRALIGA_DRAFT_FANTASY_SEASON,
} from "@/lib/fifa/extraligaDraftFantasy";

export function FifaExtraligaDraftFantasyHubCard() {
  return (
    <div
      className="block w-full min-h-[13rem] lg-device:h-full lg-device:min-h-0"
      aria-disabled="true"
    >
      <FifaHubMenuCard
        title={EXTRALIGA_DRAFT_FANTASY_HEADLINE}
        subtitle={EXTRALIGA_DRAFT_FANTASY_SEASON}
        art={<FifaExtraligaDraftFantasyCardArt />}
        preparing
        preparingOnly
        centerTitle
      />
    </div>
  );
}
