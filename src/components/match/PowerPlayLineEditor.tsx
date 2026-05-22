"use client";

import { useId, type ReactNode } from "react";
import { IceRinkShell } from "@/components/shared/IceRinkShell";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  ensurePowerPlayLineup,
  POWER_PLAY_ROLE_LABELS,
  POWER_PLAY_UNIT_LABELS,
  setPowerPlaySlot,
} from "@/lib/powerPlayLineup";
import type { LineupStructure, PowerPlayRole, PowerPlayUnit } from "@/types";
import type { LineupJerseySize } from "@/components/sestava/LineupJerseyCard";

const PP_ROLES: PowerPlayRole[] = ["point", "left", "bumper", "right", "netFront"];

type PowerPlayLineEditorProps = {
  lineup: LineupStructure;
  onLineupChange: (lineup: LineupStructure) => void;
  readOnly?: boolean;
  renderSlot: (props: {
    playerId: string | null;
    label: string;
    type: string;
    lineIndex: number;
    role: string;
    dndId: string;
    jerseySize?: LineupJerseySize;
    onClear?: () => void;
  }) => ReactNode;
};

function PowerPlayUnitRink({
  unitIndex,
  unit,
  readOnly,
  renderSlot,
  onClear,
  isNarrow,
}: {
  unitIndex: 0 | 1;
  unit: PowerPlayUnit;
  readOnly?: boolean;
  renderSlot: PowerPlayLineEditorProps["renderSlot"];
  onClear: (role: PowerPlayRole) => void;
  isNarrow: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const rinkTransform = isNarrow
    ? "perspective(640px) rotateX(2deg) scale(1) translateZ(0)"
    : "perspective(920px) rotateX(5deg) scale(0.94) translateZ(0)";

  const slot = (role: PowerPlayRole, label: string) =>
    renderSlot({
      playerId: unit[role],
      label,
      type: "powerPlay",
      lineIndex: unitIndex,
      role,
      dndId: `slot-pp-${unitIndex}-${role}`,
      jerseySize: "compact",
      onClear: unit[role] && !readOnly ? () => onClear(role) : undefined,
    });

  return (
    <div className="mx-auto w-full max-w-[min(100%,24rem)] touch-manipulation sm:max-w-[26rem]">
      <IceRinkShell
        className="border-cyan-400/25 shadow-[0_0_24px_rgba(0,180,255,0.08)] sm:shadow-[0_0_32px_rgba(0,180,255,0.1)]"
        iceMood="arena"
        noiseFilterId={`${uid}-noise`}
        scratchPatternId={`${uid}-ice`}
        transform={rinkTransform}
        innerClassName="relative z-10 flex flex-col items-center gap-2 px-1 pb-3 pt-4 max-[380px]:gap-1.5 sm:gap-4 sm:px-3 sm:pb-4 sm:pt-7"
      >
        <div className="flex w-full max-w-[5.5rem] justify-center sm:max-w-[6.75rem]">{slot("point", "MOD")}</div>
        <div className="grid w-full min-w-0 grid-cols-3 items-start gap-1 px-0.5 sm:gap-3 sm:px-0">
          {slot("left", "VLEVO")}
          {slot("bumper", "STŘ")}
          {slot("right", "VPRAVO")}
        </div>
        <div className="flex w-full max-w-[5.5rem] justify-center sm:max-w-[6.75rem]">{slot("netFront", "BR")}</div>
        <p className="hidden text-center text-[9px] font-semibold uppercase tracking-[0.14em] text-white/40 sm:block">
          1 · 3 · 1 — útok směrem dolů
        </p>
      </IceRinkShell>
    </div>
  );
}

export function PowerPlayLineEditor({ lineup, onLineupChange, readOnly, renderSlot }: PowerPlayLineEditorProps) {
  const isNarrow = useMediaQuery("(max-width: 639px)");
  const base = ensurePowerPlayLineup(lineup);
  const units = base.powerPlay!.units;

  const clear = (unitIndex: 0 | 1, role: PowerPlayRole) => {
    onLineupChange(setPowerPlaySlot(base, unitIndex, role, null));
  };

  return (
    <div className="space-y-4 border-t border-white/[0.08] pt-5 sm:space-y-5 sm:pt-6">
      <div>
        <h3 className="font-display text-xs font-bold uppercase tracking-[0.18em] text-white sm:text-sm sm:tracking-[0.2em]">
          Přesilovkové pětky
        </h3>
        <p className="mt-1 text-[10px] leading-snug text-white/50 sm:mt-1.5 sm:text-[11px] sm:leading-relaxed">
          <span className="sm:hidden">2×5 · 1:3:1 na ledě. Klepni na slot, vyber hráče zleva.</span>
          <span className="hidden sm:inline">
            2×5 hráčů, rozestavení 1:3:1 ({POWER_PLAY_ROLE_LABELS.point.toLowerCase()}, tři ve střele,{" "}
            {POWER_PLAY_ROLE_LABELS.bumper.toLowerCase()}, {POWER_PLAY_ROLE_LABELS.netFront.toLowerCase()}). Export na
            plakát 3:4 s ledem.
          </span>
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
        {([0, 1] as const).map((unitIndex) => (
          <div
            key={unitIndex}
            className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-2.5 sm:p-4"
          >
            <p className="mb-2 text-center font-display text-[11px] font-bold uppercase tracking-[0.2em] text-[#f1c40f]/90 sm:mb-3 sm:text-xs sm:tracking-[0.22em]">
              {POWER_PLAY_UNIT_LABELS[unitIndex]}
            </p>
            <PowerPlayUnitRink
              unitIndex={unitIndex}
              unit={units[unitIndex]}
              readOnly={readOnly}
              renderSlot={renderSlot}
              onClear={(role) => clear(unitIndex, role)}
              isNarrow={isNarrow}
            />
            <ul className="mt-2 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[8px] text-white/45 sm:mt-3 sm:flex sm:flex-wrap sm:justify-center sm:gap-x-3 sm:text-[9px]">
              {PP_ROLES.map((r) => (
                <li key={r} className="text-center sm:text-left">
                  <span className="font-semibold text-white/55">{POWER_PLAY_ROLE_LABELS[r]}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
