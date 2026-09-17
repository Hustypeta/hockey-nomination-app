"use client";

import { Bookmark, LayoutGrid, Settings, Trophy } from "lucide-react";
import type { AccountHubSectionId } from "@/components/account/accountHubTypes";
import { ACCOUNT_HUB_SECTIONS } from "@/components/account/accountHubTypes";

const SECTION_ICONS: Record<AccountHubSectionId, typeof LayoutGrid> = {
  lineups: LayoutGrid,
  contests: Trophy,
  collections: Bookmark,
  settings: Settings,
};

export function AccountHubNav({
  active,
  onChange,
}: {
  active: AccountHubSectionId;
  onChange: (id: AccountHubSectionId) => void;
}) {
  return (
    <nav className="fifa-account-hub-nav" aria-label="Sekce účtu">
      {ACCOUNT_HUB_SECTIONS.map((section) => {
        const Icon = SECTION_ICONS[section.id];
        const isActive = active === section.id;
        return (
          <button
            key={section.id}
            type="button"
            className={`fifa-account-hub-nav__item${isActive ? " fifa-account-hub-nav__item--active" : ""}`}
            aria-current={isActive ? "page" : undefined}
            onClick={() => onChange(section.id)}
          >
            <Icon className="fifa-account-hub-nav__icon" aria-hidden />
            <span className="fifa-account-hub-nav__label">{section.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
