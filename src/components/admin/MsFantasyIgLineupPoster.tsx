"use client";

import { forwardRef, useId } from "react";
import { FlagMark } from "@/components/flags/FlagMark";
import { IceRinkShell } from "@/components/shared/IceRinkShell";
import { MsFantasyPlayerAvatar } from "@/components/ms-fantasy/MsFantasyPlayerAvatar";
import {
  msFantasyLineupCardLastName,
  msFantasyLineupCardLastNameStyle,
  msFantasyLineupCardLastNameTextClass,
} from "@/lib/msFantasyDisplayName";
import { MS_FANTASY_IG_POSTER_STYLE } from "@/lib/msFantasyPosterLayout";
import type { FantasyLineupPosterPayload, FantasyPosterPick } from "@/lib/msFantasyPosterTypes";

const SLOT_G = 0;
const SLOTS_D = [1, 2] as const;
const SLOTS_F = [3, 4, 5] as const;

function PosterPlayerCard({ pick, positionLabel }: { pick: FantasyPosterPick; positionLabel: string }) {
  const last = msFantasyLineupCardLastName(pick.name);
  const isGk = pick.position === "G";

  return (
    <div className="flex w-[118px] flex-col items-center">
      <div className="relative flex w-full flex-col items-center rounded-xl border border-white/25 bg-gradient-to-b from-slate-800/98 via-slate-900 to-[#030712] px-1.5 pb-2 pt-1.5 shadow-[0_12px_28px_rgba(0,0,0,0.45)] ring-1 ring-white/10">
        <MsFantasyPlayerAvatar playerId={pick.id} variant="circle" frame="premium" size="3.25rem" />
        <div className="mt-1 flex w-full items-center justify-center gap-1">
          <p className={msFantasyLineupCardLastNameTextClass(last)} style={msFantasyLineupCardLastNameStyle(last)} title={last}>
            {last}
          </p>
          <FlagMark code={pick.team} className="h-3.5 w-[1.05rem] shrink-0 rounded-sm ring-1 ring-white/30" />
        </div>
        <p className="mt-1 font-display text-[9px] font-bold uppercase tracking-[0.14em] text-cyan-100/90">{positionLabel}</p>
        <p className="mt-1.5 font-display text-xl font-black tabular-nums text-[#f1c40f]">{pick.fantasyPoints}b</p>
      </div>
      <p className="mt-1.5 text-center text-[9px] font-semibold tabular-nums leading-tight text-white/75">
        {isGk ? (
          <>
            V {pick.wins} · GA {pick.goalsAgainst} · SO {pick.shutouts}
          </>
        ) : (
          <>
            G {pick.goals} · A {pick.assists} · ± {pick.plusMinus}
          </>
        )}
      </p>
      <p className="mt-0.5 text-[8px] font-medium text-white/45">{pick.salary} kreditů</p>
    </div>
  );
}

type MsFantasyIgLineupPosterProps = {
  data: FantasyLineupPosterPayload;
  /** Prázdné = zobrazí se placeholder pro ruční doplnění. */
  winnerName: string;
};

export const MsFantasyIgLineupPoster = forwardRef<HTMLDivElement, MsFantasyIgLineupPosterProps>(
  function MsFantasyIgLineupPoster({ data, winnerName }, ref) {
    const rawId = useId().replace(/:/g, "");
    const noiseFilterId = `msFantasyPosterNoise-${rawId}`;
    const scratchPatternId = `msFantasyPosterScratch-${rawId}`;

    const slots: (FantasyPosterPick | null)[] = [null, null, null, null, null, null];
    const g = data.picks.find((p) => p.position === "G");
    const ds = data.picks.filter((p) => p.position === "D");
    const fs = data.picks.filter((p) => p.position === "F");
    if (g) slots[SLOT_G] = g;
    ds.slice(0, 2).forEach((p, i) => {
      slots[SLOTS_D[i]] = p;
    });
    fs.slice(0, 3).forEach((p, i) => {
      slots[SLOTS_F[i]] = p;
    });

    const salaryPct = Math.min(100, Math.round((data.salarySpent / data.salaryCap) * 100));
    const winnerDisplay = winnerName.trim() || "Jméno vítěze";
    const winnerIsPlaceholder = !winnerName.trim();

    return (
      <div
        ref={ref}
        className="relative overflow-hidden bg-[#05060f] text-white"
        style={MS_FANTASY_IG_POSTER_STYLE}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,180,255,0.22), transparent 55%),
              radial-gradient(ellipse 60% 40% at 100% 100%, rgba(200,16,46,0.18), transparent 50%),
              linear-gradient(180deg, #0c1220 0%, #05060f 55%, #030408 100%)
            `,
          }}
          aria-hidden
        />

        <div className="relative flex h-full flex-col px-10 pb-8 pt-9">
          <div className="text-center">
            <p className="font-display text-[11px] font-bold uppercase tracking-[0.32em] text-cyan-300/90">MS 2026</p>
            <h1 className="mt-1 font-display text-[2.35rem] font-black uppercase tracking-[0.08em] text-white">Fantasy</h1>
            <p className="mt-2 text-[13px] font-medium text-white/55">{data.gameDayTitle}</p>
          </div>

          <div
            className={`mx-auto mt-5 flex min-h-[72px] w-full max-w-[640px] items-center justify-center rounded-2xl border-2 border-dashed px-6 py-3 text-center ${
              winnerIsPlaceholder ? "border-white/25 bg-white/[0.03]" : "border-[#f1c40f]/45 bg-[#f1c40f]/[0.08]"
            }`}
          >
            <p
              className={`font-display text-[1.65rem] font-black leading-tight tracking-wide ${
                winnerIsPlaceholder ? "text-white/35" : "text-[#f1e6a8]"
              }`}
            >
              {winnerDisplay}
            </p>
          </div>

          <div className="mt-4 flex items-end justify-center gap-10">
            <div className="text-center">
              <p className="font-display text-5xl font-black tabular-nums text-[#f1c40f]">{data.points}</p>
              <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white/45">bodů</p>
            </div>
            <div className="text-center">
              <p className="font-display text-2xl font-black tabular-nums text-cyan-200">
                {data.salarySpent}
                <span className="text-lg text-white/40"> / {data.salaryCap}</span>
              </p>
              <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white/45">kapitál</p>
              <div className="mx-auto mt-2 h-1.5 w-28 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-[#00B4FF]"
                  style={{ width: `${salaryPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-1 flex-col justify-end">
            <IceRinkShell
              className="border-cyan-400/35 shadow-[0_0_48px_rgba(0,180,255,0.15)]"
              iceMood="arena"
              noiseFilterId={noiseFilterId}
              scratchPatternId={scratchPatternId}
              transform="perspective(900px) rotateX(5deg) scale(0.94) translateZ(0)"
              transformOrigin="50% 42%"
              innerClassName="relative z-10 flex flex-col items-stretch px-3 pb-7 pt-10"
            >
              <div className="flex flex-wrap justify-center gap-2">
                {SLOTS_F.map((ix) => {
                  const p = slots[ix];
                  return p ? <PosterPlayerCard key={p.id} pick={p} positionLabel="Útočník" /> : null;
                })}
              </div>
              <div className="mt-3 flex flex-wrap justify-center gap-3">
                {SLOTS_D.map((ix) => {
                  const p = slots[ix];
                  return p ? <PosterPlayerCard key={p.id} pick={p} positionLabel="Obránce" /> : null;
                })}
              </div>
              <div className="mt-3 flex justify-center">
                {slots[SLOT_G] ? (
                  <PosterPlayerCard pick={slots[SLOT_G]!} positionLabel="Brankář" />
                ) : null}
              </div>
            </IceRinkShell>
          </div>

          <p className="mt-4 text-center font-display text-[10px] font-bold uppercase tracking-[0.28em] text-white/35">
            hokejlineup.cz
          </p>
        </div>
      </div>
    );
  },
);
