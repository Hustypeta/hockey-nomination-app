"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { LineBuilder } from "@/components/LineBuilder";
import { PlayerList } from "@/components/PlayerList";
import { NominationPoster } from "@/components/NominationPoster";
import { SaveShareModal } from "@/components/SaveShareModal";
import { lineupToPlayers, isLineupComplete } from "@/lib/lineupUtils";
import type { Player } from "@/types";
import type { LineupStructure } from "@/types";
import { EMPTY_LINEUP, TOTAL_PLAYERS } from "@/types";
import { AppLoadingScreen } from "@/components/AppLoadingScreen";

export function NominationBuilderPage() {
  const { data: session, status: authStatus } = useSession();
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

  return (
    <div className="min-h-screen bg-[#0c0e12]">
      <header className="border-b border-[#2a3142] bg-[#151922]/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div>
            <Link
              href="/"
              className="mb-2 inline-block font-display text-sm text-white/50 transition-colors hover:text-[#c41e3a]"
            >
              ← Úvod
            </Link>
            <h1 className="font-display text-4xl md:text-5xl text-white tracking-wider">MS 2026</h1>
            <p className="text-[#c41e3a] font-display text-xl mt-1">Sestavovač nominace</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {authStatus === "loading" ? (
              <span className="text-white/50 text-sm">…</span>
            ) : session ? (
              <>
                <span
                  className="text-white/70 text-sm truncate max-w-[200px] hidden sm:inline"
                  title={session.user?.email ?? ""}
                >
                  {session.user?.email}
                </span>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="px-4 py-2 rounded-lg border border-[#2a3142] text-white/90 text-sm hover:border-[#c41e3a] transition-colors"
                >
                  Odhlásit
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/sestava" })}
                className="px-4 py-2 rounded-lg bg-[#003f87] text-white text-sm font-display hover:bg-[#004a9e] transition-colors"
              >
                Přihlásit přes Google
              </button>
            )}
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-white/70 text-sm">
              {selectedPlayers.length} / {TOTAL_PLAYERS} hráčů
            </span>
            {!isComplete && (
              <span className="text-amber-400 text-sm">
                {counts.G}G · {counts.D}D · {counts.F}F
              </span>
            )}
            {selectedSlot && (
              <span className="text-amber-400 text-sm">Vyber hráče pro vybraný slot</span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-5 lg:gap-8">
          <section className={selectedSlot ? "lg:order-1 order-2" : "order-1"}>
            <h2 className="font-display text-xl text-white mb-2 sm:text-2xl sm:mb-3">Sestav lajny</h2>
            <p className="text-white/60 text-xs mb-2 sm:text-sm sm:mb-3">
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

          <section
            ref={playerListRef}
            className={selectedSlot ? "lg:order-2 order-1" : "order-2"}
          >
            <h2 className="font-display text-xl text-white mb-2 sm:text-2xl sm:mb-3">Vyber hráče</h2>
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

        <section className="flex justify-center mt-5 sm:mt-6">
          <button
            onClick={() => setModalOpen(true)}
            disabled={!isComplete}
            className={`
              px-6 py-3 rounded-xl font-display text-lg transition-all sm:px-8 sm:py-4 sm:text-xl
              ${
                isComplete
                  ? "bg-[#c41e3a] text-white hover:bg-[#a01830] card-glow hover:scale-105"
                  : "bg-[#2a3142] text-white/50 cursor-not-allowed"
              }
            `}
          >
            {isAuthenticated ? "Uložit / plakát" : "Sdílet nominaci"}
          </button>
        </section>
      </main>

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
    </div>
  );
}
