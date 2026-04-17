"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { toast } from "sonner";
import { LineBuilder } from "@/components/LineBuilder";
import { AppLoadingScreen } from "@/components/AppLoadingScreen";
import { SestavaAmbientBackground } from "@/components/sestava/SestavaAmbientBackground";
import { SiteHeader } from "@/components/site/SiteHeader";
import { PlayerPoolPanel } from "@/components/sestava/PlayerPoolPanel";
import { FloatingSestavaBar } from "@/components/sestava/FloatingSestavaBar";
import { PlayerPreviewModal } from "@/components/sestava/PlayerPreviewModal";
import { PlayerAvatar } from "@/components/sestava/PlayerAvatar";
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

export function OfficialLineupAdminEditor() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);

  const [players, setPlayers] = useState<Player[]>([]);
  const [lineup, setLineup] = useState<LineupStructure>(EMPTY_LINEUP);
  const [captainId, setCaptainId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{
    type: string;
    lineIndex?: number;
    role?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewPlayer, setPreviewPlayer] = useState<Player | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const wasCompleteRef = useRef(false);
  const [poolDragPlayer, setPoolDragPlayer] = useState<Player | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 6 },
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

  const loadOfficial = useCallback(async () => {
    const res = await fetch("/api/admin/official-lineup", { credentials: "include" });
    if (res.status === 401) {
      setAuthorized(false);
      return;
    }
    if (!res.ok) {
      toast.error("Nepodařilo se načíst uloženou soupisku.");
      setAuthorized(true);
      return;
    }
    setAuthorized(true);
    const data = await res.json();
    if (data.lineupStructure && typeof data.lineupStructure === "object") {
      setLineup(data.lineupStructure as LineupStructure);
    } else {
      setLineup(EMPTY_LINEUP);
    }
    setCaptainId(typeof data.captainId === "string" ? data.captainId : null);
    setUpdatedAt(typeof data.updatedAt === "string" ? data.updatedAt : null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await fetch("/api/players")
        .then((r) => r.json())
        .then((data) => {
          if (!cancelled) setPlayers(Array.isArray(data) ? data : []);
        })
        .catch(console.error)
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await loadOfficial();
      if (!cancelled) setAuthChecked(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadOfficial]);

  useEffect(() => {
    if (isComplete && !wasCompleteRef.current && authorized) {
      toast.success("Soupiska je kompletní — můžeš uložit.", { duration: 4000 });
    }
    wasCompleteRef.current = isComplete;
  }, [isComplete, authorized]);

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
      } else if (type === "extraDefenseman" && player.position === "D") {
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
    [selectedSlot, usedIds, lineup.defensePairs]
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
        toast.error("Už není volné místo pro tuto pozici, nebo je hráč už ve soupisce.");
        return;
      }
      setLineup(next);
      toast.success(`${player.name} přidán`);
    },
    [lineup, selectedSlot, canAssignPlayer, assignPlayerToSlot]
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const activeId = event.active.id.toString();
      if (!activeId.startsWith("drag-player-")) {
        setPoolDragPlayer(null);
        return;
      }
      const pid = activeId.replace("drag-player-", "");
      setPoolDragPlayer(players.find((p) => p.id === pid) ?? null);
    },
    [players]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setPoolDragPlayer(null);
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

  const handleDragCancel = useCallback(() => setPoolDragPlayer(null), []);

  const handleRandom = useCallback(() => {
    const next = buildRandomLineup(players);
    if (!next) {
      toast.error("V databázi není dost hráčů (potřeba 3G + 8D + 14F).");
      return;
    }
    setLineup(next);
    setCaptainId(null);
    setSelectedSlot(null);
    toast.success("Náhodná sestava — uprav podle oficiálního zápisu.");
  }, [players]);

  const handleReset = useCallback(() => {
    setLineup(EMPTY_LINEUP);
    setCaptainId(null);
    setSelectedSlot(null);
    toast.message("Sestava resetována.");
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginBusy(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Přihlášení selhalo.");
        return;
      }
      setPassword("");
      toast.success("Přihlášeno.");
      await loadOfficial();
    } finally {
      setLoginBusy(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    setAuthorized(false);
    setLineup(EMPTY_LINEUP);
    setCaptainId(null);
    toast.message("Odhlášeno.");
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/official-lineup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          lineupStructure: lineup,
          captainId,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Uložení selhalo.");
        return;
      }
      toast.success(data.message ?? "Uloženo.");
      await loadOfficial();
    } finally {
      setSaving(false);
    }
  }, [lineup, captainId, loadOfficial]);

  if (!authChecked || loading) {
    return <AppLoadingScreen message="Načítám…" />;
  }

  if (!authorized) {
    return (
      <div className="sestava-page-ambient min-h-screen pb-24 text-white">
        <SestavaAmbientBackground />
        <div className="sticky top-0 z-40">
          <SiteHeader />
        </div>
        <div className="relative z-10 mx-auto max-w-md px-4 py-16">
          <div className="sestava-premium-panel-dark rounded-2xl p-6 shadow-xl">
            <h1 className="font-sans text-xl font-bold leading-snug tracking-normal text-white">
              Admin — oficiální soupiska
            </h1>
            <p className="mt-2 text-sm text-white/65">
              Stejný editor jako u nominací. Po uložení se podle této sestavy vyhodnotí soutěž (
              <code className="text-cyan-200/90">GET /api/contest/leaderboard</code>).
            </p>
            <form onSubmit={handleLogin} className="mt-6 space-y-3">
              <label className="block text-xs font-medium uppercase tracking-wider text-white/50">
                Heslo
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none ring-cyan-500/40 focus:ring-2"
                />
              </label>
              <button
                type="submit"
                disabled={loginBusy || !password}
                className="w-full rounded-xl bg-gradient-to-r from-[#c8102e] to-[#003087] py-3 text-sm font-bold text-white disabled:opacity-40"
              >
                {loginBusy ? "…" : "Přihlásit"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const subtitleCounts =
    "Oficiální soupiska pro vyhodnocení · 25 hráčů · stejné sloty jako u uživatelů";
  const forcedPoolPosition: Position | null = selectedSlot
    ? selectedSlot.type === "goalie"
      ? "G"
      : selectedSlot.type === "defense" || selectedSlot.type === "extraDefenseman"
        ? "D"
        : "F"
    : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="sestava-page-ambient min-h-screen pb-[13rem] text-white sm:pb-44 lg:pb-36">
        <SestavaAmbientBackground />

        <div className="sticky top-0 z-40">
          <SiteHeader />
          <header className="relative border-b border-white/[0.1] bg-gradient-to-b from-[#0a1224]/95 via-[#080d18]/92 to-[#060a14]/95 px-3 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:px-4 lg:px-6">
            <div className="mx-auto flex max-w-[90rem] flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="font-sans text-lg font-bold leading-snug tracking-normal text-white sm:text-xl">
                  Admin — oficiální soupiska
                </h1>
                <p className="mt-0.5 text-[11px] text-slate-400">{subtitleCounts}</p>
                {updatedAt ? (
                  <p className="mt-1 text-[10px] text-slate-500">
                    Naposledy uloženo: {new Date(updatedAt).toLocaleString("cs-CZ")}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/5"
                >
                  Odhlásit
                </button>
              </div>
            </div>
          </header>
        </div>

        <div className="relative z-10 mx-auto max-w-[90rem] px-3.5 py-5 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
          {!isComplete && (
            <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-center text-xs text-amber-100 sm:text-sm">
              {remaining > 0 ? (
                <>
                  Ještě <span className="font-semibold">{remaining}</span>{" "}
                  {remaining === 1 ? "místo" : remaining < 5 ? "místa" : "míst"} do kompletní soupisky.
                </>
              ) : (
                <>Doplň poslední detaily.</>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,10fr)_minmax(0,14fr)] lg:gap-7 xl:gap-8">
            <section className="min-w-0">
              <div className="sestava-premium-panel-dark rounded-2xl p-3.5 backdrop-blur-sm sm:p-5">
                <div className="mb-4">
                  <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#c8102e]">
                    Výběr hráčů
                  </p>
                  <h2 className="mt-1 font-sans text-xl font-bold leading-snug tracking-normal text-white sm:text-2xl">
                    Dostupní hráči
                  </h2>
                  <p className="mt-1.5 text-[11px] leading-snug text-white/55 sm:text-xs">
                    Přetáhni na slot vpravo, nebo klepni na jméno pro rychlé doplnění.
                  </p>
                </div>
                <PlayerPoolPanel
                  players={players}
                  usedIds={usedIds}
                  counts={counts}
                  onAddPlayer={handleAddFromPool}
                  onPreview={setPreviewPlayer}
                  forcedPosition={forcedPoolPosition}
                  assignableFilter={selectedSlot ? canAssignPlayer : undefined}
                  slotHint={
                    selectedSlot?.type === "extraDefenseman" && !lineup.defensePairs[3].lb
                      ? "Nejdřív doplň sedmého beka ve 4. obranném řádku — pak půjde vybrat náhradního obránce."
                      : null
                  }
                />
              </div>
            </section>

            <section className="min-w-0">
              <div className="lg:sticky lg:top-[10rem] lg:max-h-[calc(100vh-10.5rem)] lg:overflow-y-auto lg:pb-2 lg:self-start xl:top-[10.5rem] xl:max-h-[calc(100vh-11rem)]">
                <div className="nhl25-moje-sestava-panel rounded-2xl p-3.5 sm:p-5 lg:p-6">
                  <div className="nhl25-moje-sestava-accent mb-3" aria-hidden />
                  <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#003087]">
                    Oficiální zápis
                  </p>
                  <h2 className="mt-1 font-sans text-xl font-bold leading-snug tracking-normal text-slate-900 sm:text-2xl">
                    Soupiska ČR (MS 2026)
                  </h2>
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
              onClick={handleSave}
              disabled={!isComplete || saving}
              className={`
                rounded-2xl px-12 py-4 font-display text-xl font-bold tracking-wide transition-all
                ${
                  isComplete && !saving
                    ? "bg-gradient-to-r from-[#c8102e] via-[#a30d26] to-[#003087] text-white shadow-[0_12px_40px_rgba(200,16,46,0.35)] ring-1 ring-white/20 hover:scale-[1.02]"
                    : "cursor-not-allowed bg-white/[0.06] text-white/35 ring-1 ring-white/[0.08]"
                }
              `}
            >
              {saving ? "Ukládám…" : "Uložit oficiální soupisku"}
            </button>
          </div>
        </div>

        <FloatingSestavaBar
          onShare={handleSave}
          onRandom={handleRandom}
          onReset={handleReset}
          shareDisabled={!isComplete || saving}
          shareLabel={saving ? "Ukládám…" : "Uložit oficiální soupisku"}
        />

        <DragOverlay dropAnimation={null}>
          {poolDragPlayer ? (
            <div className="pointer-events-none flex max-w-[min(100vw-2rem,20rem)] items-center gap-3 rounded-2xl border-2 border-[#f1c40f]/70 bg-gradient-to-br from-[#0a1428]/98 to-[#05080f]/98 px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.65),0_0_0_1px_rgba(200,16,46,0.35)] ring-2 ring-[#c8102e]/50 backdrop-blur-md">
              <PlayerAvatar
                name={poolDragPlayer.name}
                position={poolDragPlayer.position}
                role={poolDragPlayer.role}
                imageUrl={poolDragPlayer.imageUrl}
                size="md"
              />
              <div className="min-w-0">
                <p className="truncate font-bold text-white">{poolDragPlayer.name}</p>
                <p className="text-[11px] font-semibold text-sky-200/90">Pusť na slot</p>
              </div>
            </div>
          ) : null}
        </DragOverlay>

        <PlayerPreviewModal player={previewPlayer} onClose={() => setPreviewPlayer(null)} />
      </div>
    </DndContext>
  );
}
