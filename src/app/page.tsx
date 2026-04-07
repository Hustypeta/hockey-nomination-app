"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { LineBuilder } from "@/components/LineBuilder";
import { PlayerList } from "@/components/PlayerList";
import { NominationPoster } from "@/components/NominationPoster";
import { SaveShareModal } from "@/components/SaveShareModal";
import type { Player } from "@/types";
import type { LineupStructure } from "@/types";
import { EMPTY_LINEUP, POSITION_LIMITS, TOTAL_PLAYERS } from "@/types";

function lineupToPlayers(lineup: LineupStructure, players: Player[]): Player[] {
  const ids: string[] = [];
  lineup.forwardLines.forEach((l) => {
    if (l.lw) ids.push(l.lw);
    if (l.c) ids.push(l.c);
    if (l.rw) ids.push(l.rw);
  });
  lineup.defensePairs.forEach((p) => {
    if (p.lb) ids.push(p.lb);
    if (p.rb) ids.push(p.rb);
  });
  lineup.goalies.forEach((g) => g && ids.push(g));
  lineup.extraForwards.forEach((id) => ids.push(id));
  lineup.extraDefensemen.forEach((id) => ids.push(id));
  return ids
    .map((id) => players.find((p) => p.id === id))
    .filter((p): p is Player => !!p);
}

function isLineupComplete(lineup: LineupStructure): boolean {
  const fCount =
    lineup.forwardLines.reduce((s, l) => s + (l.lw ? 1 : 0) + (l.c ? 1 : 0) + (l.rw ? 1 : 0), 0) +
    lineup.extraForwards.length;
  const dCount = lineup.defensePairs.reduce(
    (s, p) => s + (p.lb ? 1 : 0) + (p.rb ? 1 : 0),
    0
  );
  const gCount = lineup.goalies.filter(Boolean).length;
  return fCount === 14 && dCount === 8 && gCount === 3;
}

export default function Home() {
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
  const posterRef = useRef<HTMLDivElement>(null);
  const playerListRef = useRef<HTMLDivElement>(null);

  const selectedPlayers = lineupToPlayers(lineup, players);
  const usedIds = new Set(selectedPlayers.map((p) => p.id));
  const isComplete = isLineupComplete(lineup);

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

  // Při výběru slotu scroll na seznam hráčů (hlavně na mobilu)
  useEffect(() => {
    if (selectedSlot && playerListRef.current) {
      playerListRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedSlot]);

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
        if (lineup.extraForwards.length >= 2) return;
        setLineup({
          ...lineup,
          extraForwards: [...lineup.extraForwards, player.id],
        });
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
      if (type === "extraForward") return player.position === "F" && lineup.extraForwards.length < 2;
      return false;
    },
    [selectedSlot, usedIds, lineup.extraForwards.length]
  );

  const handleSave = useCallback(
    async (email: string | null): Promise<string | null> => {
      setSaving(true);
      try {
        const res = await fetch("/api/nominations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email || undefined,
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
    },
    [selectedPlayers, captainId, lineup]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-display text-2xl text-[#c41e3a] animate-pulse">
          Načítám hráče...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0e12]">
      {/* Header */}
      <header className="border-b border-[#2a3142] bg-[#151922]/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="font-display text-4xl md:text-5xl text-white tracking-wider">
            MS 2026
          </h1>
          <p className="text-[#c41e3a] font-display text-xl mt-1">
            Sestavovač nominace
          </p>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-white/70 text-sm">
              {selectedPlayers.length} / {TOTAL_PLAYERS} hráčů
            </span>
            {!isComplete && (
              <span className="text-amber-400 text-sm">
                {counts.G}G · {counts.D}D · {counts.F}F
              </span>
            )}
            {selectedSlot && (
              <span className="text-amber-400 text-sm">
                Vyber hráče pro vybraný slot
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-10">
          {/* Line builder – na mobilu při vybraném slotu pod seznamem */}
          <section className={selectedSlot ? "lg:order-1 order-2" : "order-1"}>
            <h2 className="font-display text-2xl text-white mb-4">
              Sestav lajny
            </h2>
            <p className="text-white/60 text-sm mb-4">
              Klikni na prázdný slot, pak vyber hráče ze seznamu. Klikni na hráče ve slotu pro odebrání.
            </p>
            <LineBuilder
              lineup={lineup}
              players={players}
              captainId={captainId}
              onLineupChange={setLineup}
              onCaptainChange={setCaptainId}
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
            />
          </section>

          {/* Player list – na mobilu při vybraném slotu nahoře */}
          <section
            ref={playerListRef}
            className={selectedSlot ? "lg:order-2 order-1" : "order-2"}
          >
            <h2 className="font-display text-2xl text-white mb-4">
              Vyber hráče
            </h2>
            <PlayerList
              players={players}
              usedIds={usedIds}
              counts={counts}
              selectedSlot={selectedSlot}
              onSelectPlayer={assignPlayerToSlot}
              canAssignPlayer={canAssignPlayer}
            />
          </section>
        </div>

        {/* Save button */}
        <section className="flex justify-center mt-8">
          <button
            onClick={() => setModalOpen(true)}
            disabled={!isComplete}
            className={`
              px-8 py-4 rounded-xl font-display text-xl transition-all
              ${isComplete
                ? "bg-[#c41e3a] text-white hover:bg-[#a01830] card-glow hover:scale-105"
                : "bg-[#2a3142] text-white/50 cursor-not-allowed"
              }
            `}
          >
            Uložit / plakát
          </button>
        </section>
      </main>

      {/* Hidden poster for export */}
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
        onSave={handleSave}
        isSaving={saving}
      />
    </div>
  );
}
