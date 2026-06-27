"use client";

import Link from "next/link";
import { FifaExtraligaDraftFantasyCardArt } from "@/components/fifa/FifaExtraligaDraftFantasyCardArt";
import { FifaHubMenuCard } from "@/components/fifa/FifaHubMenuCard";
import {
  EXTRALIGA_DRAFT_FANTASY_HEADLINE,
  EXTRALIGA_DRAFT_FANTASY_SEASON,
  EXTRALIGA_DRAFT_FANTASY_TITLE,
} from "@/lib/fifa/extraligaDraftFantasy";

export function FifaExtraligaDraftFantasyHubCard() {
  return (
    <Link href="/souteze/extraliga" className="block min-h-0 w-full lg:h-full" aria-label={`Otevřít: ${EXTRALIGA_DRAFT_FANTASY_TITLE}`}>
      <FifaHubMenuCard
        title={EXTRALIGA_DRAFT_FANTASY_HEADLINE}
        subtitle={EXTRALIGA_DRAFT_FANTASY_SEASON}
        art={<FifaExtraligaDraftFantasyCardArt />}
        preparing
        preparingOnly
        centerTitle
      />
    </Link>
  );
}
