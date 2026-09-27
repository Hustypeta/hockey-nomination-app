"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { FifaAppPage } from "@/components/fifa/FifaAppPage";
import { LineBuilder } from "@/components/LineBuilder";
import { PlayerPoolPanel } from "@/components/sestava/PlayerPoolPanel";
import { PlayerPreviewModal } from "@/components/sestava/PlayerPreviewModal";
import { SAMPLE_HISTORICAL_LINEUP_PUZZLES } from "@/lib/historical-lineup/samplePuzzles";
import { scoreStartingSix } from "@/lib/historical-lineup/scoring";
import {
  STARTING_SIX_DND,
  answerIdsFromPuzzle,
  emptyStartingSixLineup,
  guessFromLineup,
  isStartingSixComplete,
  playersFromPuzzle,
  tryAutoAssignStartingSix,
} from "@/lib/historical-lineup/startingSix";
import { HISTORICAL_LINEUP_SLOTS } from "@/lib/historical-lineup/types";
import {
  HISTORICAL_LINEUP_HEADLINE,
  HISTORICAL_LINEUP_SUBTITLE,
} from "@/lib/fifa/historicalLineup";
import {
  FIFA_EDITOR_SURFACE_CANVAS,
  FIFA_EDITOR_SURFACE_POOL,
} from "@/lib/fifa/fifaEditorClasses";
import { FIFA_BTN_PRIMARY, FIFA_BTN_SECONDARY, FIFA_KICKER, FIFA_LINK } from "@/lib/fifa/fifaUiClasses";
import { poolToSlotCollision } from "@/lib/dndCollision";
import { parseDroppableId } from "@/lib/dndSlotIds";
import { assignPlayerToTarget, removePlayerFromLineup, swapWithinLine } from "@/lib/lineupAssign";
import { initJerseyNameDisambiguation, jerseyNameForPlayer, withJerseyLastNames } from "@/lib/jerseyDisplayName";
import { MQ_LAYOUT_NARROW, useMediaQuery } from "@/hooks/useMediaQuery";
import type { LineupStructure, Player, Position } from "@/types";

function PoolRemoveDropZone({ children, className }: { children: ReactNode; className?: string }) {
  const { setNodeRef, isOver } = useDroppable({ id: "pool-remove" });
  return (
    <div
      ref={setNodeRef}
      className={`${className ?? ""} ${
        isOver ? "ring-2 ring-red-400/70 ring-offset-2 ring-offset-[var(--fifa-bg-base)]" : ""
      }`}
    >
      {children}
    </div>
  );
}

function formatMatchDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${Number(d)}. ${Number(m)}. ${y}`;
}

function puzzleYear(iso: string): string {
  return iso.slice(0, 4);
}

export function HistoricalLineupQuiz() {
  const isNarrowLayout = useMediaQuery(MQ_LAYOUT_NARROW);
  const enableDnd = !isNarrowLayout;
  const [puzzleId, setPuzzleId] = useState(SAMPLE_HISTORICAL_LINEUP_PUZZLES[0]!.id);
  const [lineup, setLineup] = useState<LineupStructure>(emptyStartingSixLineup);
  const [selectedSlot, setSelectedSlot] = useState<{
    type: string;
    lineIndex?: number;
    role?: string;
  } | null>(null);
  const [previewPlayer, setPreviewPlayer] = useState<Player | null>(null);
  const [poolDragPlayer, setPoolDragPlayer] = useState<Player | null>(null);
  const [revealed, setRevealed] = useState(false);

  const puzzle = useMemo(
    () => SAMPLE_HISTORICAL_LINEUP_PUZZLES.find((p) => p.id === puzzleId) ?? SAMPLE_HISTORICAL_LINEUP_PUZZLES[0]!,
    [puzzleId]
  );
  const players = useMemo(() => withJerseyLastNames(playersFromPuzzle(puzzle)), [puzzle]);
  const answer = useMemo(() => answerIdsFromPuzzle(puzzle), [puzzle]);
  const playerById = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);

  useEffect(() => {
    initJerseyNameDisambiguation(players);
  }, [players]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } })
  );

  const usedIds = useMemo(() => {
    if (revealed) return new Set(players.map((p) => p.id));
    const g = guessFromLineup(lineup);
    return new Set(HISTORICAL_LINEUP_SLOTS.map((slot) => g[slot]).filter((id): id is string => Boolean(id)));
  }, [lineup, players, revealed]);

  const counts = useMemo(() => {
    const g = guessFromLineup(lineup);
    return {
      G: g.G ? 1 : 0,
      D: (g.LB ? 1 : 0) + (g.RB ? 1 : 0),
      F: (g.LW ? 1 : 0) + (g.C ? 1 : 0) + (g.RW ? 1 : 0),
    };
  }, [lineup]);

  const complete = isStartingSixComplete(lineup);
  const score = revealed ? scoreStartingSix(guessFromLineup(lineup), answer) : null;

  const slotFeedback = useMemo(() => {
    if (!score) return undefined;
    const out: Record<string, "correct" | "wrong"> = {};
    for (const slot of HISTORICAL_LINEUP_SLOTS) {
      out[STARTING_SIX_DND[slot]] = score.bySlot[slot];
    }
    return out;
  }, [score]);

  const slotRevealHint = useMemo(() => {
    if (!score) return undefined;
    const out: Record<string, string> = {};
    for (const slot of HISTORICAL_LINEUP_SLOTS) {
      if (score.bySlot[slot] !== "wrong") continue;
      const correct = playerById.get(answer[slot]);
      if (!correct) continue;
      out[STARTING_SIX_DND[slot]] = `Správně: ${jerseyNameForPlayer(correct)}`;
    }
    return out;
  }, [score, answer, playerById]);

  const resetPuzzle = (nextId = puzzleId) => {
    setPuzzleId(nextId);
    setLineup(emptyStartingSixLineup());
    setSelectedSlot(null);
    setRevealed(false);
  };

  const forcedPoolPosition: Position | null = selectedSlot
    ? selectedSlot.type === "goalie"
      ? "G"
      : selectedSlot.type === "defense"
        ? "D"
        : "F"
    : null;

  const onAddFromPool = (player: Player) => {
    if (revealed) return;
    if (selectedSlot) {
      const target =
        selectedSlot.type === "goalie"
          ? parseDroppableId("slot-goalie-0")
          : selectedSlot.type === "defense" && selectedSlot.role
            ? parseDroppableId(`slot-def-0-${selectedSlot.role}`)
            : selectedSlot.type === "forward" && selectedSlot.role
              ? parseDroppableId(`slot-fwd-0-${selectedSlot.role}`)
              : null;
      if (target) {
        const next = assignPlayerToTarget(lineup, player, target, { mode: "match" });
        if (next) setLineup(next);
      }
      if (!isNarrowLayout) setSelectedSlot(null);
      return;
    }
    const next = tryAutoAssignStartingSix(lineup, player);
    if (!next) {
      toast.error("Nejdřív klepni na volný slot, nebo je pozice už plná.");
      return;
    }
    setLineup(next);
  };

  const handleDragStart = (e: DragStartEvent) => {
    if (revealed) return;
    const id = e.active.id.toString();
    if (id.startsWith("drag-player-")) {
      const pid = id.replace("drag-player-", "");
      setPoolDragPlayer(players.find((p) => p.id === pid) ?? null);
    } else if (id.startsWith("move-")) {
      setPoolDragPlayer((e.active.data.current?.player as Player | undefined) ?? null);
    }
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setPoolDragPlayer(null);
    if (revealed) return;
    const overId = e.over?.id?.toString();
    const activeId = e.active.id.toString();
    if (!overId) return;

    if (activeId.startsWith("move-")) {
      const movedPlayer = (e.active.data.current?.player as Player | undefined) ?? null;
      if (overId === "pool-remove") {
        if (movedPlayer) setLineup(removePlayerFromLineup(lineup, movedPlayer.id));
        return;
      }
      const fromId = (e.active.data.current?.fromSlotId as string | undefined) ?? null;
      if (!fromId) return;
      const from = parseDroppableId(fromId);
      const to = parseDroppableId(overId);
      if (!from || !to) return;
      const next = swapWithinLine(lineup, from, to);
      if (next) setLineup(next);
      return;
    }

    if (!activeId.startsWith("drag-player-")) return;
    const pid = activeId.replace("drag-player-", "");
    const player = players.find((p) => p.id === pid);
    const target = parseDroppableId(overId);
    if (!player || !target) return;
    const next = assignPlayerToTarget(lineup, player, target, { mode: "match" });
    if (next) setLineup(next);
  };

  const handleSubmit = () => {
    if (!complete) {
      toast.error("Doplň všech 6 slotů — 3 útočníky, 2 obránce a gólmana.");
      return;
    }
    setSelectedSlot(null);
    setRevealed(true);
  };

  const puzzleLabel = [puzzle.event, puzzle.round, puzzle.opponent].filter(Boolean).join(" · ");

  const poolPanel = (
    <PlayerPoolPanel
      players={players}
      usedIds={usedIds}
      counts={counts}
      onAddPlayer={onAddFromPool}
      onPreview={setPreviewPlayer}
      enableDnd={enableDnd && !revealed}
      forcedPosition={forcedPoolPosition}
      onClearSelectedSlot={() => setSelectedSlot(null)}
      simplePickList
      uiVariant="fifa"
      gridColumns={isNarrowLayout ? 3 : 2}
      compactInline={isNarrowLayout}
      hidePickRate
      emptyHint="Zkušební pool kvízu je prázdný."
      assignableFilter={
        selectedSlot
          ? (p) =>
              selectedSlot.type === "goalie"
                ? p.position === "G"
                : selectedSlot.type === "defense"
                  ? p.position === "D"
                  : p.position === "F"
          : undefined
      }
    />
  );

  const content = (
    <FifaAppPage className="!p-0" fillMobile>
      <div
        className={`fifa-historical-quiz flex min-h-0 flex-1 flex-col max-lg-device:px-0 px-3 pt-0 text-white lg-device:px-4 ${
          isNarrowLayout
            ? "fifa-editor-match-page--mobile max-lg-device:overflow-hidden"
            : "lg-device:pb-[4.25rem]"
        }`}
      >
        <header className="flex shrink-0 flex-col gap-1.5 pb-1.5 max-lg-device:px-3 lg-device:gap-2 lg-device:pb-2">
          <Link href="/souteze" className={`inline-flex items-center gap-1 text-xs font-semibold lg:text-sm ${FIFA_LINK}`}>
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Zpět k soutěžím
          </Link>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className={FIFA_KICKER}>Zkušební verze</p>
              <h1 className="font-display text-lg font-bold leading-tight text-[var(--fifa-text)] lg:text-2xl">
                {HISTORICAL_LINEUP_HEADLINE}
              </h1>
              <p className="mt-0.5 text-xs text-[var(--fifa-text-secondary)] lg:text-sm">
                {puzzleYear(puzzle.matchDate)} · {puzzleLabel}
              </p>
              <p className="mt-1 hidden text-[11px] leading-snug text-[var(--fifa-text-muted)] lg-device:block">
                Hádej startovní šestku. Boduje se přesný slot. Data jsou zkušební — Excel napojíme později.
              </p>
            </div>
            <label className="flex shrink-0 flex-col gap-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--fifa-text-muted)]">
              Zkušební zápas
              <select
                value={puzzleId}
                onChange={(e) => resetPuzzle(e.target.value)}
                className="rounded-[var(--fifa-radius-sm)] border border-[var(--fifa-border)] bg-[var(--fifa-bg-base)] px-3 py-2 text-sm font-semibold normal-case tracking-normal text-[var(--fifa-text)]"
              >
                {SAMPLE_HISTORICAL_LINEUP_PUZZLES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.day}. {p.event} · {p.opponent}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </header>

        <div
          className={`grid min-h-0 flex-1 grid-cols-1 gap-2 lg-device:grid-cols-[minmax(0,9fr)_minmax(0,16fr)] lg-device:gap-3 ${
            isNarrowLayout ? "max-lg-device:overflow-hidden" : ""
          }`}
        >
          {!isNarrowLayout ? (
            <section className="hidden min-h-0 min-w-0 lg-device:flex lg-device:flex-col">
              <PoolRemoveDropZone className={`${FIFA_EDITOR_SURFACE_POOL} flex min-h-0 flex-1 flex-col overflow-hidden p-2`}>
                {poolPanel}
              </PoolRemoveDropZone>
            </section>
          ) : null}

          <section
            className={`flex min-h-0 min-w-0 flex-1 flex-col ${
              isNarrowLayout ? "fifa-editor-mobile-split max-lg-device:overflow-hidden" : ""
            }`}
          >
            <div
              className={`${FIFA_EDITOR_SURFACE_CANVAS}${
                isNarrowLayout ? " fifa-editor-surface--canvas-inline-pool" : ""
              } flex min-h-0 flex-col overflow-hidden p-0 ${isNarrowLayout ? "max-lg-device:min-h-0 max-lg-device:flex-1" : "flex-1"}`}
            >
              <LineBuilder
                mode="match"
                uiVariant="fifa"
                startingSix
                lineup={lineup}
                players={players}
                captainId={null}
                onLineupChange={revealed ? () => {} : setLineup}
                onCaptainChange={() => {}}
                selectedSlot={revealed ? null : selectedSlot}
                onSelectSlot={revealed ? () => {} : setSelectedSlot}
                enableDnd={enableDnd && !revealed}
                readOnly={revealed}
                matchDefenseCount={6}
                slotFeedback={slotFeedback}
                slotRevealHint={slotRevealHint}
              />
            </div>

            {isNarrowLayout ? (
              <PoolRemoveDropZone
                className={`${FIFA_EDITOR_SURFACE_POOL} fifa-editor-mobile-pool mt-0 flex min-h-0 flex-col overflow-hidden lg-device:hidden`}
              >
                {!selectedSlot && !revealed ? (
                  <p className="fifa-editor-mobile-pool__intro shrink-0">Klepni na slot na ledě, pak vyber hráče.</p>
                ) : null}
                {poolPanel}
              </PoolRemoveDropZone>
            ) : null}
          </section>
        </div>

        <div className="flex shrink-0 flex-col gap-1.5 border-t border-[var(--fifa-border)] bg-[var(--fifa-bg-base)] px-3 py-2 max-lg-device:pb-[calc(0.6rem+env(safe-area-inset-bottom,0px))] lg-device:gap-2 lg-device:px-0 lg-device:py-2.5">
          {score ? (
            <p className="text-center text-sm font-semibold text-[var(--fifa-text)]">
              {score.points} / {score.max} správných slotů
              <span className="mt-0.5 block text-[11px] font-medium text-[var(--fifa-text-muted)]">
                {formatMatchDate(puzzle.matchDate)} · {HISTORICAL_LINEUP_SUBTITLE}
              </span>
            </p>
          ) : (
            <p className="text-center text-[11px] text-[var(--fifa-text-muted)]">
              {complete ? "Šestka je kompletní — můžeš odeslat tip." : "Doplň 1. řadu, 1. pár a gólmana."}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {revealed ? (
              <>
                <button type="button" className={FIFA_BTN_SECONDARY} onClick={() => resetPuzzle(puzzleId)}>
                  Zkusit znovu
                </button>
                {SAMPLE_HISTORICAL_LINEUP_PUZZLES.length > 1 ? (
                  <button
                    type="button"
                    className={FIFA_BTN_PRIMARY}
                    onClick={() => {
                      const idx = SAMPLE_HISTORICAL_LINEUP_PUZZLES.findIndex((p) => p.id === puzzleId);
                      const next = SAMPLE_HISTORICAL_LINEUP_PUZZLES[(idx + 1) % SAMPLE_HISTORICAL_LINEUP_PUZZLES.length]!;
                      resetPuzzle(next.id);
                    }}
                  >
                    Další zápas
                  </button>
                ) : null}
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={FIFA_BTN_SECONDARY}
                  onClick={() => {
                    setLineup(emptyStartingSixLineup());
                    setSelectedSlot(null);
                  }}
                >
                  Vymazat
                </button>
                <button type="button" className={FIFA_BTN_PRIMARY} onClick={handleSubmit} disabled={!complete}>
                  Odeslat tip
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {poolDragPlayer ? (
          <div className="pointer-events-none flex max-w-[20rem] items-center gap-3 rounded-2xl border border-white/15 bg-black/80 px-4 py-3">
            <span className="font-bold">{poolDragPlayer.name}</span>
          </div>
        ) : null}
      </DragOverlay>

      <PlayerPreviewModal player={previewPlayer} onClose={() => setPreviewPlayer(null)} />
    </FifaAppPage>
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={poolToSlotCollision}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setPoolDragPlayer(null)}
    >
      {content}
    </DndContext>
  );
}
