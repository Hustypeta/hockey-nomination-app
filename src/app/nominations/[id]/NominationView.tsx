"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { SitePageHero } from "@/components/site/SitePageHero";
import { LineBuilder } from "@/components/LineBuilder";
import { normalizeLineupStructure } from "@/lib/lineupUtils";
import { initJerseyNameDisambiguation } from "@/lib/jerseyDisplayName";
import type { Player } from "@/types";
import type { LineupStructure } from "@/types";

interface NominationViewProps {
  players: Player[];
  captainId: string | null;
  lineupStructure?: LineupStructure | null;
  nominationId: string;
  /** Vlastní název z účtu; když chybí, zobrazí se výchozí text. */
  title?: string | null;
  /** Nepřihlášení nemají stažení; výchozí true kvůli zpětné kompatibilitě u serverově renderovaných stránek s session. */
  allowDownload?: boolean;
  /** Pokud je nastaveno, „Kopírovat odkaz“ použije tento řetězec (např. celý /share?z=…). */
  linkToCopy?: string;
}

export function NominationView({
  players,
  captainId,
  lineupStructure,
  nominationId,
  title,
  allowDownload = true,
  linkToCopy,
}: NominationViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const url =
      linkToCopy ?? `${window.location.origin}/nominations/${nominationId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    initJerseyNameDisambiguation(players);
  }, [players]);

  const normalized = useMemo(
    () => (lineupStructure ? normalizeLineupStructure(lineupStructure) : null),
    [lineupStructure]
  );

  const filled = useMemo(() => {
    if (!normalized) return 0;
    return [
      ...normalized.goalies,
      ...normalized.forwardLines.flatMap((l) => [l.lw, l.c, l.rw, l.x]),
      ...normalized.defensePairs.flatMap((p) => [p.lb, p.rb]),
      ...normalized.extraForwards,
      ...normalized.extraDefensemen,
    ].filter(Boolean).length;
  }, [normalized]);

  const label = title?.trim() || "Moje nominace";

  return (
    <SiteShell>
      <SitePageHero
        kicker="Nominace"
        title={label}
        subtitle={`Náhled sestavy (${filled}/25) — pouze pro čtení.`}
        align="center"
      />
      <main className="relative z-10 mx-auto max-w-5xl px-4 pb-24 pt-2 sm:px-6">
        <div className="nhl25-moje-sestava-panel rounded-2xl p-3.5 sm:p-5 lg:p-6">
          <div className="nhl25-moje-sestava-accent mb-2 sm:mb-3" aria-hidden />
          {normalized ? (
            <LineBuilder
              lineup={normalized}
              players={players}
              captainId={captainId}
              onLineupChange={() => undefined}
              onCaptainChange={() => undefined}
              selectedSlot={null}
              onSelectSlot={() => undefined}
              enableDnd={false}
              readOnly
              layoutVariant="nhl25"
            />
          ) : (
            <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/75">
              Tato nominace neobsahuje kompletní data sestavy.
            </p>
          )}

          <div className="mt-6 flex flex-col items-stretch justify-center gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleCopyLink}
              className="rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/85 underline-offset-4 transition hover:bg-white/[0.07] hover:text-white"
            >
              {copied ? "Zkopírováno" : "Kopírovat odkaz"}
            </button>
            <Link
              href="/sestava"
              className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-5 py-3 text-center text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/45 hover:bg-cyan-500/15"
            >
              Otevřít editor sestavy
            </Link>
          </div>

          {!allowDownload ? (
            <p className="mt-4 text-center text-xs text-white/55">
              Odkaz můžeš poslat dál. Další možnosti sdílení jsou dostupné po přihlášení.
            </p>
          ) : null}
        </div>
      </main>
    </SiteShell>
  );
}
