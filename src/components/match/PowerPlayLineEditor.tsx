"use client";

import { useId, type ReactNode } from "react";
import { IceRinkShell } from "@/components/shared/IceRinkShell";
import {
  ensurePowerPlayLineup,
  POWER_PLAY_ROLE_LABELS,
  POWER_PLAY_UNIT_LABELS,
  setPowerPlaySlot,
} from "@/lib/powerPlayLineup";
import type { LineupStructure, PowerPlayRole, PowerPlayUnit } from "@/types";

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
    onClear?: () => void;
  }) => ReactNode;
};

function PowerPlayUnitRink({
  unitIndex,
  unit,
  readOnly,
  renderSlot,
  onClear,
}: {
  unitIndex: 0 | 1;
  unit: PowerPlayUnit;
  readOnly?: boolean;
  renderSlot: PowerPlayLineEditorProps["renderSlot"];
  onClear: (role: PowerPlayRole) => void;
}) {
  const uid = useId().replace(/:/g, "");
  const slot = (role: PowerPlayRole, label: string) =>
    renderSlot({
      playerId: unit[role],
      label,
      type: "powerPlay",
      lineIndex: unitIndex,
      role,
      dndId: `slot-pp-${unitIndex}-${role}`,
      onClear: unit[role] && !readOnly ? () => onClear(role) : undefined,
    });

  return (
    <IceRinkShell
      className="border-cyan-400/25 shadow-[0_0_32px_rgba(0,180,255,0.1)]"
      iceMood="arena"
      noiseFilterId={`${uid}-noise`}
      scratchPatternId={`${uid}-ice`}
      innerClassName="relative z-10 flex flex-col items-center gap-3 px-2 pb-4 pt-6 sm:gap-4 sm:px-3 sm:pt-7"
    >
      <div className="flex w-full max-w-[11rem] justify-center sm:max-w-[12.5rem]">{slot("point", "MOD")}</div>
      <div className="grid w-full max-w-[min(100%,22rem)] grid-cols-3 items-start gap-2 sm:gap-3">
        {slot("left", "VLEVO")}
        {slot("bumper", "STŘED")}
        {slot("right", "VPRAVO")}
      </div>
      <div className="flex w-full max-w-[11rem] justify-center sm:max-w-[12.5rem]">{slot("netFront", "BRANKA")}</div>
      <p className="text-center text-[9px] font-semibold uppercase tracking-[0.14em] text-white/40">
        1 · 3 · 1 — útok směrem dolů
      </p>
    </IceRinkShell>
  );
}

export function PowerPlayLineEditor({ lineup, onLineupChange, readOnly, renderSlot }: PowerPlayLineEditorProps) {
  const base = ensurePowerPlayLineup(lineup);
  const units = base.powerPlay!.units;

  const clear = (unitIndex: 0 | 1, role: PowerPlayRole) => {
    onLineupChange(setPowerPlaySlot(base, unitIndex, role, null));
  };

  return (
    <div className="space-y-5 border-t border-white/[0.08] pt-6">
      <div>
        <h3 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-white sm:text-[15px]">
          Přesilovkové pětky
        </h3>
        <p className="mt-1.5 text-[11px] leading-relaxed text-white/50">
          2×5 hráčů, rozestavení 1:3:1 ({POWER_PLAY_ROLE_LABELS.point.toLowerCase()}, tři ve střele,{" "}
          {POWER_PLAY_ROLE_LABELS.bumper.toLowerCase()}, {POWER_PLAY_ROLE_LABELS.netFront.toLowerCase()}). Export na
          plakát 3:4 s ledem.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {([0, 1] as const).map((unitIndex) => (
          <div key={unitIndex} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 sm:p-4">
            <p className="mb-3 text-center font-display text-xs font-bold uppercase tracking-[0.22em] text-[#f1c40f]/90">
              {POWER_PLAY_UNIT_LABELS[unitIndex]}
            </p>
            <PowerPlayUnitRink
              unitIndex={unitIndex}
              unit={units[unitIndex]}
              readOnly={readOnly}
              renderSlot={renderSlot}
              onClear={(role) => clear(unitIndex, role)}
            />
            <ul className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[9px] text-white/45">
              {PP_ROLES.map((r) => (
                <li key={r}>
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
