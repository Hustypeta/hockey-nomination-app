"use client";

import type { PublicCommunityCategory } from "@/components/komunita-public/communityTheme";
import { PUBLIC_CATEGORY_EMOJI, PUBLIC_CATEGORY_LABELS } from "@/components/komunita-public/communityTheme";

export function CommunityCategoryPills({
  value,
  onChange,
}: {
  value: PublicCommunityCategory | "";
  onChange: (v: PublicCommunityCategory | "") => void;
}) {
  const items: (PublicCommunityCategory | "")[] = ["", "REPRE", "EXTRALIGA", "SESTAVY", "ANALYZY", "MEMES", "DISKUZE"];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((id) => {
        const active = value === id;
        const label = id ? PUBLIC_CATEGORY_LABELS[id] : "Vše";
        const emoji = id ? PUBLIC_CATEGORY_EMOJI[id] : "✨";
        return (
          <button
            key={id || "ALL"}
            type="button"
            onClick={() => onChange(id)}
            className={`group inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${
              active
                ? "border-cyan-400/35 bg-cyan-500/15 text-white shadow-[0_0_0_1px_rgba(0,180,255,0.08),0_18px_60px_rgba(0,180,255,0.08)]"
                : "border-white/10 bg-white/[0.04] text-white/75 hover:border-white/18 hover:bg-white/[0.06]"
            }`}
          >
            <span className="text-base leading-none">{emoji}</span>
            <span className="font-semibold">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

