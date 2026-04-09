"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { LineBuilder } from "@/components/LineBuilder";
import { NominationPoster } from "@/components/NominationPoster";
import { SaveShareModal } from "@/components/SaveShareModal";
import { AppLoadingScreen } from "@/components/AppLoadingScreen";
import { PlayerPoolPanel } from "@/components/sestava/PlayerPoolPanel";
import { SestavaHero } from "@/components/sestava/SestavaHero";
import { FloatingSestavaBar } from "@/components/sestava/FloatingSestavaBar";
import { PlayerPreviewModal } from "@/components/sestava/PlayerPreviewModal";
import { lineupToPlayers, isLineupComplete } from "@/lib/lineupUtils";
import {
  tryAutoAssignPlayer,
  assignPlayerToTarget,
  buildRandomLineup,
} from "@/lib/lineupAssign";
import type { Position } from "@/types";
import { parseDroppableId } from "@/lib/dndSlotIds";
import type { Player } from "@/types";
import type { LineupStructure } from "@/types";
import { EMPTY_LINEUP, TOTAL_PLAYERS } from "@/types";

export function NominationBuilderPage() {
  const { status: authStatus } = useSession();
  const isAuthenticated = authStatus === "authenticated";
  const [players, setPlayers] = useState<Player[]>([]);
  const [lineup, setLineup] = useState<LineupStructure>(EMPTY_LINEUP);
  const [captainId, setCaptainId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{
    type: string;
    lineIndex?: number;
    role?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewPlayer, setPreviewPlayer] = useState<Player | null>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const wasCompleteRef = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 12 },
    })
  );

  const selectedPlayers = lineupToPlayers(lineup, players);
  const usedIds = new Set(selectedPlayers.map((p) => p.id));
  const isComplete = isLineupComplete(lineup);
  const filled = selectedPlayers.length;
  const remaining = TOTAL_PLAYERS - filled;

  const counts = {
    G: lineup.goalies.filter(Boolean).length,
    D:
      lineup.defensePairs.reduce(
        (s, p) => s + (p.lb ? 1 : 0) + (p.rb ? 1 : 0),
        0
      ) + lineup.extraDefensemen.length,
    F:
      lineup.forwardLines.reduce(
        (s, l) => s + (l.lw ? 1 : 0) + (l.c ? 1 : 0) + (l.rw ? 1 : 0),
        0
      ) + lineup.extraForwards.length,
  };

  useEffect(() => {
    fetch("/api/players")
      .then((res) => res.json())
      .then((data) => setPlayers(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (isComplete && !wasCompleteRef.current) {
      confetti({
        particleCount: 100,
        spread: 65,
        origin: { y: 0.65 },
        colors: ["#c8102e", "#003087", "#ffffff", "#d4af37"],
      });
      toast.success("Plná nominace — můžeš sdílet!", { duration: 5000 });
    }
    wasCompleteRef.current = isComplete;
  }, [isComplete]);

  const assignPlayerToSlot = useCallback(
    (player: Player) => {
      if (!selectedSlot) return;

      const { type, lineIndex, role } = selectedSlot;

      if (type === "goalie" && player.position === "G" && lineIndex !== undefined) {
        const next = { ...lineup };
        next.goalies = [...next.goalies];
        next.goalies[lineIndex] = player.id;
        setLineup(next);
        setSelectedSlot(null);
      } else if (
        type === "forward" &&
        player.position === "F" &&
        lineIndex !== undefined &&
        role &&
        (role === "lw" || role === "c" || role === "rw")
      ) {
        const next = { ...lineup };
        const line = { ...next.forwardLines[lineIndex], [role]: player.id };
        next.forwardLines = [...next.forwardLines] as LineupStructure["forwardLines"];
        next.forwardLines[lineIndex] = line;
        setLineup(next);
        setSelectedSlot(null);
      } else if (
        type === "defense" &&
        player.position === "D" &&
        lineIndex !== undefined &&
        role &&
        (role === "lb" || role === "rb")
      ) {
        const next = { ...lineup };
        const pair = { ...next.defensePairs[lineIndex], [role]: player.id };
        next.defensePairs = [...next.defensePairs] as LineupStructure["defensePairs"];
        next.defensePairs[lineIndex] = pair;
        setLineup(next);
        setSelectedSlot(null);
      } else if (type === "extraForward" && player.position === "F" && lineIndex !== undefined) {
        const slotIndex = (lineIndex === 0 ? 0 : 1) as 0 | 1;
        const next = assignPlayerToTarget(lineup, player, {
          type: "extraForward",
          slotIndex,
        });
        if (next) setLineup(next);
        setSelectedSlot(null);
      }
    },
    [selectedSlot, lineup]
  );

  const canAssignPlayer = useCallback(
    (player: Player): boolean => {
      if (!selectedSlot || usedIds.has(player.id)) return false;
      const { type, lineIndex, role } = selectedSlot;
      if (type === "goalie") return player.position === "G";
      if (type === "forward" && (role === "lw" || role === "c" || role === "rw"))
        return player.position === "F";
      if (type === "defense" && (role === "lb" || role === "rb"))
        return player.position === "D";
      if (type === "extraForward") return player.position === "F";
      return false;
    },
    [selectedSlot, usedIds, lineup.extraForwards.length]
  );

  const handleAddFromPool = useCallback(
    (player: Player) => {
      if (selectedSlot) {
        if (!canAssignPlayer(player)) {
          toast.error("Tenhle hráč nejde do vybraného slotu.");
          return;
        }
        assignPlayerToSlot(player);
        toast.success(`${player.name} je ve sestavě`);
        return;
      }
      const next = tryAutoAssignPlayer(lineup, player);
      if (!next) {
        toast.error("Už není volné místo pro tuto pozici, nebo je hráč už v nominaci.");
        return;
      }
      setLineup(next);
      toast.success(`${player.name} přidán do nominace`);
    },
    [lineup, selectedSlot, canAssignPlayer, assignPlayerToSlot]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const overId = event.over?.id?.toString();
      const activeId = event.active.id.toString();
      if (!overId || !activeId.startsWith("drag-player-")) return;
      const pid = activeId.replace("drag-player-", "");
      const player = players.find((p) => p.id === pid);
      const target = parseDroppableId(overId);
      if (!player || !target) return;
      const next = assignPlayerToTarget(lineup, player, target);
      if (!next) {
        toast.error("Sem tohohle hráče nelze dát.");
        return;
      }
      setLineup(next);
      toast.success(`${player.name} → sestava`);
    },
    [lineup, players]
  );

  const handleRandom = useCallback(() => {
    const next = buildRandomLineup(players);
    if (!next) {
      toast.error("V databázi není dost hráčů (potřeba 3G + 8D + 14F).");
      return;
    }
    setLineup(next);
    setCaptainId(null);
    setSelectedSlot(null);
    toast.success("Náhodná nominace je hotová — uprav si ji, jak chceš.");
  }, [players]);

  const handleReset = useCallback(() => {
    setLineup(EMPTY_LINEUP);
    setCaptainId(null);
    setSelectedSlot(null);
    toast.message("Sestava byla resetována.");
  }, []);

  const handleSave = useCallback(async (): Promise<string | null> => {
    setSaving(true);
    try {
      const res = await fetch("/api/nominations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedPlayerIds: selectedPlayers.map((p) => p.id),
          captainId,
          lineupStructure: lineup,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chyba při ukládání");
      return data.id ?? null;
    } finally {
      setSaving(false);
    }
  }, [selectedPlayers, captainId, lineup]);

  if (loading) {
    return <AppLoadingScreen message="Načítám hráče…" />;
  }

  const subtitleCounts =
    "3 brankáři · 8 obránců · 14 útočníků · celkem max. 25 hráčů";

  const forcedPoolPosition: Position | null = selectedSlot
    ? selectedSlot.type === "goalie"
      ? "G"
      : selectedSlot.type === "defense"
        ? "D"
        : "F"
    : null;

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-[#0a0a0a] pb-36 text-white sestava-page">
        <div
          className="pointer-events-none fixed inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
          aria-hidden
        />

        <SestavaHero filled={filled} subtitleCounts={subtitleCounts} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 lg:py-8">
          {!isComplete && (
            <div className="mb-6 rounded-2xl border border-[#003087]/30 bg-[#003087]/10 px-4 py-3 text-center text-sm text-white/80">
              {remaining > 0 ? (
                <>
                  Ještě <span className="font-semibold text-[#d4af37]">{remaining}</span>{" "}
                  {remaining === 1 ? "místo" : remaining < 5 ? "místa" : "míst"} do plné nominace.
                </>
              ) : (
                <>Doplň poslední detaily — nominace skoro hotová.</>
              )}
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-5 lg:gap-10">
            <section className="lg:col-span-3">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl">
                    Dostupní hráči
                  </h2>
                  <p className="mt-1 text-sm text-white/45">
                    Klik = rychlé přidání · ikona úchopu = táhni na slot
                  </p>
                </div>
                <Link
                  href="/"
                  className="hidden text-sm text-white/40 hover:text-[#c8102e] sm:inline"
                >
                  Úvodní stránka
                </Link>
              </div>
              <PlayerPoolPanel
                players={players}
                usedIds={usedIds}
                counts={counts}
                onAddPlayer={handleAddFromPool}
                onPreview={setPreviewPlayer}
                forcedPosition={forcedPoolPosition}
              />
            </section>

            <section className="lg:col-span-2">
              <div className="mb-4 lg:sticky lg:top-[5.5rem] lg:self-start">
                <h2 className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl">
                  Moje sestava
                </h2>
                <p className="mt-1 text-sm text-white/45">
                  {selectedSlot
                    ? "Vybraný slot — vlevo uvidíš jen vhodné pozice, nebo přetáhni hráče sem."
                    : "Klikni na slot pro cílený výběr, nebo přidávej hráče zleva."}
                </p>
                <div className="mt-4">
                  <LineBuilder
                    lineup={lineup}
                    players={players}
                    captainId={captainId}
                    onLineupChange={setLineup}
                    onCaptainChange={setCaptainId}
                    selectedSlot={selectedSlot}
                    onSelectSlot={setSelectedSlot}
                    enableDnd
                  />
                </div>
              </div>
            </section>
          </div>

          <div className="mt-8 hidden justify-center lg:flex">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              disabled={!isComplete}
              className={`
                rounded-2xl px-10 py-4 font-display text-xl font-bold tracking-wide transition-all
                ${
                  isComplete
                    ? "bg-gradient-to-r from-[#c8102e] to-[#9e0c24] text-white shadow-xl shadow-[#c8102e]/25 hover:scale-[1.02]"
                    : "cursor-not-allowed bg-white/10 text-white/35"
                }
              `}
            >
              {isAuthenticated ? "Uložit / sdílet nominaci" : "Sdílet nominaci"}
            </button>
          </div>
        </div>

        <FloatingSestavaBar
          onShare={() => setModalOpen(true)}
          onRandom={handleRandom}
          onReset={handleReset}
          shareDisabled={!isComplete}
          shareLabel={isAuthenticated ? "Uložit / sdílet" : "Sdílet nominaci"}
        />

        <div className="fixed -left-[9999px] top-0 w-[430px]" aria-hidden="true">
          <NominationPoster
            ref={posterRef}
            players={selectedPlayers}
            captainId={captainId}
            lineup={lineup}
          />
        </div>

        <SaveShareModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          posterRef={posterRef}
          isAuthenticated={isAuthenticated}
          lineupStructure={lineup}
          captainId={captainId}
          onSave={handleSave}
          isSaving={saving}
        />

        <PlayerPreviewModal player={previewPlayer} onClose={() => setPreviewPlayer(null)} />
      </div>
    </DndContext>
  );
}
