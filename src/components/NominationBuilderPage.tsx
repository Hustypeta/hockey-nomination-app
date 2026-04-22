"use client";

import { useSession } from "next-auth/react";
import type { PosterLetterboxTheme } from "@/lib/captureSharePoster";
import { SHARE_POSTER_WIDTH_PX } from "@/lib/sharePosterLayout";
import { useRouter, useSearchParams } from "next/navigation";
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
import confetti from "canvas-confetti";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { LineBuilder } from "@/components/LineBuilder";
import { Nhl25SharePoster } from "@/components/Nhl25SharePoster";
import { NamesOnlySharePoster } from "@/components/NamesOnlySharePoster";
import { SaveShareModal } from "@/components/SaveShareModal";
import { AppLoadingScreen } from "@/components/AppLoadingScreen";
import { SestavaAmbientBackground } from "@/components/sestava/SestavaAmbientBackground";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PlayerPoolPanel } from "@/components/sestava/PlayerPoolPanel";
import { SestavaHero } from "@/components/sestava/SestavaHero";
import { FloatingSestavaBar } from "@/components/sestava/FloatingSestavaBar";
import { PlayerPreviewModal } from "@/components/sestava/PlayerPreviewModal";
import { PlayerAvatar } from "@/components/sestava/PlayerAvatar";
import { encodeSharePayload } from "@/lib/sharePayload";
import {
  lineupToPlayers,
  isLineupComplete,
  isLeadershipComplete,
  normalizeLineupStructure,
} from "@/lib/lineupUtils";
import { useContestStats } from "@/hooks/useContestStats";
import { useMediaQuery } from "@/hooks/useMediaQuery";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status: authStatus, data: session } = useSession();
  const isAuthenticated = authStatus === "authenticated";
  const wmFromSession =
    session?.user?.name?.trim() || session?.user?.email?.split("@")[0]?.trim() || "";
  const shareWatermarkLabel =
    authStatus === "authenticated" && wmFromSession ? wmFromSession : null;
  const [sharePosterTheme, setSharePosterTheme] = useState<PosterLetterboxTheme>("light");
  const [sharePosterVariant, setSharePosterVariant] = useState<"jerseys" | "names">("jerseys");
  const [savedNominationSlug, setSavedNominationSlug] = useState<string | null>(null);
  const [guestShareCode, setGuestShareCode] = useState<string | null>(null);
  /** Veřejná část URL /v/{slug} z hostovského sdílení (stejný tvar jako u uložené nominace). */
  const [guestShareSlug, setGuestShareSlug] = useState<string | null>(null);
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
  const {
    refresh: refreshContestStats,
    contestSubmissionOpen,
    contestTimeBonusPercent: contestBonusRaw,
  } = useContestStats();
  const [contestSubmitted, setContestSubmitted] = useState(false);
  const [contestConfirmOpen, setContestConfirmOpen] = useState(false);
  const [submitContestBusy, setSubmitContestBusy] = useState(false);
  /** Načteno z /sestava?nominace=… — uložení provede PUT místo nového POST. */
  const [editingNominationId, setEditingNominationId] = useState<string | null>(null);
  /** Název na plakátu a v modalu uložení (synchronizované). */
  const [shareNominationTitle, setShareNominationTitle] = useState("");

  const longGuestShareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/share?z=${encodeSharePayload({
      v: 1,
      captainId,
      lineupStructure: lineup,
    })}`;
  }, [captainId, lineup]);

  const shareUrlForModal = useMemo(() => {
    if (typeof window === "undefined") return "";
    const o = (siteOrigin && siteOrigin.length > 0 ? siteOrigin : window.location.origin).replace(/\/$/, "");
    if (savedNominationSlug) return `${o}/v/${savedNominationSlug}`;
    if (guestShareSlug) return `${o}/v/${guestShareSlug}`;
    if (editingNominationId) return `${o}/nominations/${editingNominationId}`;
    return "";
  }, [siteOrigin, guestShareSlug, savedNominationSlug, editingNominationId]);

  const [poolDragPlayer, setPoolDragPlayer] = useState<Player | null>(null);
  const isNarrowLayout = useMediaQuery("(max-width: 1023px)");
  const mobilePlayerSheetOpen = isNarrowLayout && selectedSlot !== null;
  /** Na úzkém layoutu schovat sloupec poolu jen při otevřeném výběru (pool je ve fullscreen sheetu). */
  const showDesktopPoolColumn = !isNarrowLayout || selectedSlot === null;

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
  const leadershipOk = useMemo(() => isLeadershipComplete(lineup, captainId), [lineup, captainId]);
  const canOpenShareModal = isComplete && leadershipOk;
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
    if (!shareNominationTitle.trim()) {
      setGuestShareCode(null);
      setGuestShareSlug(null);
    }
  }, [shareNominationTitle]);

  /** Hostovský záznam: /v/{slug} z názvu — vyžaduje plnou sestavu, C, 2× A a vyplněný název. */
  useEffect(() => {
    if (!modalOpen) return;
    if (savedNominationSlug) {
      setGuestShareCode(null);
      setGuestShareSlug(null);
      return;
    }
    if (!canOpenShareModal || !shareNominationTitle.trim()) return;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const payload = {
            captainId,
            lineupStructure: lineup,
            title: shareNominationTitle.trim(),
          };
          if (guestShareCode) {
            const res = await fetch(`/api/share-links/${guestShareCode}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            const data = (await res.json()) as { slug?: string };
            if (!cancelled && res.ok) {
              if (typeof data.slug === "string") setGuestShareSlug(data.slug);
              return;
            }
            if (!cancelled && res.status === 404) setGuestShareCode(null);
            else if (!cancelled) return;
          }
          const res = await fetch("/api/share-links", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const data = (await res.json()) as { code?: string; slug?: string };
          if (!cancelled && data.code) setGuestShareCode(data.code);
          if (!cancelled && typeof data.slug === "string") setGuestShareSlug(data.slug);
        } catch {
          /* ignore */
        }
      })();
    }, 450);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    modalOpen,
    savedNominationSlug,
    canOpenShareModal,
    guestShareCode,
    captainId,
    lineup,
    shareNominationTitle,
  ]);

  useEffect(() => {
    fetch("/api/players")
      .then((res) => res.json())
      .then((data) => setPlayers(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const raw = searchParams.get("nominace") ?? searchParams.get("nomination");
    const openShareAfterLoad = searchParams.get("sdilet") === "1";
    if (!raw?.trim()) return;
    const id = raw.trim();
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/nominations/${id}`);
        if (!res.ok) throw new Error("fetch");
        const data: {
          lineupStructure?: unknown;
          captainId?: string | null;
          title?: string | null;
          slug?: string | null;
        } = await res.json();
        if (cancelled) return;
        const ls = data.lineupStructure;
        if (ls && typeof ls === "object") {
          setLineup(normalizeLineupStructure(ls as LineupStructure));
          setCaptainId(typeof data.captainId === "string" ? data.captainId : null);
          setShareNominationTitle(typeof data.title === "string" ? data.title : "");
          setSavedNominationSlug(typeof data.slug === "string" ? data.slug : null);
          setEditingNominationId(id);
          toast.success("Nominace načtena do editoru.");
          if (openShareAfterLoad) setModalOpen(true);
        }
        router.replace("/sestava", { scroll: false });
      } catch {
        if (!cancelled) toast.error("Nominaci se nepodařilo načíst.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams, router]);

  useEffect(() => {
    if (authStatus !== "authenticated") {
      setContestSubmitted(false);
      return;
    }
    let cancelled = false;
    fetch("/api/contest/submission-status")
      .then((r) => r.json())
      .then((d: { submitted?: boolean }) => {
        if (!cancelled && d.submitted) setContestSubmitted(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [authStatus]);

  useEffect(() => {
    if (!mobilePlayerSheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobilePlayerSheetOpen]);

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

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const activeId = event.active.id.toString();
    if (!activeId.startsWith("drag-player-")) {
      setPoolDragPlayer(null);
      return;
    }
    const pid = activeId.replace("drag-player-", "");
    setPoolDragPlayer(players.find((p) => p.id === pid) ?? null);
  }, [players]);

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

  const handleDragCancel = useCallback(() => {
    setPoolDragPlayer(null);
  }, []);

  const handleRandom = useCallback(() => {
    const next = buildRandomLineup(players);
    if (!next) {
      toast.error("V databázi není dost hráčů (potřeba 3G + 8D + 14F).");
      return;
    }
    setLineup(next);
    setCaptainId(null);
    setSelectedSlot(null);
    setEditingNominationId(null);
    setShareNominationTitle("");
    setSavedNominationSlug(null);
    setGuestShareCode(null);
    setGuestShareSlug(null);
    toast.success("Náhodná nominace je hotová — uprav si ji, jak chceš.");
  }, [players]);

  const handleReset = useCallback(() => {
    setLineup(EMPTY_LINEUP);
    setCaptainId(null);
    setSelectedSlot(null);
    setEditingNominationId(null);
    setShareNominationTitle("");
    setSavedNominationSlug(null);
    setGuestShareCode(null);
    setGuestShareSlug(null);
    toast.message("Sestava byla resetována.");
  }, []);

  const handleSave = useCallback(
    async (opts?: { title?: string | null }): Promise<string | null> => {
    if (authStatus !== "authenticated") return null;
    setSaving(true);
    try {
      const updating = !!editingNominationId;
      const res = await fetch(
        updating ? `/api/nominations/${editingNominationId}` : "/api/nominations",
        {
          method: updating ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            selectedPlayerIds: selectedPlayers.map((p) => p.id),
            captainId,
            lineupStructure: lineup,
            title: opts && "title" in opts ? opts.title : shareNominationTitle.trim(),
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Chyba při ukládání");
        return null;
      }
      if (typeof data.slug === "string" && data.slug) {
        setSavedNominationSlug(data.slug);
      }
      toast.success(
        updating ? "Změny uloženy." : "Nominace uložena u účtu jako koncept."
      );
      return data.id ?? null;
    } catch {
      toast.error("Chyba při ukládání — zkus to znovu.");
      return null;
    } finally {
      setSaving(false);
    }
  },
  [authStatus, selectedPlayers, captainId, lineup, editingNominationId, shareNominationTitle]);

  const handleSubmitToContest = useCallback(async () => {
    if (authStatus !== "authenticated") {
      toast.error("Pro odeslání do soutěže se musíš přihlásit přes Google.");
      return;
    }
    if (contestSubmitted) {
      toast.message("Z tohoto účtu už je nominace do soutěže odeslaná.");
      return;
    }
    if (!isComplete) {
      toast.error("Nejdřív doplň celou nominaci (25 hráčů), pak můžeš odeslat do soutěže.");
      return;
    }
    if (!leadershipOk) {
      toast.error("Zvol kapitána (C) a přesně dva asistenty (A).");
      return;
    }
    if (!shareNominationTitle.trim()) {
      toast.error("Vyplň název nominace.");
      return;
    }
    if (!contestSubmissionOpen) {
      toast.error("Uzávěrka odeslání do soutěže už proběhla.");
      return;
    }
    setSubmitContestBusy(true);
    try {
      const res = await fetch("/api/contest/submit-nomination", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          selectedPlayerIds: selectedPlayers.map((p) => p.id),
          captainId,
          lineupStructure: lineup,
          title: shareNominationTitle.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Odeslání do soutěže se nepovedlo.");
        return;
      }
      const bp = data.timeBonusPercent as number | undefined;
      toast.success(
        typeof bp === "number" && bp > 0
          ? `Nominace je v soutěži — časový bonus +${bp} % k bodům.`
          : "Nominace je v soutěži."
      );
      setContestSubmitted(true);
      setContestConfirmOpen(false);
      refreshContestStats();
    } catch {
      toast.error("Spojení se serverem selhalo — zkus odeslat znovu za chvíli.");
    } finally {
      setSubmitContestBusy(false);
    }
  }, [
    authStatus,
    isComplete,
    leadershipOk,
    shareNominationTitle,
    contestSubmitted,
    contestSubmissionOpen,
    selectedPlayers,
    captainId,
    lineup,
    refreshContestStats,
  ]);

  const handleContestSubmitClick = useCallback(() => {
    if (!isComplete) {
      toast.error("Nejdřív doplň celou nominaci (25 hráčů), pak můžeš odeslat do soutěže.");
      return;
    }
    if (!leadershipOk) {
      toast.error("Zvol kapitána (C) a přesně dva asistenty (A).");
      return;
    }
    if (!shareNominationTitle.trim()) {
      toast.error("Vyplň název nominace (např. v modalu Dokončit nominaci).");
      return;
    }
    if (!contestSubmissionOpen) {
      toast.error("Uzávěrka odeslání do soutěže už proběhla.");
      return;
    }
    setContestConfirmOpen(true);
  }, [isComplete, leadershipOk, contestSubmissionOpen, shareNominationTitle]);

  if (loading) {
    return (
      <AppLoadingScreen message="Načítám hráče…" showSignInCta={authStatus !== "authenticated"} />
    );
  }

  const bonusPercent = [0, 10, 25, 40].includes(contestBonusRaw)
    ? (contestBonusRaw as ContestTimeBonusPercent)
    : (0 as ContestTimeBonusPercent);

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
      <div className="sestava-page-ambient min-h-screen pb-[10.75rem] text-white sm:pb-44 lg:pb-36">
        <SestavaAmbientBackground />

        <div className="sticky top-0 z-40">
          <SiteHeader />
          <SestavaHero filled={filled} />
        </div>

        <div className="relative z-10 mx-auto max-w-[90rem] px-3 pb-5 pt-2 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
          {isAuthenticated && (
            <div className="mb-3 rounded-xl border border-emerald-500/30 bg-emerald-950/25 px-3 py-2 text-center text-[11px] text-emerald-50/95 shadow-[0_0_24px_rgba(16,185,129,0.12)] sm:mb-4 sm:px-4 sm:py-2.5 sm:text-sm">
              {contestSubmitted ? (
                <>
                  Tvoje sestava už je <strong className="font-semibold">jednou odeslaná do soutěže</strong>. Koncepty
                  můžeš dál ukládat — přehled v{" "}
                  <a href="/ucet/nominace" className="font-semibold text-[#f1c40f] underline-offset-2 hover:underline">
                    Moje nominace
                  </a>
                  .
                </>
              ) : (
                <>
                  Jsi přihlášen — <strong className="font-semibold">Dokončit nominaci</strong> uloží koncept u účtu,{" "}
                  <strong className="font-semibold">Odeslat do soutěže</strong> (jednou) tě zařadí do vyhodnocení.{" "}
                  <a href="/ucet/nominace" className="font-semibold text-[#f1c40f] underline-offset-2 hover:underline">
                    Moje nominace
                  </a>
                </>
              )}
            </div>
          )}
          {!isComplete && (
            <div className="mb-3 rounded-xl border border-[#003087]/40 bg-gradient-to-r from-[#003087]/20 via-[#0f172a]/90 to-[#c8102e]/15 px-3 py-2 text-center text-[11px] text-slate-100 shadow-[0_0_32px_rgba(0,48,135,0.15)] sm:mb-4 sm:px-4 sm:py-2.5 sm:text-sm">
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
          {isComplete && !leadershipOk ? (
            <div className="mb-3 rounded-xl border border-amber-500/35 bg-amber-950/30 px-3 py-2 text-center text-[11px] text-amber-100/95 shadow-[0_0_28px_rgba(245,158,11,0.12)] sm:mb-4 sm:px-4 sm:py-2.5 sm:text-sm">
              Ještě zvol <strong className="font-semibold">kapitána</strong> (tlačítko C) a přesně{" "}
              <strong className="font-semibold">dva asistenty</strong> (A) u hráčů v soupisce — bez toho nominaci
              neuložíš ani nesdílíš.
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-[minmax(0,10fr)_minmax(0,14fr)] lg:gap-7 xl:gap-8">
            {showDesktopPoolColumn ? (
              <section className="min-w-0 hidden lg:block">
                <div className="sestava-premium-panel-dark rounded-2xl p-3.5 backdrop-blur-sm sm:p-5">
                  <div className="mb-4">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#c8102e]">
                        Výběr hráčů
                      </p>
                      <h2 className="mt-1 font-sans text-xl font-bold leading-snug tracking-normal text-white sm:text-2xl">
                        Dostupní hráči
                      </h2>
                      <p className="mt-1.5 max-w-prose text-[11px] leading-snug text-white/55 sm:text-xs sm:text-white/55">
                        Přetáhni kartu na slot vpravo, nebo klepni na jméno — doplní se první volné místo pro pozici.
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
                    assignableFilter={selectedSlot ? canAssignPlayer : undefined}
                    slotHint={
                      selectedSlot?.type === "extraDefenseman" && !lineup.defensePairs[3].lb
                        ? "Nejdřív doplň sedmého beka ve 4. obranném řádku — pak půjde vybrat náhradního obránce."
                        : null
                    }
                  />
                </div>
              </section>
            ) : null}

            <section className="min-w-0">
              <div className="lg:sticky lg:top-[10rem] lg:max-h-[calc(100vh-10.5rem)] lg:overflow-y-auto lg:pb-2 lg:pl-0.5 lg:self-start xl:top-[10.5rem] xl:max-h-[calc(100vh-11rem)]">
                <div className="nhl25-moje-sestava-panel rounded-2xl p-3 sm:p-5 lg:p-6">
                  <div className="nhl25-moje-sestava-accent mb-2 sm:mb-3" aria-hidden />
                  <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#003087]">
                    Soupiska
                  </p>
                  <h2 className="mt-1 font-sans text-xl font-bold leading-snug tracking-normal text-slate-900 sm:text-2xl">
                    Moje sestava
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

          {mobilePlayerSheetOpen ? (
            <div
              className="fixed inset-0 z-[52] flex flex-col bg-[#05080f] lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-labelledby="mobile-player-pool-title"
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
                  id="mobile-player-pool-title"
                  className="min-w-0 flex-1 truncate text-center font-sans text-base font-bold text-white"
                >
                  Výběr hráče
                </h2>
                <span className="w-[5.5rem] shrink-0" aria-hidden />
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-2 sm:px-4">
                <div className="sestava-premium-panel-dark rounded-2xl p-3.5 backdrop-blur-sm sm:p-4">
                  <p className="mb-3 text-[11px] leading-snug text-white/55">
                    Klepni na hráče — doplní se vybraný slot. Můžeš i přetáhnout na dres.
                  </p>
                  <PlayerPoolPanel
                    players={players}
                    usedIds={usedIds}
                    counts={counts}
                    onAddPlayer={handleAddFromPool}
                    onPreview={setPreviewPlayer}
                    forcedPosition={forcedPoolPosition}
                    assignableFilter={canAssignPlayer}
                    slotHint={
                      selectedSlot.type === "extraDefenseman" && !lineup.defensePairs[3].lb
                        ? "Nejdřív doplň sedmého beka ve 4. obranném řádku — pak půjde vybrat náhradního obránce."
                        : null
                    }
                  />
                </div>
              </div>
              <div className="fixed bottom-0 left-0 right-0 z-[53] flex justify-center border-t border-white/[0.1] bg-[#05080f]/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 lg:hidden">
                <button
                  type="button"
                  onClick={() => setSelectedSlot(null)}
                  className="flex w-full max-w-md items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#003087]/90 to-[#002056] py-3.5 text-sm font-bold text-white shadow-lg shadow-black/40"
                >
                  <ArrowLeft className="h-5 w-5 shrink-0" aria-hidden />
                  Hotovo — zpět do soupisky
                </button>
              </div>
            </div>
          ) : null}

          <div className="mt-6 hidden justify-center lg:flex">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              disabled={!canOpenShareModal}
              className={`
                rounded-2xl px-12 py-4 font-display text-xl font-bold tracking-wide transition-all
                ${
                  canOpenShareModal
                    ? "bg-gradient-to-r from-[#c8102e] via-[#a30d26] to-[#003087] text-white shadow-[0_12px_40px_rgba(200,16,46,0.35),0_0_0_1px_rgba(241,196,15,0.25)] ring-1 ring-white/20 hover:scale-[1.02] hover:shadow-[0_16px_48px_rgba(200,16,46,0.45)]"
                    : "cursor-not-allowed bg-white/[0.06] text-white/35 ring-1 ring-white/[0.08]"
                }
              `}
            >
              {isAuthenticated ? "Dokončit nominaci" : "Složit nominaci"}
            </button>
          </div>
        </div>

        <div className="relative z-10">
          <SiteFooter />
        </div>

        <FloatingSestavaBar
          onShare={() => setModalOpen(true)}
          onRandom={handleRandom}
          onReset={handleReset}
          shareDisabled={!canOpenShareModal}
          shareLabel={isAuthenticated ? "Dokončit nominaci" : "Složit nominaci"}
          showContestSubmit={isAuthenticated && !contestSubmitted}
          onContestSubmit={handleContestSubmitClick}
          contestSubmitBusy={submitContestBusy}
          contestSubmitInactive={
            !isComplete || !leadershipOk || !shareNominationTitle.trim() || !contestSubmissionOpen
          }
          className={mobilePlayerSheetOpen ? "max-lg:hidden" : ""}
        />

        <div
          className="pointer-events-none fixed left-0 top-0 z-[-1] -translate-x-full"
          style={{ width: SHARE_POSTER_WIDTH_PX, maxWidth: SHARE_POSTER_WIDTH_PX }}
          aria-hidden
        >
          {sharePosterVariant === "jerseys" ? (
            <Nhl25SharePoster
              ref={shareCaptureRef}
              players={players}
              lineup={lineup}
              captainId={captainId}
              assistantIds={lineup.assistantIds ?? []}
              nominationTitle={shareNominationTitle}
              siteUrl={siteOrigin}
              footerInstantIso={sharePosterFooterIso}
              posterTheme={sharePosterTheme}
              watermarkUserLabel={shareWatermarkLabel}
            />
          ) : (
            <NamesOnlySharePoster
              ref={shareCaptureRef}
              players={players}
              lineup={lineup}
              nominationTitle={shareNominationTitle}
              siteUrl={siteOrigin}
              footerInstantIso={sharePosterFooterIso}
            />
          )}
        </div>

        <SaveShareModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          captureRef={shareCaptureRef}
          onBeforeCapture={() => setSharePosterFooterIso(new Date().toISOString())}
          isAuthenticated={isAuthenticated}
          nominationTitle={shareNominationTitle}
          onNominationTitleChange={setShareNominationTitle}
          shareLinkHref={shareUrlForModal || longGuestShareUrl}
          onSave={handleSave}
          isSaving={saving}
          contestSubmissionOpen={contestSubmissionOpen}
          contestTimeBonusPercent={bonusPercent}
          posterTheme={sharePosterTheme}
          onPosterThemeChange={setSharePosterTheme}
          posterVariant={sharePosterVariant}
          onPosterVariantChange={setSharePosterVariant}
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
                <p className="text-[11px] font-semibold text-sky-200/90">Pusť na slot soupisky</p>
              </div>
            </div>
          ) : null}
        </DragOverlay>

        {contestConfirmOpen ? (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => !submitContestBusy && setContestConfirmOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="contest-submit-title"
              className="max-h-[min(90vh,520px)] w-full max-w-md overflow-y-auto rounded-2xl border border-white/12 bg-[#12151f] p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="contest-submit-title" className="font-display text-xl font-bold text-white">
                Odeslat do soutěže?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/75">
                Potvrzuješ <strong className="text-white">aktuální sestavu v editoru</strong> jako svou jedinou
                nominaci ve vyhodnocení soutěže. Tuto akci nelze vzít zpět ani ji zopakovat — z účtu jde odeslat jen
                jednou.
              </p>
              {!contestSubmissionOpen ? (
                <p className="mt-3 rounded-lg border border-rose-500/35 bg-rose-950/30 px-3 py-2 text-sm text-rose-100/90">
                  Uzávěrka odeslání už proběhla.
                </p>
              ) : null}
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setContestConfirmOpen(false)}
                  disabled={submitContestBusy}
                  className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/85 hover:bg-white/5"
                >
                  Zrušit
                </button>
                <button
                  type="button"
                  onClick={() => void handleSubmitToContest()}
                  disabled={submitContestBusy}
                  className="rounded-xl bg-gradient-to-r from-[#f1c40f] to-[#c8102e] px-4 py-2.5 text-sm font-bold text-[#0a0c10] shadow-lg disabled:opacity-40"
                >
                  {submitContestBusy ? "Odesílám…" : "Ano, odeslat do soutěže"}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <PlayerPreviewModal player={previewPlayer} onClose={() => setPreviewPlayer(null)} />
      </div>
    </DndContext>
  );
}
