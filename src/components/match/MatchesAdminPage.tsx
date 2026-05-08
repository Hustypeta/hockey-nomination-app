"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { toast } from "sonner";
import type { LineupStructure, Player } from "@/types";
import { EMPTY_LINEUP } from "@/types";
import { LineBuilder } from "@/components/LineBuilder";
import { PlayerPoolPanel } from "@/components/sestava/PlayerPoolPanel";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SestavaAmbientBackground } from "@/components/sestava/SestavaAmbientBackground";
import { PlayerPreviewModal } from "@/components/sestava/PlayerPreviewModal";
import { PlayerAvatar } from "@/components/sestava/PlayerAvatar";
import type { Position } from "@/types";
import { assignPlayerToTarget, tryAutoAssignPlayer } from "@/lib/lineupAssign";
import { parseDroppableId } from "@/lib/dndSlotIds";

type MatchRow = {
  id: string;
  slug: string;
  title: string;
  category?: string | null;
  homeCode?: string | null;
  awayCode?: string | null;
  opponent: string | null;
  startsAt: string | null;
  venue: string | null;
  published: boolean;
  ratingsOpen: boolean;
  hasOfficialLineup: boolean;
};

/** Řádky pro seed: české zápasy na BHG 2026 (jen Česko). */
const CZE_BHG_2026: Array<{ title: string; homeCode: string; awayCode: string; startsAt: string }> = [
  { title: "CZE - SWE", homeCode: "CZE", awayCode: "SWE", startsAt: "2026-05-07T17:00:00+02:00" },
  { title: "FIN - CZE", homeCode: "FIN", awayCode: "CZE", startsAt: "2026-05-09T12:00:00+02:00" },
  { title: "SUI - CZE", homeCode: "SUI", awayCode: "CZE", startsAt: "2026-05-10T12:00:00+02:00" },
];

/** Řádky pro seed: 7 zápasů Česka v základní skupině MS 2026 (Fribourg, skupina B). */
const CZE_MS2026: Array<{
  title: string;
  homeCode: string;
  awayCode: string;
  startsAt: string;
  venue: string;
}> = [
  { title: "CZE - DEN", homeCode: "CZE", awayCode: "DEN", startsAt: "2026-05-15T20:20:00+02:00", venue: "Fribourg" },
  { title: "CZE - SLO", homeCode: "CZE", awayCode: "SLO", startsAt: "2026-05-16T20:20:00+02:00", venue: "Fribourg" },
  { title: "SWE - CZE", homeCode: "SWE", awayCode: "CZE", startsAt: "2026-05-18T20:20:00+02:00", venue: "Fribourg" },
  { title: "ITA - CZE", homeCode: "ITA", awayCode: "CZE", startsAt: "2026-05-20T16:20:00+02:00", venue: "Fribourg" },
  { title: "CZE - SVK", homeCode: "CZE", awayCode: "SVK", startsAt: "2026-05-23T16:20:00+02:00", venue: "Fribourg" },
  { title: "NOR - CZE", homeCode: "NOR", awayCode: "CZE", startsAt: "2026-05-25T16:20:00+02:00", venue: "Fribourg" },
  { title: "CAN - CZE", homeCode: "CAN", awayCode: "CZE", startsAt: "2026-05-26T20:20:00+02:00", venue: "Fribourg" },
];

function readAdminJsonError(data: unknown): string | undefined {
  if (typeof data !== "object" || data === null) return undefined;
  const e = (data as { error?: unknown }).error;
  return typeof e === "string" ? e : undefined;
}

function parseMatchRowsFromPayload(data: unknown): MatchRow[] {
  const list =
    typeof data === "object" &&
    data !== null &&
    "matches" in data &&
    Array.isArray((data as { matches: unknown }).matches)
      ? (data as { matches: unknown[] }).matches
      : [];
  const rows: MatchRow[] = [];
  for (const m of list) {
    if (typeof m !== "object" || m === null) continue;
    const o = m as Record<string, unknown>;
    if (typeof o.id !== "string" || typeof o.slug !== "string" || typeof o.title !== "string") continue;
    rows.push({
      id: o.id,
      slug: o.slug,
      title: o.title,
      category: typeof o.category === "string" ? o.category : null,
      homeCode: typeof o.homeCode === "string" ? o.homeCode : null,
      awayCode: typeof o.awayCode === "string" ? o.awayCode : null,
      opponent: typeof o.opponent === "string" ? o.opponent : null,
      startsAt:
        typeof o.startsAt === "string" || typeof o.startsAt === "number"
          ? new Date(o.startsAt).toISOString()
          : null,
      venue: typeof o.venue === "string" ? o.venue : null,
      published: Boolean(o.published),
      ratingsOpen: Boolean(o.ratingsOpen),
      hasOfficialLineup:
        typeof o.officialLineup === "object" && o.officialLineup !== null,
    });
  }
  return rows;
}

export function MatchesAdminPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [previewPlayer, setPreviewPlayer] = useState<Player | null>(null);

  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const active = useMemo(() => matches.find((m) => m.id === activeId) ?? null, [matches, activeId]);

  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newOpponent, setNewOpponent] = useState("");
  const [newStartsAt, setNewStartsAt] = useState("");
  const [newVenue, setNewVenue] = useState("");
  const [newCategory, setNewCategory] = useState<"beijir" | "ms2026">("beijir");
  const [newHome, setNewHome] = useState("CZE");
  const [newAway, setNewAway] = useState("");
  const [seeding, setSeeding] = useState(false);

  const [lineup, setLineup] = useState<LineupStructure>(EMPTY_LINEUP);
  const [captainId, setCaptainId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ type: string; lineIndex?: number; role?: string } | null>(null);
  const [defenseCount, setDefenseCount] = useState<6 | 7 | 8>(8);
  const [allowExtraForward, setAllowExtraForward] = useState(false);
  const [published, setPublished] = useState(false);
  const [ratingsOpen, setRatingsOpen] = useState(false);
  const [togglingRatings, setTogglingRatings] = useState(false);
  const [saving, setSaving] = useState(false);
  const [poolDragPlayer, setPoolDragPlayer] = useState<Player | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const aid = event.active.id.toString();
    if (typeof window !== "undefined") console.info("[dnd:match-admin] start", { activeId: aid });
    if (!aid.startsWith("drag-player-")) {
      setPoolDragPlayer(null);
      return;
    }
    const pid = aid.replace("drag-player-", "");
    setPoolDragPlayer(players.find((p) => p.id === pid) ?? null);
  }, [players]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setPoolDragPlayer(null);
      const overId = event.over?.id?.toString();
      const activeIdStr = event.active.id.toString();
      if (typeof window !== "undefined") console.info("[dnd:match-admin] end", { activeId: activeIdStr, overId });
      if (!overId || !activeIdStr.startsWith("drag-player-")) return;
      const pid = activeIdStr.replace("drag-player-", "");
      const player = players.find((p) => p.id === pid);
      const target = parseDroppableId(overId);
      if (!player || !target) return;
      const next = assignPlayerToTarget(lineup, player, target, { mode: "match" });
      if (!next) {
        toast.error("Sem tohohle hráče nelze dát.");
        return;
      }
      setLineup(next);
      toast.success(`${player.name} → slot`);
    },
    [lineup, players]
  );

  const handleDragCancel = useCallback(() => setPoolDragPlayer(null), []);

  const forcedPoolPosition: Position | null = selectedSlot
    ? selectedSlot.type === "goalie"
      ? "G"
      : selectedSlot.type === "defense"
        ? "D"
        : "F"
    : null;

  const usedIds = useMemo(() => {
    const s = new Set<string>();
    lineup.forwardLines.forEach((l) => {
      if (l.lw) s.add(l.lw);
      if (l.c) s.add(l.c);
      if (l.rw) s.add(l.rw);
    });
    lineup.defensePairs.forEach((p) => {
      if (p.lb) s.add(p.lb);
      if (p.rb) s.add(p.rb);
    });
    if (lineup.goalies[0]) s.add(lineup.goalies[0]);
    if (lineup.goalies[1]) s.add(lineup.goalies[1]);
    if (allowExtraForward && lineup.extraForwards[0]) s.add(lineup.extraForwards[0]);
    return s;
  }, [lineup, allowExtraForward]);

  const counts = useMemo(() => {
    const g = (lineup.goalies[0] ? 1 : 0) + (lineup.goalies[1] ? 1 : 0);
    const d = lineup.defensePairs.reduce((x, p) => x + (p.lb ? 1 : 0) + (p.rb ? 1 : 0), 0);
    const f =
      lineup.forwardLines.reduce((x, l) => x + (l.lw ? 1 : 0) + (l.c ? 1 : 0) + (l.rw ? 1 : 0), 0) +
      (allowExtraForward && lineup.extraForwards[0] ? 1 : 0);
    return { G: g, D: d, F: f };
  }, [lineup, allowExtraForward]);

  async function reloadMatches() {
    const r = await fetch("/api/admin/matches", { credentials: "include", cache: "no-store" });
    const data: unknown = await r.json().catch(() => ({}));
    if (!r.ok) {
      toast.error(readAdminJsonError(data) ?? "Nelze načíst zápasy.");
      return;
    }
    const list = parseMatchRowsFromPayload(data);
    setMatches(list);
  }

  /** Drží `activeId` v souladu s načteným seznamem — jinak je řízený <select> „prázdný“ a nedá se přepínat. */
  useEffect(() => {
    setActiveId((cur) => {
      if (matches.length === 0) return "";
      if (cur && matches.some((m) => m.id === cur)) return cur;
      return matches[0]!.id;
    });
  }, [matches]);

  async function loadMatch(id: string) {
    const r = await fetch(`/api/admin/matches/${encodeURIComponent(id)}/official-lineup`, {
      credentials: "include",
      cache: "no-store",
    });
    const data: unknown = await r.json().catch(() => ({}));
    if (!r.ok) {
      toast.error(readAdminJsonError(data) ?? "Nelze načíst zápas.");
      return;
    }
    if (typeof data !== "object" || data === null || !("match" in data)) return;
    const mRaw = (data as { match: unknown }).match;
    if (typeof mRaw !== "object" || mRaw === null) return;
    const m = mRaw as Record<string, unknown>;
    setPublished(Boolean(m.published));
    setRatingsOpen(Boolean(m.ratingsOpen));
    const offRaw = m.officialLineup;
    if (typeof offRaw === "object" && offRaw !== null) {
      const off = offRaw as Record<string, unknown>;
      if (off.lineupStructure != null && typeof off.lineupStructure === "object")
        setLineup(off.lineupStructure as LineupStructure);
      else setLineup(EMPTY_LINEUP);
      setCaptainId(typeof off.captainId === "string" ? off.captainId : null);
      const dc = off.defenseCount;
      setDefenseCount(dc === 6 || dc === 7 || dc === 8 ? dc : 8);
      setAllowExtraForward(Boolean(off.allowExtraForward));
    } else {
      setLineup(EMPTY_LINEUP);
      setCaptainId(null);
      setDefenseCount(8);
      setAllowExtraForward(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await fetch("/api/players");
      const data: unknown = await r.json().catch(() => []);
      if (!cancelled) setPlayers(Array.isArray(data) ? (data as Player[]) : []);
      await reloadMatches();
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!activeId) return;
    void loadMatch(activeId);
  }, [activeId]);

  const createMatch = async () => {
    const title = newTitle.trim() || (newHome.trim() && newAway.trim() ? `${newHome.trim().toUpperCase()} - ${newAway.trim().toUpperCase()}` : "");
    if (!title) {
      toast.error("Doplň název zápasu nebo vyplň týmy.");
      return;
    }
    setCreating(true);
    try {
      const r = await fetch("/api/admin/matches", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          opponent: newOpponent.trim() || null,
          startsAt: newStartsAt.trim() || null,
          venue: newVenue.trim() || null,
          category: newCategory,
          homeCode: newHome.trim() || null,
          awayCode: newAway.trim() || null,
          published: false,
        }),
      });
      const data: unknown = await r.json().catch(() => ({}));
      if (!r.ok) {
        toast.error(readAdminJsonError(data) ?? "Vytvoření selhalo.");
        return;
      }
      toast.success("Zápas vytvořen.");
      setNewTitle("");
      setNewOpponent("");
      setNewStartsAt("");
      setNewVenue("");
      setNewAway("");
      await reloadMatches();
      if (typeof data === "object" && data !== null) {
        const match = (data as { match?: unknown }).match;
        if (typeof match === "object" && match !== null && "id" in match) {
          const id = (match as { id?: unknown }).id;
          if (typeof id === "string") setActiveId(id);
        }
      }
    } finally {
      setCreating(false);
    }
  };

  const seedSet = async (
    label: string,
    category: "beijir" | "ms2026",
    rows: Array<{ title: string; homeCode: string; awayCode: string; startsAt: string; venue?: string | null }>
  ) => {
    setSeeding(true);
    try {
      let created = 0;
      let skipped = 0;
      for (const m of rows) {
        const exists = matches.some(
          (x) =>
            x.category === category &&
            (x.homeCode ?? "") === m.homeCode &&
            (x.awayCode ?? "") === m.awayCode &&
            x.startsAt &&
            new Date(x.startsAt).toISOString() === new Date(m.startsAt).toISOString()
        );
        if (exists) {
          skipped++;
          continue;
        }
        const r = await fetch("/api/admin/matches", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: m.title,
            opponent: null,
            startsAt: m.startsAt,
            venue: m.venue ?? null,
            category,
            homeCode: m.homeCode,
            awayCode: m.awayCode,
            published: true,
          }),
        });
        if (r.ok) created++;
      }
      await reloadMatches();
      if (created === 0 && skipped > 0) toast.message(`${label}: všechny zápasy už existují.`);
      else toast.success(`${label}: přidáno ${created}${skipped ? `, přeskočeno ${skipped}` : ""}.`);
    } catch {
      toast.error("Seed selhal.");
    } finally {
      setSeeding(false);
    }
  };

  const seedCzeBhg = () => void seedSet("BHG (Česko)", "beijir", CZE_BHG_2026);
  const seedCzeMs2026 = () => void seedSet("MS 2026 (Česko)", "ms2026", CZE_MS2026);

  const cleanupNonCzeBhg = async () => {
    if (!window.confirm("Smazat všechny BHG zápasy, kde nehraje Česko?")) return;
    try {
      const r = await fetch("/api/admin/matches/bulk-delete", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "non-czech", category: "beijir" }),
      });
      const data: unknown = await r.json().catch(() => ({}));
      if (!r.ok) {
        toast.error(readAdminJsonError(data) ?? "Mazání selhalo.");
        return;
      }
      const deleted = (data as { deleted?: number }).deleted ?? 0;
      toast.success(deleted > 0 ? `Smazáno: ${deleted}.` : "Žádné nečeské BHG zápasy.");
      await reloadMatches();
    } catch {
      toast.error("Mazání selhalo.");
    }
  };

  const deleteActiveMatch = async () => {
    if (!activeId || !active) return;
    if (!window.confirm(`Opravdu smazat zápas „${active.title}“? Smaže i sestavu a hodnocení.`)) return;
    const r = await fetch(`/api/admin/matches/${encodeURIComponent(activeId)}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data: unknown = await r.json().catch(() => ({}));
    if (!r.ok) {
      toast.error(readAdminJsonError(data) ?? "Mazání selhalo.");
      return;
    }
    toast.success("Zápas smazán.");
    await reloadMatches();
  };

  const toggleRatingsOpen = async (next: boolean) => {
    if (!activeId) return;
    setTogglingRatings(true);
    try {
      const r = await fetch(`/api/admin/matches/${encodeURIComponent(activeId)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ratingsOpen: next }),
      });
      const data: unknown = await r.json().catch(() => ({}));
      if (!r.ok) {
        toast.error(readAdminJsonError(data) ?? "Změna selhala.");
        return;
      }
      setRatingsOpen(next);
      toast.success(next ? "Hodnocení spuštěno." : "Hodnocení zastaveno.");
      await reloadMatches();
    } finally {
      setTogglingRatings(false);
    }
  };

  const saveOfficial = async () => {
    if (!activeId) return;
    setSaving(true);
    try {
      const r = await fetch(`/api/admin/matches/${encodeURIComponent(activeId)}/official-lineup`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lineupStructure: lineup,
          captainId,
          defenseCount,
          allowExtraForward,
          published,
        }),
      });
      const data: unknown = await r.json().catch(() => ({}));
      if (!r.ok) {
        toast.error(readAdminJsonError(data) ?? "Uložení selhalo.");
        return;
      }
      toast.success("Uloženo.");
      await reloadMatches();
    } finally {
      setSaving(false);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={poolToSlotCollision}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="min-h-screen bg-[#05080f] text-white">
        <SestavaAmbientBackground />
        <div className="sticky top-0 z-40">
          <SiteHeader />
        </div>

        <main className="relative z-10 mx-auto max-w-[90rem] px-4 py-6">
        <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <h1 className="font-display text-2xl font-black">Admin — zápasy</h1>
          <p className="mt-1 text-sm text-white/60">Vytvoř zápas, naklikej oficiální sestavu a publikuj.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,8fr)_minmax(0,12fr)] lg:items-start">
          <section className="min-h-0 min-w-0 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h2 className="font-display text-lg font-black">Zápasy</h2>
            <p className="mt-2 text-[11px] leading-snug text-white/45">
              V horním výběru přepínáš <span className="text-white/60">už vytvořený zápas</span>. Úprava oficiální sestavy je v{" "}
              <span className="text-white/60">pravém sloupci</span> (nad webem vedle této kartičky). Formulář „Nový zápas“ jen
              přidá další řádek do databáze.
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <select
                value={activeId}
                onChange={(e) => setActiveId(e.target.value)}
                aria-label="Vybraný zápas"
                disabled={matches.length === 0}
                className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {matches.length === 0 ? (
                  <option value="">Žádný zápas — naplň seznam níže</option>
                ) : null}
                {matches.map((m) => {
                  const cat = m.category === "ms2026" ? "MS 2026" : "BHG";
                  const date = m.startsAt
                    ? new Date(m.startsAt).toLocaleDateString("cs-CZ", {
                        day: "2-digit",
                        month: "2-digit",
                      })
                    : "—";
                  const flags = [
                    m.published ? "public" : "skryto",
                    m.hasOfficialLineup ? "sestava" : null,
                    m.ratingsOpen ? "★ HODNOCENÍ" : null,
                  ]
                    .filter(Boolean)
                    .join(" • ");
                  return (
                    <option key={m.id} value={m.id}>
                      [{cat}] {date} · {m.title} — {flags}
                    </option>
                  );
                })}
              </select>

              {active ? (
                <div className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/70">
                  <div className="min-w-0">
                    <div>
                      Slug: <span className="font-mono text-white/90">{active.slug}</span>
                    </div>
                    <div className="mt-1 text-white/55">
                      Kategorie:{" "}
                      <span className="font-semibold text-white/80">
                        {active.category === "ms2026" ? "MS 2026" : "Beijer Hockey Games"}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void deleteActiveMatch()}
                    className="shrink-0 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-200 hover:bg-red-500/20"
                  >
                    Smazat zápas
                  </button>
                </div>
              ) : null}

              <div className="mt-2 rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/50">Nový zápas</p>
                <p className="mt-1.5 text-[11px] leading-snug text-white/45">
                  <span className="text-white/55">HOME / AWAY</span> — trojpísmenné kódy pro vlajky a přehled (CZE, SWE…).
                  Bez vyplněného názvu se použije automaticky styl „HOME — AWAY“.
                  <span className="text-white/55"> Soupeř</span> je volitelný text pod datumem na veřejné stránce (vedle „Místo“);{" "}
                  <em>není</em> to náhrada za pole AWAY. Čas zadej v ISO se zónou (+02:00), nebo ho nechte prázdný.
                </p>
                <div className="mt-2 grid gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value === "ms2026" ? "ms2026" : "beijir")}
                      className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm font-semibold text-white"
                      aria-label="Kategorie"
                    >
                      <option value="beijir">Beijer Hockey Games</option>
                      <option value="ms2026">MS 2026</option>
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        value={newHome}
                        onChange={(e) => setNewHome(e.target.value)}
                        className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm font-semibold text-white"
                        placeholder="HOME (CZE)"
                      />
                      <input
                        value={newAway}
                        onChange={(e) => setNewAway(e.target.value)}
                        className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm font-semibold text-white"
                        placeholder="AWAY (SWE)"
                      />
                    </div>
                  </div>
                  <input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
                    placeholder="Název (volitelné, jinak HOME - AWAY)"
                  />
                  <input
                    value={newOpponent}
                    onChange={(e) => setNewOpponent(e.target.value)}
                    className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
                    placeholder="Doplňující text „soupeř“ na webu (volitelné)"
                  />
                  <input
                    value={newVenue}
                    onChange={(e) => setNewVenue(e.target.value)}
                    className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
                    placeholder="Místo (volitelné)"
                  />
                  <input
                    value={newStartsAt}
                    onChange={(e) => setNewStartsAt(e.target.value)}
                    className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
                    placeholder="Start ISO (např. 2026-05-12T20:20:00+02:00)"
                  />
                  <button
                    type="button"
                    disabled={creating}
                    onClick={() => void createMatch()}
                    className="rounded-xl bg-gradient-to-r from-[#003087] to-[#c8102e] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {creating ? "…" : "Vytvořit"}
                  </button>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/50">Rychlé přidání</p>
                <div className="mt-2 grid gap-2">
                  <button
                    type="button"
                    disabled={seeding}
                    onClick={seedCzeBhg}
                    className="rounded-xl border border-white/12 bg-white/[0.06] px-4 py-2.5 text-sm font-black text-white/90 hover:bg-white/[0.1] disabled:opacity-50"
                  >
                    {seeding ? "Přidávám…" : "Naplnit BHG — Česko (3 zápasy, 7.–10. 5. 2026)"}
                  </button>
                  <button
                    type="button"
                    disabled={seeding}
                    onClick={seedCzeMs2026}
                    className="rounded-xl border border-white/12 bg-white/[0.06] px-4 py-2.5 text-sm font-black text-white/90 hover:bg-white/[0.1] disabled:opacity-50"
                  >
                    {seeding ? "Přidávám…" : "Naplnit MS 2026 — Česko (7 zápasů, Fribourg, sk. B)"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void cleanupNonCzeBhg()}
                    className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-100/95 hover:bg-amber-500/15"
                  >
                    Smazat BHG zápasy bez Česka (uklidí starý seed)
                  </button>
                </div>
                <p className="mt-2 text-[11px] leading-snug text-white/50">
                  Tlačítka jen vytvoří/přidají zápasy v DB. Oficiální soupisku nakliknu v pravém sloupci a hodnocení
                  spustím tlačítkem „Spustit hodnocení“ až po zápase (nebo kdykoli si řeknu).
                </p>
              </div>
            </div>
          </section>

          <section className="min-h-0 min-w-0 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-display text-lg font-black">
                    Oficiální sestava
                    {active ? <span className="ml-2 text-sm font-semibold text-white/55">— {active.title}</span> : null}
                  </h2>
                  <p className="mt-0.5 text-[11px] text-white/45">
                    Stav hodnocení:{" "}
                    {ratingsOpen ? (
                      <span className="font-bold text-emerald-300">otevřené pro uživatele</span>
                    ) : (
                      <span className="font-bold text-white/55">zavřené</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                    />
                    Publikovat
                  </label>
                  <button
                    type="button"
                    disabled={!activeId || togglingRatings}
                    onClick={() => void toggleRatingsOpen(!ratingsOpen)}
                    className={`rounded-xl px-3 py-2 text-xs font-black uppercase tracking-wide transition disabled:opacity-50 ${
                      ratingsOpen
                        ? "border border-amber-400/40 bg-amber-400/15 text-amber-100 hover:bg-amber-400/25"
                        : "border border-emerald-400/40 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/25"
                    }`}
                  >
                    {togglingRatings ? "…" : ratingsOpen ? "Zastavit hodnocení" : "Spustit hodnocení"}
                  </button>
                </div>
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-2 lg:items-start">
                <div className="min-h-0 min-w-0 rounded-2xl border border-white/10 bg-black/20 p-3 lg:max-h-[calc(100dvh-11.5rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-1">
                  <PlayerPoolPanel
                    players={players}
                    usedIds={usedIds}
                    counts={counts}
                    onAddPlayer={(p) => {
                      if (selectedSlot) {
                        const overId =
                          selectedSlot.type === "goalie"
                            ? `slot-goalie-${selectedSlot.lineIndex ?? 0}`
                            : selectedSlot.type === "extraForward"
                              ? "slot-xf-0"
                              : selectedSlot.type === "defense"
                                ? `slot-def-${selectedSlot.lineIndex ?? 0}-${selectedSlot.role ?? "lb"}`
                                : `slot-fwd-${selectedSlot.lineIndex ?? 0}-${selectedSlot.role ?? "lw"}`;
                        const target = parseDroppableId(overId);
                        const next = target ? assignPlayerToTarget(lineup, p, target, { mode: "match" }) : null;
                        if (next) setLineup(next);
                        setSelectedSlot(null);
                        return;
                      }
                      const next = tryAutoAssignPlayer(lineup, p, { mode: "match" });
                      if (next) setLineup(next);
                    }}
                    onPreview={setPreviewPlayer}
                    enableDnd
                    forcedPosition={forcedPoolPosition}
                  />
                </div>
                <div className="min-h-0 min-w-0 rounded-2xl border border-white/10 bg-black/20 p-3 lg:max-h-[calc(100dvh-11.5rem)] lg:overflow-y-auto lg:overscroll-contain lg:pl-1">
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
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  disabled={saving || !activeId}
                  onClick={() => void saveOfficial()}
                  className="rounded-xl bg-gradient-to-r from-[#c8102e] to-[#003087] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                >
                  {saving ? "Ukládám…" : "Uložit"}
                </button>
              </div>
            </div>
          </section>
        </div>
        </main>

        <PlayerPreviewModal player={previewPlayer} onClose={() => setPreviewPlayer(null)} />
      </div>

      <DragOverlay dropAnimation={null}>
        {poolDragPlayer ? (
          <div className="pointer-events-none flex max-w-[min(100vw-2rem,18rem)] items-center gap-2 rounded-xl border border-[#f1c40f]/60 bg-black/85 px-3 py-2.5 shadow-xl">
            <PlayerAvatar
              name={poolDragPlayer.name}
              position={poolDragPlayer.position}
              role={poolDragPlayer.role}
              imageUrl={poolDragPlayer.imageUrl}
              size="md"
            />
            <span className="truncate text-sm font-bold text-white">{poolDragPlayer.name}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

