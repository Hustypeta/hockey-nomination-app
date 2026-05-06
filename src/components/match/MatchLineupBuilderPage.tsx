"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SestavaAmbientBackground } from "@/components/sestava/SestavaAmbientBackground";
import { PlayerPreviewModal } from "@/components/sestava/PlayerPreviewModal";
import { PlayerPoolPanel } from "@/components/sestava/PlayerPoolPanel";
import { LineBuilder } from "@/components/LineBuilder";
import type { LineupStructure, Player, Position } from "@/types";
import { EMPTY_LINEUP } from "@/types";
import { isLineupComplete, normalizeLineupStructure } from "@/lib/lineupUtils";
import { tryAutoAssignPlayer, assignPlayerToTarget } from "@/lib/lineupAssign";
import { parseDroppableId } from "@/lib/dndSlotIds";
import { DndContext, DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";

function isMatchLineupValid(
  lineup: LineupStructure,
  opts: { defenseCount: 6 | 7 | 8; allowExtraForward: boolean }
): boolean {
  const ls = normalizeLineupStructure(lineup);
  const fBase =
    ls.forwardLines.reduce((s, l) => s + (l.lw ? 1 : 0) + (l.c ? 1 : 0) + (l.rw ? 1 : 0), 0) +
    (opts.allowExtraForward && ls.extraForwards[0] ? 1 : 0);
  const dPairsCount = (i: number) =>
    (ls.defensePairs[i].lb ? 1 : 0) + (ls.defensePairs[i].rb ? 1 : 0);
  const dBase = dPairsCount(0) + dPairsCount(1) + dPairsCount(2);
  const d4 = dPairsCount(3);
  const dExtra = opts.defenseCount === 8 ? d4 : opts.defenseCount === 7 ? (ls.defensePairs[3].lb ? 1 : 0) : 0;
  const dCount = dBase + dExtra;
  const gCount = (ls.goalies[0] ? 1 : 0) + (ls.goalies[1] ? 1 : 0);
  const fTarget = 12 + (opts.allowExtraForward ? 1 : 0);
  return fBase === fTarget && dCount === opts.defenseCount && gCount === 2;
}

export function MatchLineupBuilderPage() {
  const { status: authStatus } = useSession();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const [lineup, setLineup] = useState<LineupStructure>(EMPTY_LINEUP);
  const [captainId, setCaptainId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ type: string; lineIndex?: number; role?: string } | null>(null);
  const [previewPlayer, setPreviewPlayer] = useState<Player | null>(null);

  const [defenseCount, setDefenseCount] = useState<6 | 7 | 8>(8);
  const [allowExtraForward, setAllowExtraForward] = useState(false);
  const [shareTitle, setShareTitle] = useState("Moje sestava na zápas");
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [shareSlug, setShareSlug] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } })
  );

  const [poolDragPlayer, setPoolDragPlayer] = useState<Player | null>(null);
  const usedIds = useMemo(() => {
    const ids = new Set<string>();
    lineup.forwardLines.forEach((l) => {
      if (l.lw) ids.add(l.lw);
      if (l.c) ids.add(l.c);
      if (l.rw) ids.add(l.rw);
    });
    lineup.defensePairs.forEach((p) => {
      if (p.lb) ids.add(p.lb);
      if (p.rb) ids.add(p.rb);
    });
    if (lineup.goalies[0]) ids.add(lineup.goalies[0]);
    if (lineup.goalies[1]) ids.add(lineup.goalies[1]);
    if (allowExtraForward && lineup.extraForwards[0]) ids.add(lineup.extraForwards[0]);
    return ids;
  }, [lineup, allowExtraForward]);

  const counts = useMemo(() => {
    const g = (lineup.goalies[0] ? 1 : 0) + (lineup.goalies[1] ? 1 : 0);
    const d = lineup.defensePairs.reduce((s, p) => s + (p.lb ? 1 : 0) + (p.rb ? 1 : 0), 0);
    const f = lineup.forwardLines.reduce((s, l) => s + (l.lw ? 1 : 0) + (l.c ? 1 : 0) + (l.rw ? 1 : 0), 0) +
      (allowExtraForward && lineup.extraForwards[0] ? 1 : 0);
    return { G: g, D: d, F: f };
  }, [lineup, allowExtraForward]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/players");
        const data = (await r.json()) as unknown;
        if (cancelled) return;
        setPlayers(Array.isArray(data) ? (data as Player[]) : []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onAddFromPool = (player: Player) => {
    if (selectedSlot) {
      const target = parseDroppableId(
        selectedSlot.type === "goalie"
          ? `slot-goalie-${selectedSlot.lineIndex ?? 0}`
          : selectedSlot.type === "extraForward"
            ? "slot-xf-0"
            : selectedSlot.type === "defense"
              ? `slot-def-${selectedSlot.lineIndex ?? 0}-${selectedSlot.role ?? "lb"}`
              : `slot-fwd-${selectedSlot.lineIndex ?? 0}-${selectedSlot.role ?? "lw"}`
      );
      if (target) {
        const next = assignPlayerToTarget(lineup, player, target);
        if (next) setLineup(next);
      }
      setSelectedSlot(null);
      return;
    }
    const next = tryAutoAssignPlayer(lineup, player);
    if (!next) {
      toast.error("Už není volné místo pro tuto pozici, nebo je hráč už v sestavě.");
      return;
    }
    setLineup(next);
  };

  const handleDragStart = (e: DragStartEvent) => {
    const id = e.active.id.toString();
    if (!id.startsWith("drag-player-")) return;
    const pid = id.replace("drag-player-", "");
    setPoolDragPlayer(players.find((p) => p.id === pid) ?? null);
  };
  const handleDragEnd = (e: DragEndEvent) => {
    setPoolDragPlayer(null);
    const overId = e.over?.id?.toString();
    const activeId = e.active.id.toString();
    if (!overId || !activeId.startsWith("drag-player-")) return;
    const pid = activeId.replace("drag-player-", "");
    const player = players.find((p) => p.id === pid);
    const target = parseDroppableId(overId);
    if (!player || !target) return;
    const next = assignPlayerToTarget(lineup, player, target);
    if (next) setLineup(next);
  };

  const valid = isMatchLineupValid(lineup, { defenseCount, allowExtraForward });

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    if (!shareSlug) return "";
    return `${window.location.origin}/m/${shareSlug}`;
  }, [shareSlug]);

  const saveShare = async () => {
    if (!shareTitle.trim()) {
      toast.error("Doplň název sestavy.");
      return;
    }
    if (!valid) {
      toast.error("Sestava není kompletní podle zvolených pravidel.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: shareTitle.trim(),
        captainId,
        lineupStructure: lineup,
        defenseCount,
        allowExtraForward,
      };
      const url = shareCode ? `/api/match-share-links/${shareCode}` : "/api/match-share-links";
      const method = shareCode ? "PATCH" : "POST";
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: unknown = await r.json().catch(() => ({}));
      const err = (data as { error?: unknown } | null)?.error;
      if (!r.ok) {
        toast.error(typeof err === "string" ? err : "Uložení odkazu selhalo.");
        return;
      }
      const nextCode = (data as { code?: unknown } | null)?.code;
      const nextSlug = (data as { slug?: unknown } | null)?.slug;
      const nextUrl = (data as { url?: unknown } | null)?.url;
      setShareCode(typeof nextCode === "string" ? nextCode : shareCode);
      setShareSlug(typeof nextSlug === "string" ? nextSlug : shareSlug);
      toast.success("Odkaz uložen.");
      if (typeof nextUrl === "string" && nextUrl) {
        await navigator.clipboard.writeText(nextUrl).catch(() => undefined);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#05080f] text-white" />;
  }

  const forcedPoolPosition: Position | null = selectedSlot
    ? selectedSlot.type === "goalie"
      ? "G"
      : selectedSlot.type === "defense"
        ? "D"
        : "F"
    : null;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="sestava-page-ambient min-h-screen pb-28 text-white">
        <SestavaAmbientBackground />
        <div className="sticky top-0 z-40">
          <SiteHeader />
        </div>

        <main className="relative z-10 mx-auto max-w-[90rem] px-3 py-5 sm:px-5 lg:px-6">
          <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="font-display text-2xl font-black">Tvorba sestavy na zápas</h1>
                <p className="mt-1 text-sm text-white/60">
                  Fanouškovský editor (sdílení jako u nominace). {authStatus === "authenticated" ? "Přihlášeno." : ""}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  value={shareTitle}
                  onChange={(e) => setShareTitle(e.target.value)}
                  className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
                  placeholder="Název sestavy…"
                />
                <button
                  type="button"
                  onClick={() => void saveShare()}
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-[#c8102e] to-[#003087] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  {saving ? "Ukládám…" : "Uložit & sdílet"}
                </button>
              </div>
            </div>
            {shareUrl ? (
              <p className="mt-3 text-xs text-white/60">
                Odkaz: <span className="select-all font-mono text-white">{shareUrl}</span>
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,10fr)_minmax(0,14fr)] lg:gap-7">
            <section className="min-w-0">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <PlayerPoolPanel
                  players={players}
                  usedIds={usedIds}
                  counts={counts}
                  onAddPlayer={onAddFromPool}
                  onPreview={setPreviewPlayer}
                  enableDnd
                  forcedPosition={forcedPoolPosition}
                />
              </div>
            </section>

            <section className="min-w-0">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <LineBuilder
                  mode="match"
                  lineup={lineup}
                  players={players}
                  captainId={captainId}
                  onLineupChange={setLineup}
                  onCaptainChange={setCaptainId}
                  selectedSlot={selectedSlot}
                  onSelectSlot={setSelectedSlot}
                  enableDnd
                  layoutVariant="classic"
                  matchDefenseCount={defenseCount}
                  matchAllowExtraForward={allowExtraForward}
                  onMatchDefenseCountChange={setDefenseCount}
                  onMatchAllowExtraForwardChange={setAllowExtraForward}
                />
                <div className="mt-4 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/70">
                  Stav:{" "}
                  <span className={valid ? "text-emerald-300" : "text-amber-200"}>
                    {valid ? "OK (kompletní)" : "Není kompletní"}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </main>

        <DragOverlay dropAnimation={null}>
          {poolDragPlayer ? (
            <div className="pointer-events-none flex max-w-[20rem] items-center gap-3 rounded-2xl border border-white/15 bg-black/80 px-4 py-3">
              <span className="font-bold">{poolDragPlayer.name}</span>
            </div>
          ) : null}
        </DragOverlay>

        <PlayerPreviewModal player={previewPlayer} onClose={() => setPreviewPlayer(null)} />
      </div>
    </DndContext>
  );
}

