"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { PlayerPreviewModal } from "@/components/sestava/PlayerPreviewModal";
import { PlayerPoolPanel } from "@/components/sestava/PlayerPoolPanel";
import { FloatingSestavaBar } from "@/components/sestava/FloatingSestavaBar";
import { LineBuilder } from "@/components/LineBuilder";
import type { LineupStructure, Player, Position } from "@/types";
import { EMPTY_LINEUP } from "@/types";
import { normalizeLineupStructure } from "@/lib/lineupUtils";
import {
  tryAutoAssignPlayer,
  assignPlayerToTarget,
  buildRandomMatchLineup,
  lineupPlayerIds,
} from "@/lib/lineupAssign";
import { droppableIdFromSelectedSlot, parseDroppableId } from "@/lib/dndSlotIds";
import { powerPlaySlotPickerLabel } from "@/lib/powerPlayLineup";
import { DndContext, DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { poolToSlotCollision } from "@/lib/dndCollision";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useUndoableState } from "@/hooks/useUndoableState";
import { initJerseyNameDisambiguation } from "@/lib/jerseyDisplayName";
import { AppLoadingScreen } from "@/components/AppLoadingScreen";
import { MatchLineupSaveShareModal } from "@/components/match/MatchLineupSaveShareModal";

function isMatchLineupValid(
  lineup: LineupStructure,
  opts: { defenseCount: 6 | 7 | 8; allowExtraForward: boolean }
): boolean {
  const ls = normalizeLineupStructure(lineup, { mode: "match" });
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
  const searchParams = useSearchParams();
  const loadEditCode = useMemo(() => {
    const k = searchParams.get("kod") ?? searchParams.get("code");
    const t = k?.trim();
    return t && t.length > 0 ? t : null;
  }, [searchParams]);

  const { status: authStatus } = useSession();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  /** Dokud není načten draft z ?kod=, neukazovat editor (žádný „flash“ prázdné sestavy). */
  const needDraftImport = Boolean(loadEditCode);
  const [draftImportReady, setDraftImportReady] = useState(!needDraftImport);
  const isNarrowLayout = useMediaQuery("(max-width: 1023px)");
  const [lineupPosterModalOpen, setLineupPosterModalOpen] = useState(false);
  const [saveShareModalOpen, setSaveShareModalOpen] = useState(false);
  /** Široký layout (≥ lg): DnD z poolu zapnuté. Úzký: jen klepnutí, bez přetahování. */
  const enableDnd = !isNarrowLayout;

  const {
    state: lineup,
    set: setLineup,
    undo: undoLineup,
    replace: replaceLineup,
    canUndo,
  } = useUndoableState<LineupStructure>(EMPTY_LINEUP);
  const [captainId, setCaptainId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ type: string; lineIndex?: number; role?: string } | null>(null);
  const [previewPlayer, setPreviewPlayer] = useState<Player | null>(null);
  const mobilePlayerSheetOpen = isNarrowLayout && selectedSlot !== null;
  /** Na úzkém layoutu schovat pool, dokud se nevybere slot (pool je ve fullscreen sheetu). */
  const showDesktopPoolColumn = !isNarrowLayout || selectedSlot === null;

  const [defenseCount, setDefenseCount] = useState<6 | 7 | 8>(8);
  const [allowExtraForward, setAllowExtraForward] = useState(false);
  const [shareTitle, setShareTitle] = useState("Moje sestava na zápas");
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [shareSlug, setShareSlug] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [siteOrigin, setSiteOrigin] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } })
  );

  const [poolDragPlayer, setPoolDragPlayer] = useState<Player | null>(null);
  const usedIds = useMemo(() => lineupPlayerIds(lineup), [lineup]);

  const counts = useMemo(() => {
    const g = (lineup.goalies[0] ? 1 : 0) + (lineup.goalies[1] ? 1 : 0);
    const d = lineup.defensePairs.reduce((s, p) => s + (p.lb ? 1 : 0) + (p.rb ? 1 : 0), 0);
    const f = lineup.forwardLines.reduce((s, l) => s + (l.lw ? 1 : 0) + (l.c ? 1 : 0) + (l.rw ? 1 : 0), 0) +
      (allowExtraForward && lineup.extraForwards[0] ? 1 : 0);
    return { G: g, D: d, F: f };
  }, [lineup, allowExtraForward]);

  const mobilePoolTitle = useMemo(() => {
    if (!selectedSlot) return "Výběr hráče";
    if (selectedSlot.type === "powerPlay" && selectedSlot.role != null) {
      const ix = selectedSlot.lineIndex === 0 || selectedSlot.lineIndex === 1 ? selectedSlot.lineIndex : 0;
      return powerPlaySlotPickerLabel(ix, selectedSlot.role);
    }
    if (selectedSlot.type === "goalie") return "Brankář";
    if (selectedSlot.type === "defense") return "Obránce";
    if (selectedSlot.type === "forward" || selectedSlot.type === "extraForward") return "Útočník";
    return "Výběr hráče";
  }, [selectedSlot]);

  const mobilePoolHint = useMemo(() => {
    if (!selectedSlot) return "Klepni na hráče — doplní se vybraný slot.";
    if (selectedSlot.type === "powerPlay") {
      return "Přesilovka — útočník nebo obránce (ne brankář).";
    }
    return "Klepni na hráče — doplní se vybraný slot.";
  }, [selectedSlot]);

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
    setSiteOrigin(typeof window !== "undefined" ? window.location.origin : "");
  }, []);

  /** Načtení existující uložené sestavy z účtu (?kod=…) po načtení hráčů. */
  useEffect(() => {
    if (!needDraftImport) {
      setDraftImportReady(true);
      return;
    }
    if (loading) return;

    let cancelled = false;

    (async () => {
      try {
        const r = await fetch(`/api/match-share-links/${encodeURIComponent(loadEditCode!)}`);
        const data = (await r.json().catch(() => ({}))) as {
          error?: string;
          lineupStructure?: unknown;
          title?: string | null;
          captainId?: string | null;
          code?: string;
          slug?: string | null;
          defenseCount?: number;
          allowExtraForward?: boolean;
        };
        if (cancelled) return;
        if (!r.ok) {
          toast.error(data.error ?? "Nepodařilo se načíst uloženou sestavu.");
          return;
        }
        if (data.lineupStructure && typeof data.lineupStructure === "object") {
          const normalized = normalizeLineupStructure(data.lineupStructure as LineupStructure, {
            mode: "match",
          });
          replaceLineup(normalized);
        }
        if (typeof data.captainId === "string" || data.captainId === null) {
          setCaptainId(typeof data.captainId === "string" ? data.captainId : null);
        }
        if (data.defenseCount === 6 || data.defenseCount === 7 || data.defenseCount === 8) {
          setDefenseCount(data.defenseCount);
        }
        setAllowExtraForward(Boolean(data.allowExtraForward));
        if (typeof data.title === "string" && data.title.trim()) {
          setShareTitle(data.title.trim());
        }
        if (typeof data.code === "string") setShareCode(data.code);
        if (typeof data.slug === "string" && data.slug.length > 0) setShareSlug(data.slug);
        toast.success("Sestava načtena — můžeš ji upravit.");
      } finally {
        if (!cancelled) setDraftImportReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [needDraftImport, loadEditCode, loading, replaceLineup]);

  useEffect(() => {
    if (!mobilePlayerSheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobilePlayerSheetOpen]);

  const handleRandom = () => {
    const next = buildRandomMatchLineup(players, { defenseCount, allowExtraForward });
    if (!next) {
      toast.error("V databázi není dost hráčů pro náhodnou sestavu.");
      return;
    }
    setLineup(next);
    setCaptainId(null);
    setSelectedSlot(null);
    toast.success("Náhodná sestava je hotová — uprav si ji.");
  };

  const handleReset = () => {
    setLineup(EMPTY_LINEUP);
    setCaptainId(null);
    setSelectedSlot(null);
  };

  const handleUndo = () => {
    if (!canUndo) return;
    undoLineup();
    setSelectedSlot(null);
  };

  const onAddFromPool = (player: Player) => {
    if (selectedSlot) {
      const dndId = droppableIdFromSelectedSlot(selectedSlot);
      const target = dndId ? parseDroppableId(dndId) : null;
      if (target) {
        const next = assignPlayerToTarget(lineup, player, target, { mode: "match" });
        if (next) setLineup(next);
        else if (target.type === "powerPlay" && player.position === "G") {
          toast.error("Do přesilovky nejde zařadit brankáře.");
        }
      }
      setSelectedSlot(null);
      return;
    }
    const next = tryAutoAssignPlayer(lineup, player, { mode: "match" });
    if (!next) {
      toast.error("Už není volné místo pro tuto pozici, nebo je hráč už v sestavě.");
      return;
    }
    setLineup(next);
  };

  const handleDragStart = (e: DragStartEvent) => {
    const id = e.active.id.toString();
    if (typeof window !== "undefined") console.info("[dnd:match-builder] start", { activeId: id });
    if (!id.startsWith("drag-player-")) return;
    const pid = id.replace("drag-player-", "");
    setPoolDragPlayer(players.find((p) => p.id === pid) ?? null);
  };
  const handleDragEnd = (e: DragEndEvent) => {
    setPoolDragPlayer(null);
    const overId = e.over?.id?.toString();
    const activeId = e.active.id.toString();
    if (typeof window !== "undefined") console.info("[dnd:match-builder] end", { activeId, overId });
    if (!overId || !activeId.startsWith("drag-player-")) return;
    const pid = activeId.replace("drag-player-", "");
    const player = players.find((p) => p.id === pid);
    const target = parseDroppableId(overId);
    if (!player || !target) return;
    const next = assignPlayerToTarget(lineup, player, target, { mode: "match" });
    if (next) setLineup(next);
  };

  const handleDragCancel = () => setPoolDragPlayer(null);

  const valid = isMatchLineupValid(lineup, { defenseCount, allowExtraForward });

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    if (!shareSlug) return "";
    return `${window.location.origin}/m/${shareSlug}`;
  }, [shareSlug]);

  /**
   * Uloží sestavu a vrátí finální URL (pokud je vše OK). Volá se z tlačítka „Uložit"
   * i jako interní krok ze „Sdílet" (pokud nic není ještě uložené).
   */
  const saveShare = async (): Promise<string | null> => {
    if (!shareTitle.trim()) {
      toast.error("Doplň název sestavy.");
      return null;
    }
    if (!valid) {
      toast.error("Sestava není kompletní podle zvolených pravidel.");
      return null;
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
        toast.error(typeof err === "string" ? err : "Uložení selhalo.");
        return null;
      }
      const nextCode = (data as { code?: unknown } | null)?.code;
      const nextSlug = (data as { slug?: unknown } | null)?.slug;
      const nextUrl = (data as { url?: unknown } | null)?.url;
      const finalCode = typeof nextCode === "string" ? nextCode : shareCode;
      const finalSlug = typeof nextSlug === "string" ? nextSlug : shareSlug;
      setShareCode(finalCode);
      setShareSlug(finalSlug);
      toast.success("Sestava uložena.");
      if (typeof nextUrl === "string" && nextUrl) return nextUrl;
      if (finalSlug && typeof window !== "undefined") {
        return `${window.location.origin}/m/${finalSlug}`;
      }
      return null;
    } finally {
      setSaving(false);
    }
  };

  /** Zkopíruje URL do schránky (nebo otevře native share API). Pokud sestava ještě
   *  není uložená, nejdřív ji uloží. */
  const handleShare = async () => {
    let url: string | null = shareUrl || null;
    if (!url) {
      url = await saveShare();
      if (!url) return;
    }
    /** Native Web Share API (mobile) je preferovaný — desktop fallne na clipboard. */
    const nav = typeof navigator !== "undefined" ? navigator : null;
    if (nav && typeof nav.share === "function") {
      try {
        await nav.share({
          title: shareTitle.trim() || "Sestava na zápas",
          text: shareTitle.trim() || "Moje sestava na zápas",
          url,
        });
        return;
      } catch {
        /** uživatel sdílení zrušil — zkusíme aspoň clipboard. */
      }
    }
    try {
      await nav?.clipboard?.writeText(url);
      toast.success("Odkaz zkopírován do schránky.");
    } catch {
      toast.error("Nepodařilo se zkopírovat. Zkopíruj ho ručně níže.");
    }
  };

  if (loading || (needDraftImport && !draftImportReady)) {
    return (
      <AppLoadingScreen
        tagline="Editor sestavy"
        message={
          loading
            ? "Načítám editor zápasové sestavy…"
            : "Načítám uloženou sestavu…"
        }
        intro={null}
      />
    );
  }

  const forcedPoolPosition: Position | null = selectedSlot
    ? selectedSlot.type === "goalie"
      ? "G"
      : selectedSlot.type === "powerPlay"
        ? null
        : selectedSlot.type === "defense"
          ? "D"
          : "F"
    : null;

  const content = (
    <div className="sestava-page-ambient min-h-screen pb-[calc(10.75rem+env(safe-area-inset-bottom,0px))] text-white sm:pb-[calc(11rem+env(safe-area-inset-bottom,0px))] lg:pb-[calc(9rem+env(safe-area-inset-bottom,0px))]">
      <div className="sticky top-0 z-40">
        <SiteHeader />
      </div>

      <main className="relative z-10 mx-auto max-w-[90rem] px-3 py-5 sm:px-5 lg:px-6">
        <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-black">Editor sestavy</h1>
              <p className="mt-1 text-sm text-white/60">
                Fanouškovský editor (sdílení jako u nominace). {authStatus === "authenticated" ? "Přihlášeno." : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,10fr)_minmax(0,14fr)] lg:gap-7">
          {showDesktopPoolColumn ? (
            <section className="min-w-0 hidden lg:block">
              <div
                className={`rounded-2xl border border-white/10 bg-white/[0.03] p-4 ${
                  isNarrowLayout ? "" : "backdrop-blur-sm"
                }`}
              >
                <PlayerPoolPanel
                  players={players}
                  usedIds={usedIds}
                  counts={counts}
                  onAddPlayer={onAddFromPool}
                  onPreview={setPreviewPlayer}
                  enableDnd={enableDnd}
                  forcedPosition={forcedPoolPosition}
                  simplePickList
                />
              </div>
            </section>
          ) : null}

          <section className="min-w-0">
            <div className="lg:sticky lg:top-[10rem] lg:max-h-[calc(100vh-10.5rem)] lg:overflow-y-auto lg:pb-2 lg:pl-0.5 lg:self-start xl:top-[10.5rem] xl:max-h-[calc(100vh-11rem)]">
              <div
                className={`rounded-2xl border border-white/10 bg-white/[0.03] p-4 ${
                  isNarrowLayout ? "" : "backdrop-blur-sm"
                }`}
              >
                <LineBuilder
                  mode="match"
                  lineup={lineup}
                  players={players}
                  captainId={captainId}
                  onLineupChange={setLineup}
                  onCaptainChange={setCaptainId}
                  selectedSlot={selectedSlot}
                  onSelectSlot={setSelectedSlot}
                  enableDnd={enableDnd}
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
            </div>
          </section>
        </div>

        {/* Mobile fullscreen pool sheet — stejný princip jako v editoru nominace
            (fullscreen flex sloupec, ne částečně visící panel — iOS Safari má pak spolehlivý scroll). */}
        {mobilePlayerSheetOpen ? (
          <div
            className="fixed inset-0 z-[52] flex h-[100dvh] max-h-[100dvh] min-h-0 flex-col overflow-hidden bg-[#05080f] lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-match-pool-title"
          >
            <div className="flex shrink-0 items-center gap-2 border-b border-white/10 px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
              <button
                type="button"
                onClick={() => setSelectedSlot(null)}
                className="flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.06] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
              >
                <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
                Zpět k sestavě
              </button>
              <h2
                id="mobile-match-pool-title"
                className="min-w-0 flex-1 truncate text-center font-sans text-sm font-bold text-white sm:text-base"
                title={mobilePoolTitle}
              >
                {mobilePoolTitle}
              </h2>
              <span className="w-[5.5rem] shrink-0" aria-hidden />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pt-2 pb-6 sm:px-4">
              <div
                className={`rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 sm:p-4 ${
                  isNarrowLayout ? "" : "backdrop-blur-sm"
                }`}
              >
                <p className="mb-3 text-[11px] leading-snug text-white/55">{mobilePoolHint}</p>
                {/* Tap-only varianta: na mobile sheetu vypneme drag, jinak by celá karta
                    dostala `touch-action: none` a uvnitř by nešlo scrollovat. */}
                <PlayerPoolPanel
                  players={players}
                  usedIds={usedIds}
                  counts={counts}
                  onAddPlayer={onAddFromPool}
                  onPreview={setPreviewPlayer}
                  enableDnd={enableDnd}
                  forcedPosition={forcedPoolPosition}
                  simplePickList
                />
              </div>
            </div>
            <div className="relative z-[2] flex shrink-0 justify-center border-t border-white/[0.12] bg-[#05080f] px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shadow-[0_-12px_32px_rgba(0,0,0,0.45)] sm:px-4">
              <button
                type="button"
                onClick={() => setSelectedSlot(null)}
                className="flex w-full min-w-0 max-w-md min-h-[3rem] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#003087]/90 to-[#002056] px-3 py-3.5 text-sm font-bold text-white shadow-lg shadow-black/40 touch-manipulation active:scale-[0.99]"
              >
                <ArrowLeft className="h-5 w-5 shrink-0" aria-hidden />
                <span className="min-w-0 truncate">
                  <span className="sm:hidden">Hotovo</span>
                  <span className="hidden sm:inline">Hotovo — zpět do sestavy</span>
                </span>
              </button>
            </div>
          </div>
        ) : null}
      </main>

      <DragOverlay dropAnimation={null}>
        {poolDragPlayer ? (
          <div className="pointer-events-none flex max-w-[20rem] items-center gap-3 rounded-2xl border border-white/15 bg-black/80 px-4 py-3">
            <span className="font-bold">{poolDragPlayer.name}</span>
          </div>
        ) : null}
      </DragOverlay>

      <PlayerPreviewModal player={previewPlayer} onClose={() => setPreviewPlayer(null)} />

      <FloatingSestavaBar
        onShare={() => setSaveShareModalOpen(true)}
        onRandom={handleRandom}
        onReset={handleReset}
        onUndo={handleUndo}
        undoDisabled={!canUndo}
        shareDisabled={saving || !valid}
        shareLabel={saving ? "Ukládám…" : shareUrl ? "Sdílet" : "Uložit & sdílet"}
        className={mobilePlayerSheetOpen ? "max-lg:hidden" : ""}
      />

      <MatchLineupSaveShareModal
        open={saveShareModalOpen}
        onClose={() => setSaveShareModalOpen(false)}
        shareTitle={shareTitle}
        onShareTitleChange={setShareTitle}
        shareUrl={shareUrl}
        saving={saving}
        valid={valid}
        onSave={saveShare}
        onShareLink={handleShare}
        posterModalOpen={lineupPosterModalOpen}
        onPosterModalOpenChange={setLineupPosterModalOpen}
        lineup={lineup}
        players={players}
        defenseCount={defenseCount}
        allowExtraForward={allowExtraForward}
        shareSlug={shareSlug}
        siteOrigin={siteOrigin}
      />
    </div>
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={poolToSlotCollision}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {content}
    </DndContext>
  );
}

