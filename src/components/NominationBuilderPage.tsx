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
import { SestavaAmbientBackground } from "@/components/sestava/SestavaAmbientBackground";
import { SiteHeader } from "@/components/site/SiteHeader";
import { PlayerPoolPanel } from "@/components/sestava/PlayerPoolPanel";
import { SestavaHero } from "@/components/sestava/SestavaHero";
import { FloatingSestavaBar } from "@/components/sestava/FloatingSestavaBar";
import { PlayerPreviewModal } from "@/components/sestava/PlayerPreviewModal";
import { lineupToPlayers, isLineupComplete } from "@/lib/lineupUtils";
import { useContestStats } from "@/hooks/useContestStats";
import type { ContestTimeBonusPercent } from "@/lib/contestTimeBonus";
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
  const contestStats = useContestStats();

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
      if (type === "extraDefenseman")
        return player.position === "D" && !!lineup.defensePairs[3].lb;
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
    if (authStatus !== "authenticated") return null;
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
      if (!res.ok) {
        toast.error(data.error || "Chyba při ukládání");
        return null;
      }
      const bp = data.timeBonusPercent as number | undefined;
      if (typeof bp === "number" && bp > 0) {
        toast.success(`Nominace uložena — časový bonus +${bp} % k bodům.`);
      } else {
        toast.success("Nominace uložena.");
      }
      return data.id ?? null;
    } catch {
      toast.error("Chyba při ukládání — zkus to znovu.");
      return null;
    } finally {
      setSaving(false);
    }
  }, [authStatus, selectedPlayers, captainId, lineup]);

  if (loading) {
    return <AppLoadingScreen message="Načítám hráče…" />;
  }

  const subtitleCounts =
    "Základ 20+2 (bruslaři + 2 G) · 3 náhradníci · 25 hráčů celkem — soupiska MS";

  const bonusPercent = [0, 10, 25, 40].includes(contestStats.contestTimeBonusPercent)
    ? (contestStats.contestTimeBonusPercent as ContestTimeBonusPercent)
    : (0 as ContestTimeBonusPercent);

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
        <SestavaAmbientBackground />

        <div className="sticky top-0 z-40">
          <SiteHeader />
          <SestavaHero
            filled={filled}
            subtitleCounts={subtitleCounts}
            contestTimeBonusPercent={bonusPercent}
            contestSubmissionOpen={contestStats.contestSubmissionOpen}
            nominationCount={contestStats.nominationCount}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-[90rem] px-3 py-4 sm:px-4 sm:py-5 lg:px-6 lg:py-6">
          {!isComplete && (
            <div className="mb-4 rounded-xl border border-[#003087]/40 bg-gradient-to-r from-[#003087]/20 via-[#0f172a]/90 to-[#c8102e]/15 px-4 py-2.5 text-center text-xs text-slate-100 shadow-[0_0_32px_rgba(0,48,135,0.15)] sm:text-sm">
              {remaining > 0 ? (
                <>
                  Ještě <span className="font-semibold text-[#f1c40f]">{remaining}</span>{" "}
                  {remaining === 1 ? "místo" : remaining < 5 ? "místa" : "míst"} do plné nominace.
                </>
              ) : (
                <>Doplň poslední detaily — nominace skoro hotová.</>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,10fr)_minmax(0,14fr)] lg:gap-6 xl:gap-8">
            <section className="min-w-0">
              <div className="sestava-premium-panel-dark rounded-2xl p-4 backdrop-blur-sm sm:p-5">
                  <div className="mb-4">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#c8102e]">
                      Výběr hráčů
                    </p>
                    <h2 className="mt-1 font-sans text-xl font-bold leading-snug tracking-normal text-white sm:text-2xl">
                      Dostupní hráči
                    </h2>
                    <p className="mt-1 max-w-lg text-[11px] leading-snug text-slate-400 sm:text-xs">
                      Klik = první volné místo · přetáhni na dres vpravo
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
              <div className="lg:sticky lg:top-[10rem] lg:max-h-[calc(100vh-10.5rem)] lg:overflow-y-auto lg:pb-2 lg:pl-0.5 lg:self-start xl:top-[10.5rem] xl:max-h-[calc(100vh-11rem)]">
                <div className="nhl25-moje-sestava-panel rounded-2xl p-4 sm:p-5 lg:p-6">
                  <div className="nhl25-moje-sestava-accent mb-3" aria-hidden />
                  <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#003087]">
                    Soupiska
                  </p>
                  <h2 className="mt-1 font-sans text-xl font-bold leading-snug tracking-normal text-slate-900 sm:text-2xl">
                    Moje sestava
                  </h2>
                  {selectedSlot ? (
                    <p className="mt-1 text-[11px] leading-snug text-slate-600 sm:text-xs">
                      Slot vybrán — vlevo jen daná pozice, nebo přetáhni sem.
                    </p>
                  ) : null}
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
                      layoutVariant="nhl25"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-6 hidden justify-center lg:flex">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              disabled={!isComplete}
              className={`
                rounded-2xl px-12 py-4 font-display text-xl font-bold tracking-wide transition-all
                ${
                  isComplete
                    ? "bg-gradient-to-r from-[#c8102e] via-[#a30d26] to-[#003087] text-white shadow-[0_12px_40px_rgba(200,16,46,0.35),0_0_0_1px_rgba(241,196,15,0.25)] ring-1 ring-white/20 hover:scale-[1.02] hover:shadow-[0_16px_48px_rgba(200,16,46,0.45)]"
                    : "cursor-not-allowed bg-white/[0.06] text-white/35 ring-1 ring-white/[0.08]"
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
          contestSubmissionOpen={contestStats.contestSubmissionOpen}
          contestTimeBonusPercent={bonusPercent}
        />

        <PlayerPreviewModal player={previewPlayer} onClose={() => setPreviewPlayer(null)} />
      </div>
    </DndContext>
  );
}
