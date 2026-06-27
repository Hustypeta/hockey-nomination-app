"use client";

import { FifaHubMenuCard } from "@/components/fifa/FifaHubMenuCard";
import { FifaHubMenuCardTouch } from "@/components/fifa/FifaHubMenuCardTouch";
import { FifaCeskaReprezentaceCardArt } from "@/components/fifa/FifaCeskaReprezentaceCardArt";
import { CESKA_REPREZENTACE_MENU_ITEMS } from "@/lib/fifa/ceskaReprezentaceMenuItems";

const cardProps = {
  title: "Česká reprezentace",
  art: <FifaCeskaReprezentaceCardArt />,
  menuItems: CESKA_REPREZENTACE_MENU_ITEMS,
  menuAriaLabel: "Kategorie české reprezentace",
  centerTitle: true as const,
};

export function FifaCeskaReprezentaceHubCard() {
  return (
    <>
      <div className="hidden h-full min-h-0 lg:block">
        <FifaHubMenuCard {...cardProps} />
      </div>
      <div className="lg:hidden">
        <FifaHubMenuCardTouch {...cardProps} />
      </div>
    </>
  );
}

export { CESKA_REPREZENTACE_MENU_ITEMS };
