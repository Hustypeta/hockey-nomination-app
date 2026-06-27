"use client";

import { Sparkles, Trophy } from "lucide-react";
import { FifaHubMenuCard } from "@/components/fifa/FifaHubMenuCard";
import { FifaMs2026HubCardArt } from "@/components/fifa/FifaMsHubCardArt";

const MS2026_MENU_ITEMS = [
  {
    href: "/fantasy",
    label: "Daily Fantasy",
    hint: "6 hráčů denně",
    icon: Sparkles,
  },
  {
    href: "/sestava",
    label: "Tipovačka nominace",
    hint: "Sestav nominaci",
    icon: Trophy,
  },
] as const;

export function FifaMs2026HubCard() {
  return (
    <FifaHubMenuCard
      className="fifa-ms-hub-menu-card"
      title="MS 2026"
      art={<FifaMs2026HubCardArt />}
      menuItems={[...MS2026_MENU_ITEMS]}
      menuAriaLabel="Soutěže MS 2026"
      ended
    />
  );
}
