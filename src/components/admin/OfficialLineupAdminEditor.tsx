"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
import { poolToSlotCollision } from "@/lib/dndCollision";
import Link from "next/link";
import { toast } from "sonner";
import { LineBuilder } from "@/components/LineBuilder";
import { AppLoadingScreen } from "@/components/AppLoadingScreen";
import { SestavaAmbientBackground } from "@/components/sestava/SestavaAmbientBackground";
import { SiteHeader } from "@/components/site/SiteHeader";
import { PlayerPoolPanel } from "@/components/sestava/PlayerPoolPanel";
import { PlayerPreviewModal } from "@/components/sestava/PlayerPreviewModal";
import { lineupToPlayers, isLineupComplete, normalizeLineupStructure } from "@/lib/lineupUtils";
import { tryAutoAssignPlayer, assignPlayerToTarget, buildRandomLineup } from "@/lib/lineupAssign";
import { initJerseyNameDisambiguation } from "@/lib/jerseyDisplayName";
import type { Position } from "@/types";
import { parseDroppableId, droppableIdFromSelectedSlot } from "@/lib/dndSlotIds";
import type { Player } from "@/types";
import type { LineupStructure } from "@/types";
import { EMPTY_LINEUP, TOTAL_PLAYERS } from "@/types";
import { useMediaQuery } from "@/hooks/useMediaQuery";

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
  const [clearing, setClearing] = useState(false);
  const [previewPlayer, setPreviewPlayer] = useState<Player | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const wasCompleteRef = useRef(false);
  const [poolDragPlayer, setPoolDragPlayer] = useState<Player | null>(null);

  const isNarrowLayout = useMediaQuery("(max-width: 1023px)");
  /** Stejné chování jako editor „Sestava na zápas“ — DnD i na tabletu. */
  const enableDnd = true;
  const mobilePlayerSheetOpen = isNarrowLayout && selectedSlot !== null;
  const showDesktopPoolColumn = !isNarrowLayout || selectedSlot === null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } })
  );

  const selectedPlayers = useMemo(() => lineupToPlayers(lineup, players), [lineup, players]);
  const usedIds = useMemo(() => new Set(selectedPlayers.map((p) => p.id)), [selectedPlayers]);
  const isComplete = isLineupComplete(lineup);
  const filled = selectedPlayers.length;
  const remaining = TOTAL_PLAYERS - filled;

  const counts = useMemo(
    () => ({
      G: lineup.goalies.filter(Boolean).length,
      D:
        lineup.defensePairs
          .slice(0, 3)
          .reduce((s, p) => s + (p.lb ? 1 : 0) + (p.rb ? 1 : 0), 0) +
        (lineup.defensePairs[3].lb ? 1 : 0) +
        lineup.extraDefensemen.length,
      F:
        lineup.forwardLines.reduce(
          (s, l) => s + (l.lw ? 1 : 0) + (l.c ? 1 : 0) + (l.rw ? 1 : 0) + (l.x ? 1 : 0),
          0
        ) + (lineup.extraForwards[0] ? 1 : 0),
    }),
    [lineup]
  );

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
      setLineup(normalizeLineupStructure(data.lineupStructure as LineupStructure));
    } else {
      setLineup(EMPTY_LINEUP);
    }
    setCaptainId(typeof data.captainId === "string" ? data.captainId : null);
    setUpdatedAt(typeof data.updatedAt === "string" ? data.updatedAt : null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/players");
        const data = (await r.json()) as unknown;
        if (cancelled) return;
        const list = Array.isArray(data) ? (data as Player[]) : [];
        setPlayers(list);
        initJerseyNameDisambiguation(list);
      } finally {
        if (!cancelled) setLoading(false);
      }
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
    if (!mobilePlayerSheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobilePlayerSheetOpen]);

  useEffect(() => {
    if (isComplete && !wasCompleteRef.current && authorized) {
      toast.success("Soupiska je kompletní — můžeš uložit.", { duration: 4000 });
    }
    wasCompleteRef.current = isComplete;
  }, [isComplete, authorized]);

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
        const slotId = droppableIdFromSelectedSlot(selectedSlot);
        const target = slotId ? parseDroppableId(slotId) : null;
        if (!target || !canAssignPlayer(player)) {
          toast.error("Tenhle hráč nejde na vybraný slot.");
          setSelectedSlot(null);
          return;
        }
        const next = assignPlayerToTarget(lineup, player, target);
        if (next) {
          setLineup(next);
          toast.success(`${player.name} je ve sestavě`);
        } else {
          toast.error("Sem tohohle hráče nelze dát.");
        }
        setSelectedSlot(null);
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
    [lineup, selectedSlot, canAssignPlayer]
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

  const handleClearStoredOfficial = useCallback(async () => {
    if (
      !window.confirm(
        "Odstranit uloženou oficiální soupisku z databáze? Veřejný žebříček soutěže přestane zobrazovat body, dokud znovu neuložíš kompletní sestavu."
      )
    ) {
      return;
    }
    setClearing(true);
    try {
      const res = await fetch("/api/admin/official-lineup", {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Odstranění selhalo.");
        return;
      }
      toast.success(data.message ?? "Odstraněno.");
      setLineup(EMPTY_LINEUP);
      setCaptainId(null);
      setUpdatedAt(null);
      await loadOfficial();
    } finally {
      setClearing(false);
    }
  }, [loadOfficial]);

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
              Stejný editor jako nominace na MS (25 hráčů). Po uložení se podle této sestavy vyhodnotí soutěž (
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

  const forcedPoolPosition: Position | null = selectedSlot
    ? selectedSlot.type === "goalie"
      ? "G"
      : selectedSlot.type === "defense" || selectedSlot.type === "extraDefenseman"
        ? "D"
        : "F"
    : null;

  const content = (
    <div className="sestava-page-ambient min-h-screen pb-28 text-white">
      {!isNarrowLayout ? <SestavaAmbientBackground /> : null}
      <div className="sticky top-0 z-40">
        <SiteHeader />
        <header className="relative border-b border-white/[0.1] bg-gradient-to-b from-[#0a1224]/95 via-[#080d18]/92 to-[#060a14]/95 px-3 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:px-4 lg:px-6">
          <div className="mx-auto flex max-w-[90rem] flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="font-display text-xl font-black tracking-[0.08em] text-white sm:text-2xl">
                Admin — oficiální soupiska
              </h1>
              <p className="mt-1 text-xs text-white/55">
                Rozložení a ovládání jako u{' '}
                <Link href="/zapasy/sestava" className="font-semibold text-[#f1c40f] underline-offset-4 hover:underline">
                  tvorby sestavy na zápas
                </Link>
                — kompletní nominace{' '}
                <span className="font-mono tabular-nums">{TOTAL_PLAYERS}</span> hráčů podle soutěže.
              </p>
              {updatedAt ? (
                <p className="mt-2 text-[10px] text-slate-500">
                  Naposledy uloženo: {new Date(updatedAt).toLocaleString("cs-CZ")}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={!isComplete || saving}
                className="rounded-xl bg-gradient-to-r from-[#c8102e] to-[#003087] px-4 py-2 text-xs font-bold text-white shadow-[0_8px_24px_rgba(200,16,46,0.25)] disabled:opacity-40"
              >
                {saving ? "Ukládám…" : "Uložit soupisku"}
              </button>
              <button
                type="button"
                onClick={handleRandom}
                className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-bold text-white/85 hover:bg-white/[0.07]"
              >
                Náhodně
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-bold text-white/85 hover:bg-white/[0.07]"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleClearStoredOfficial}
                disabled={clearing || !updatedAt}
                className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-100 hover:bg-amber-500/15 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {clearing ? "…" : "Smazat uložené"}
              </button>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/5"
              >
                Odhlásit
              </button>
            </div>
          </div>
        </header>
      </div>

      <main className="relative z-10 mx-auto max-w-[90rem] px-3 py-5 sm:px-5 lg:px-6">
        {!isComplete && (
          <div className="mb-4 rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-2.5 text-center text-xs text-amber-100 sm:text-sm">
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

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,10fr)_minmax(0,14fr)] lg:gap-7">
          {showDesktopPoolColumn ? (
            <section className="min-h-0 min-w-0 hidden lg:block">
              <div className="lg:sticky lg:top-[11.5rem] lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto lg:overscroll-contain lg:pb-2 lg:pr-0.5 lg:self-start xl:top-[12rem] xl:max-h-[calc(100vh-12.5rem)]">
                <div
                  className={`rounded-2xl border border-white/10 bg-white/[0.03] p-4 ${
                    isNarrowLayout ? "" : "backdrop-blur-sm"
                  }`}
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/50">Hráči</p>
                  <p className="mt-1 text-sm font-semibold text-white/85">Vyber ze seznamu nebo táhni na slot →</p>
                  <PlayerPoolPanel
                    players={players}
                    usedIds={usedIds}
                    counts={counts}
                    onAddPlayer={handleAddFromPool}
                    onPreview={setPreviewPlayer}
                    enableDnd={enableDnd}
                    forcedPosition={forcedPoolPosition}
                    assignableFilter={selectedSlot ? canAssignPlayer : undefined}
                    slotHint={
                      selectedSlot?.type === "extraDefenseman" && !lineup.defensePairs[3].lb
                        ? "Nejdřív doplň sedmého beka ve 4. obranném řádku — pak půjde vybrat náhradního obránce."
                        : null
                    }
                  />
                </div>
              </div>
            </section>
          ) : null}

          <section className="min-h-0 min-w-0">
            <div className="lg:sticky lg:top-[11.5rem] lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto lg:overscroll-contain lg:pb-2 lg:pl-0.5 lg:self-start xl:top-[12rem] xl:max-h-[calc(100vh-12.5rem)]">
              <div
                className={`rounded-2xl border border-white/10 bg-white/[0.03] p-4 ${
                  isNarrowLayout ? "" : "backdrop-blur-sm"
                }`}
              >
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/50">Editor</p>
                <h2 className="mt-1 font-display text-lg font-black tracking-[0.1em] text-white sm:text-xl">
                  Oficiální soupiska ČR
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
                    enableDnd={enableDnd}
                    layoutVariant="classic"
                    mode="nomination"
                  />
                </div>
                <div className="mt-4 rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-xs text-white/70">
                  Stav:{" "}
                  <span className={isComplete ? "text-emerald-300" : "text-amber-200"}>
                    {isComplete ? "Kompletní — lze uložit" : "Není kompletní"}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Mobilní výběr hráče po klepnutí na slot — jako u /zapasy/sestava */}
        {mobilePlayerSheetOpen ? (
          <div className="fixed inset-0 z-[90] lg:hidden">
            <div className="absolute inset-0 bg-[#010208]/80 backdrop-blur-md" aria-hidden />
            <div className="absolute inset-x-0 bottom-0 top-[calc(0.5rem+env(safe-area-inset-top))] mx-2 overflow-hidden rounded-2xl border border-white/[0.12] bg-gradient-to-b from-[#0b1220]/98 to-[#03050a]/98 shadow-[0_24px_80px_rgba(0,0,0,0.65),0_0_0_1px_rgba(0,180,255,0.12)]">
              <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.26em] text-white/50">Výběr hráčů</p>
                  <p className="mt-1 truncate text-sm font-semibold text-white/85">Klepni na hráče</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSlot(null)}
                  className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-white"
                >
                  Zpět do sestavy
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">
                <PlayerPoolPanel
                  players={players}
                  usedIds={usedIds}
                  counts={counts}
                  onAddPlayer={handleAddFromPool}
                  onPreview={setPreviewPlayer}
                  enableDnd={false}
                  forcedPosition={forcedPoolPosition}
                  assignableFilter={selectedSlot ? canAssignPlayer : undefined}
                  slotHint={
                    selectedSlot?.type === "extraDefenseman" && !lineup.defensePairs[3].lb
                      ? "Nejdřív sedmého beka ve 4. řádku, pak náhradního."
                      : null
                  }
                />
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {enableDnd ? (
        <DragOverlay dropAnimation={null}>
          {poolDragPlayer ? (
            <div className="pointer-events-none flex max-w-[20rem] items-center gap-3 rounded-2xl border border-white/15 bg-black/80 px-4 py-3">
              <span className="font-bold">{poolDragPlayer.name}</span>
            </div>
          ) : null}
        </DragOverlay>
      ) : null}

      <PlayerPreviewModal player={previewPlayer} onClose={() => setPreviewPlayer(null)} />
    </div>
  );

  return enableDnd ? (
    <DndContext
      sensors={sensors}
      collisionDetection={poolToSlotCollision}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {content}
    </DndContext>
  ) : (
    content
  );
}
