"use client";

import { Users } from "lucide-react";
import { FifaHomeKomunitaStatsCard } from "@/components/fifa/FifaHomeKomunitaStatsCard";

export function FifaHomeKomunitaCard() {
  return (
    <article className="fifa-card fifa-card-hero fifa-card--interactive fifa-home-komunita-card group relative flex h-full min-h-0 flex-col overflow-hidden">
      <Users className="fifa-komunita-watermark" aria-hidden />
      <div className="fifa-card-header relative z-10">
        <p className="fifa-kicker flex items-center gap-2">
          <span className="fifa-icon-chip">
            <Users className="h-3.5 w-3.5" aria-hidden />
          </span>
          Komunita
        </p>
      </div>
      <div className="fifa-card-body relative z-10 min-h-0 flex-1">
        <FifaHomeKomunitaStatsCard />
      </div>
    </article>
  );
}
