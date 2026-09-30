"use client";

import { LayoutGrid } from "lucide-react";
import { FifaHubMenuCard } from "@/components/fifa/FifaHubMenuCard";
import { FifaMs2026HubCardArt } from "@/components/fifa/FifaMsHubCardArt";

const MS2026_MENU_ITEMS = [
  {
    href: "/editorsestavy",
    label: "Editor sestavy",
    hint: "Sestav soupisku",
    icon: LayoutGrid,
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
