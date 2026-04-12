"use client";

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
import { Nhl25SharePoster } from "@/components/Nhl25SharePoster";
import { SaveShareModal } from "@/components/SaveShareModal";
import { AppLoadingScreen } from "@/components/AppLoadingScreen";
import { SiteBackground } from "@/components/site/SiteBackground";
import { SiteHeader } from "@/components/site/SiteHeader";
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
  const shareCaptureRef = useRef<HTMLDivElement>(null);
  /** Aktualizuje datum ve footeru plakátu těsně před html-to-image capture (ref zůstane na stejném uzlu). */
  const [sharePosterFooterIso, setSharePosterFooterIso] = useState<string | null>(null);
  const [siteOrigin, setSiteOrigin] = useState("");
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
      lineup.defensePairs
        .slice(0, 3)
        .reduce((s, p) => s + (p.lb ? 1 : 0) + (p.rb ? 1 : 0), 0) +
      (lineup.defensePairs[3].lb ? 1 : 0) +
      (lineup.defensePairs[3].rb ? 1 : 0) +
      lineup.extraDefensemen.length,
    F:
      lineup.forwardLines.reduce(
        (s, l) => s + (l.lw ? 1 : 0) + (l.c ? 1 : 0) + (l.rw ? 1 : 0) + (l.x ? 1 : 0),
        0
      ) +
      (lineup.extraForwards[0] ? 1 : 0),
  };

  useEffect(() => {
    setSiteOrigin(typeof window !== "undefined" ? window.location.origin : "");
  }, []);

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
        (role === "lw" || role === "c" || role === "rw" || role === "x")
      ) {
        if (role === "x" && lineIndex !== 3) return;
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
        ((lineIndex < 3 && (role === "lb" || role === "rb")) || (lineIndex === 3 && role === "lb"))
      ) {
        const next = { ...lineup };
        if (lineIndex === 3) {
          next.defensePairs = [...next.defensePairs] as LineupStructure["defensePairs"];
          next.defensePairs[3] = { lb: player.id, rb: null };
          next.extraDefensemen = [];
        } else {
          const pair = { ...next.defensePairs[lineIndex], [role]: player.id };
          next.defensePairs = [...next.defensePairs] as LineupStructure["defensePairs"];
          next.defensePairs[lineIndex] = pair;
        }
        setLineup(next);
        setSelectedSlot(null);
      } else if (type === "extraForward" && player.position === "F" && lineIndex === 0) {
        const next = assignPlayerToTarget(lineup, player, {
          type: "extraForward",
          slotIndex: 0,
        });
        if (next) setLineup(next);
        setSelectedSlot(null);
      } else if (type === "extraDefenseman" && player.position === "D" && lineIndex !== undefined) {
        const next = assignPlayerToTarget(lineup, player, {
          type: "extraDefenseman",
          slotIndex: 0,
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
      if (
        type === "forward" &&
        (role === "lw" || role === "c" || role === "rw" || role === "x")
      ) {
        if (role === "x" && lineIndex !== 3) return false;
        return player.position === "F";
      }
      if (type === "defense" && lineIndex === 3 && role === "lb") return player.position === "D";
      if (type === "defense" && (role === "lb" || role === "rb"))
        return player.position === "D" && lineIndex !== undefined && lineIndex < 3;
      if (type === "extraForward") return player.position === "F";
      if (type === "extraDefenseman") return player.position === "D";
      return false;
    },
    [selectedSlot, usedIds]
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
      toast.error("V databázi není dost hráčů (potřeba 3G + 7D + 14F).");
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
    "3 brankáři · 7 obránců · 14 útočníků · celkem max. 24 hráčů";

  const forcedPoolPosition: Position | null = selectedSlot
    ? selectedSlot.type === "goalie"
      ? "G"
      : selectedSlot.type === "defense" || selectedSlot.type === "extraDefenseman"
        ? "D"
        : "F"
    : null;

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="sestava-page-ambient min-h-screen pb-[13rem] text-white sm:pb-44 lg:pb-36">
        <SiteBackground />

        <div className="sticky top-0 z-40">
          <SiteHeader />
          <SestavaHero filled={filled} subtitleCounts={subtitleCounts} />
        </div>

        <div className="relative z-10 mx-auto max-w-[90rem] px-4 py-8 lg:py-10">
          {!isComplete && (
            <div className="mb-8 rounded-2xl border border-[#003087]/35 bg-gradient-to-r from-[#003087]/15 via-[#0a0e17]/80 to-[#c8102e]/10 px-5 py-4 text-center text-sm text-white/85 shadow-[0_0_40px_rgba(0,48,135,0.12)]">
              {remaining > 0 ? (
                <>
                  Ještě <span className="font-semibold text-sky-200">{remaining}</span>{" "}
                  {remaining === 1 ? "místo" : remaining < 5 ? "místa" : "míst"} do plné nominace.
                </>
              ) : (
                <>Doplň poslední detaily — nominace skoro hotová.</>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,12fr)_minmax(0,13fr)] lg:gap-10 xl:gap-12">
            <section className="min-w-0">
              <div className="rounded-2xl border border-white/[0.09] bg-[#0a0e17]/55 p-5 shadow-[0_0_0_1px_rgba(0,48,135,0.14),0_28px_80px_rgba(0,0,0,0.45)] backdrop-blur-md sm:p-6">
                  <div className="mb-6">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#ff5a6e] drop-shadow-[0_0_12px_rgba(200,16,46,0.35)]">
                      Pool
                    </p>
                    <h2 className="font-display text-2xl font-bold tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] md:text-3xl">
                      Dostupní hráči
                    </h2>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-white/72">
                      Klik na kartu = rychlé doplnění · úchop = přetáhni na konkrétní slot vpravo
                    </p>
                  </div>
                </div>
                <PlayerPoolPanel
                  players={players}
                  usedIds={usedIds}
                  counts={counts}
                  onAddPlayer={handleAddFromPool}
                  onPreview={setPreviewPlayer}
                  forcedPosition={forcedPoolPosition}
                />
              </div>
            </section>

            <section className="min-w-0">
              <div className="lg:sticky lg:top-72 lg:max-h-[calc(100vh-19rem)] lg:overflow-y-auto lg:pb-2 lg:pl-1 lg:self-start">
                <div className="nhl25-moje-sestava-panel rounded-2xl p-5 sm:p-6">
                  <div className="nhl25-moje-sestava-accent mb-5" aria-hidden />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#003087]/80">
                    Lineup builder
                  </p>
                  <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                    Moje sestava
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {selectedSlot
                      ? "Vybraný slot — vlevo se zúží pozice, nebo přetáhni hráče přímo sem."
                      : "Klikni na slot pro cílený výběr, nebo doplň hráče z poolu vlevo."}
                  </p>
                  <div className="mt-7">
                    <LineBuilder
                      lineup={lineup}
                      players={players}
                      captainId={captainId}
                      onLineupChange={setLineup}
                      onCaptainChange={setCaptainId}
                      selectedSlot={selectedSlot}
                      onSelectSlot={setSelectedSlot}
                      enableDnd
                      layoutVariant="nhl25"
                    />
                  </div>
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
              {isAuthenticated ? "Uložit a sdílet" : "Složit nominaci"}
            </button>
          </div>
        </div>

        <FloatingSestavaBar
          onShare={() => setModalOpen(true)}
          onRandom={handleRandom}
          onReset={handleReset}
          shareDisabled={!isComplete}
          shareLabel={isAuthenticated ? "Uložit a sdílet" : "Složit nominaci"}
        />

        <div
          className="pointer-events-none fixed left-0 top-0 z-[-1] w-[920px] max-w-[920px] -translate-x-full"
          aria-hidden
        >
          <Nhl25SharePoster
            ref={shareCaptureRef}
            players={players}
            lineup={lineup}
            captainId={captainId}
            assistantIds={lineup.assistantIds ?? []}
            siteUrl={siteOrigin}
            footerInstantIso={sharePosterFooterIso}
          />
        </div>

        <SaveShareModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          captureRef={shareCaptureRef}
          onBeforeCapture={() => setSharePosterFooterIso(new Date().toISOString())}
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
