"use client";

import { Trophy } from "lucide-react";
import { FifaHubMenuCard } from "@/components/fifa/FifaHubMenuCard";
import { FifaMs2027HubCardArt } from "@/components/fifa/FifaMsHubCardArt";

const MS2027_MENU_ITEMS = [
  {
    href: "/souteze/ms-2027",
    label: "Mistrovství světa",
    hint: "Německo",
    icon: Trophy,
  },
] as const;

export function FifaMs2027HubCard() {
  return (
    <FifaHubMenuCard
      className="fifa-ms-hub-menu-card"
      title="MS 2027"
      art={<FifaMs2027HubCardArt />}
      menuItems={[...MS2027_MENU_ITEMS]}
      menuAriaLabel="Soutěže MS 2027"
      preparing
    />
  );
}
