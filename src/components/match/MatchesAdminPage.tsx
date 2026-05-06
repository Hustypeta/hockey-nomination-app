"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { LineupStructure, Player } from "@/types";
import { EMPTY_LINEUP } from "@/types";
import { LineBuilder } from "@/components/LineBuilder";
import { PlayerPoolPanel } from "@/components/sestava/PlayerPoolPanel";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SestavaAmbientBackground } from "@/components/sestava/SestavaAmbientBackground";
import { PlayerPreviewModal } from "@/components/sestava/PlayerPreviewModal";
import type { Position } from "@/types";
import { assignPlayerToTarget, tryAutoAssignPlayer } from "@/lib/lineupAssign";
import { parseDroppableId } from "@/lib/dndSlotIds";

type MatchRow = {
  id: string;
  slug: string;
  title: string;
  opponent: string | null;
  startsAt: string | null;
  venue: string | null;
  published: boolean;
};

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

  const [lineup, setLineup] = useState<LineupStructure>(EMPTY_LINEUP);
  const [captainId, setCaptainId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ type: string; lineIndex?: number; role?: string } | null>(null);
  const [defenseCount, setDefenseCount] = useState<6 | 7 | 8>(8);
  const [allowExtraForward, setAllowExtraForward] = useState(false);
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);

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
    const data = (await r.json().catch(() => ({}))) as any;
    if (!r.ok) {
      toast.error(typeof data.error === "string" ? data.error : "Nelze načíst zápasy.");
      return;
    }
    const list = Array.isArray(data.matches) ? (data.matches as any[]) : [];
    setMatches(
      list.map((m) => ({
        id: m.id,
        slug: m.slug,
        title: m.title,
        opponent: m.opponent ?? null,
        startsAt: m.startsAt ? new Date(m.startsAt).toISOString() : null,
        venue: m.venue ?? null,
        published: Boolean(m.published),
      }))
    );
    if (!activeId && list[0]?.id) setActiveId(String(list[0].id));
  }

  async function loadMatch(id: string) {
    const r = await fetch(`/api/admin/matches/${encodeURIComponent(id)}/official-lineup`, {
      credentials: "include",
      cache: "no-store",
    });
    const data = (await r.json().catch(() => ({}))) as any;
    if (!r.ok) {
      toast.error(typeof data.error === "string" ? data.error : "Nelze načíst zápas.");
      return;
    }
    const m = data.match;
    setPublished(Boolean(m.published));
    const off = m.officialLineup;
    if (off?.lineupStructure) setLineup(off.lineupStructure as LineupStructure);
    else setLineup(EMPTY_LINEUP);
    setCaptainId(typeof off?.captainId === "string" ? off.captainId : null);
    setDefenseCount((off?.defenseCount as 6 | 7 | 8) ?? 8);
    setAllowExtraForward(Boolean(off?.allowExtraForward));
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await fetch("/api/players");
      const data = (await r.json().catch(() => [])) as any;
      if (!cancelled) setPlayers(Array.isArray(data) ? (data as Player[]) : []);
      await reloadMatches();
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeId) return;
    void loadMatch(activeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  const createMatch = async () => {
    if (!newTitle.trim()) {
      toast.error("Doplň název zápasu.");
      return;
    }
    setCreating(true);
    try {
      const r = await fetch("/api/admin/matches", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          opponent: newOpponent.trim() || null,
          startsAt: newStartsAt.trim() || null,
          venue: newVenue.trim() || null,
          published: false,
        }),
      });
      const data = (await r.json().catch(() => ({}))) as any;
      if (!r.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Vytvoření selhalo.");
        return;
      }
      toast.success("Zápas vytvořen.");
      setNewTitle("");
      setNewOpponent("");
      setNewStartsAt("");
      setNewVenue("");
      await reloadMatches();
      if (data.match?.id) setActiveId(String(data.match.id));
    } finally {
      setCreating(false);
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
      const data = (await r.json().catch(() => ({}))) as any;
      if (!r.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Uložení selhalo.");
        return;
      }
      toast.success("Uloženo.");
      await reloadMatches();
    } finally {
      setSaving(false);
    }
  };

  return (
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

        <div className="grid gap-6 lg:grid-cols-[minmax(0,8fr)_minmax(0,12fr)]">
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h2 className="font-display text-lg font-black">Zápasy</h2>
            <div className="mt-3 flex flex-col gap-2">
              <select
                value={activeId}
                onChange={(e) => setActiveId(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
              >
                {matches.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} {m.published ? "• public" : ""}
                  </option>
                ))}
              </select>

              {active ? (
                <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/70">
                  Slug: <span className="font-mono text-white/90">{active.slug}</span>
                </div>
              ) : null}

              <div className="mt-2 rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/50">Nový zápas</p>
                <div className="mt-2 grid gap-2">
                  <input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
                    placeholder="Název (např. Česko vs Kanada)"
                  />
                  <input
                    value={newOpponent}
                    onChange={(e) => setNewOpponent(e.target.value)}
                    className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
                    placeholder="Soupeř (volitelné)"
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
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-lg font-black">Oficiální sestava</h2>
                <label className="flex items-center gap-2 text-sm text-white/70">
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                  />
                  Publikovat
                </label>
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
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
                        const next = target ? assignPlayerToTarget(lineup, p, target) : null;
                        if (next) setLineup(next);
                        setSelectedSlot(null);
                        return;
                      }
                      const next = tryAutoAssignPlayer(lineup, p);
                      if (next) setLineup(next);
                    }}
                    onPreview={setPreviewPlayer}
                    enableDnd={false}
                    forcedPosition={forcedPoolPosition}
                  />
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
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
  );
}

