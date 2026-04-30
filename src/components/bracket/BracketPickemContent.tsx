"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { toast } from "sonner";
import { Link2, RotateCcw, Trash2, Trophy } from "lucide-react";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  MS2026_BRACKET_TEAMS,
  MS2026_GROUP_A_TEAMS,
  MS2026_GROUP_A_VENUE,
  MS2026_GROUP_B_TEAMS,
  MS2026_GROUP_B_VENUE,
  MS2026_QF_LABELS,
  type BracketTeam,
} from "@/data/ms2026BracketTeams";
import { SitePageHero } from "@/components/site/SitePageHero";
import { encodeBracketPayload, decodeBracketPayload } from "@/lib/bracketPayload";
import type { BracketMatchPick, BracketPickemPayload } from "@/types/bracketPickem";
import { EMPTY_BRACKET_PICKEM } from "@/types/bracketPickem";

/** v3: drag&drop pořadí skupin + bracket (MS 2026). */
const STORAGE_KEY = "ms2026-bracket-pickem-v4";

const selectCls =
  "mt-1 w-full rounded-lg border border-white/14 bg-white/[0.07] px-3 py-2.5 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] focus:border-[#f1c40f]/45 focus:outline-none focus:ring-1 focus:ring-[#f1c40f]/22";

const inputCls =
  "mt-1 w-full rounded-lg border border-white/14 bg-white/[0.07] px-3 py-2.5 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] placeholder:text-white/40 focus:border-[#f1c40f]/45 focus:outline-none focus:ring-1 focus:ring-[#f1c40f]/22";

function clonePicks(p: BracketPickemPayload): BracketPickemPayload {
  return JSON.parse(JSON.stringify(p)) as BracketPickemPayload;
}

function winnerOptions(left: string | null, right: string | null) {
  const opts: { id: string; name: string }[] = [{ id: "", name: "— postupuje —" }];
  const byId = new Map(MS2026_BRACKET_TEAMS.map((t) => [t.id, t.name]));
  if (left) opts.push({ id: left, name: byId.get(left) ?? left });
  if (right && right !== left) opts.push({ id: right, name: byId.get(right) ?? right });
  return opts;
}

function flagEmoji(teamId: string): string {
  const map: Record<string, string> = {
    USA: "🇺🇸",
    SUI: "🇨🇭",
    FIN: "🇫🇮",
    GER: "🇩🇪",
    LAT: "🇱🇻",
    AUT: "🇦🇹",
    HUN: "🇭🇺",
    GBR: "🇬🇧",
    CAN: "🇨🇦",
    SWE: "🇸🇪",
    CZE: "🇨🇿",
    DEN: "🇩🇰",
    SVK: "🇸🇰",
    NOR: "🇳🇴",
    SLO: "🇸🇮",
    ITA: "🇮🇹",
  };
  return map[teamId] ?? "🏒";
}

function twemojiFlagUrl(teamId: string): string | null {
  const map: Record<string, string> = {
    USA: "1f1fa-1f1f8",
    SUI: "1f1e8-1f1ed",
    FIN: "1f1eb-1f1ee",
    GER: "1f1e9-1f1ea",
    LAT: "1f1f1-1f1fb",
    AUT: "1f1e6-1f1f9",
    HUN: "1f1ed-1f1fa",
    GBR: "1f1ec-1f1e7",
    CAN: "1f1e8-1f1e6",
    SWE: "1f1f8-1f1ea",
    CZE: "1f1e8-1f1ff",
    DEN: "1f1e9-1f1f0",
    SVK: "1f1f8-1f1f0",
    NOR: "1f1f3-1f1f4",
    SLO: "1f1f8-1f1ee",
    ITA: "1f1ee-1f1f9",
  };
  const code = map[teamId];
  if (!code) return null;
  return `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${code}.svg`;
}

function FlagIcon({ id, className }: { id: string; className?: string }) {
  const src = twemojiFlagUrl(id);
  if (!src) return <span className={className}>{flagEmoji(id)}</span>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={id}
      className={className}
      width={20}
      height={20}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
    />
  );
}

function teamSelectOptions(teams: BracketTeam[]) {
  return [{ id: "", name: "— vyber —" }, ...teams];
}

function TeamSelect({
  label,
  value,
  onChange,
  teams,
}: {
  label: string;
  value: string | null;
  onChange: (id: string | null) => void;
  teams: BracketTeam[];
}) {
  return (
    <label className="block text-xs font-medium text-white/65">
      {label}
      <select className={selectCls} value={value ?? ""} onChange={(e) => onChange(e.target.value || null)}>
        {teamSelectOptions(teams).map((t) => (
          <option key={t.id || "empty"} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function normalizeWinner(m: BracketMatchPick): BracketMatchPick {
  const { teamLeft, teamRight, winner } = m;
  if (winner && winner !== teamLeft && winner !== teamRight) {
    return { ...m, winner: null };
  }
  return m;
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="pickem-panel rounded-2xl p-5 shadow-[0_20px_56px_rgba(0,0,0,0.30)] sm:p-6">
      <h2 className="font-display text-lg font-bold tracking-wide text-white sm:text-xl">{title}</h2>
      {hint ? <p className="mt-2 text-xs leading-relaxed text-white/55 sm:text-sm">{hint}</p> : null}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function SortableTeamRow({
  id,
  rank,
  name,
}: {
  id: string;
  rank: number;
  name: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 rounded-xl border border-white/12 bg-white/[0.06] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${
        isDragging ? "opacity-80 ring-2 ring-[#f1c40f]/35" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      <span className="w-6 shrink-0 text-center font-display text-sm font-black text-white/65">{rank}</span>
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] ring-1 ring-white/10">
        <FlagIcon id={id} className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1 truncate font-display text-sm font-bold text-white">{name}</span>
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">{id}</span>
    </div>
  );
}

function GroupOrderDnd({
  title,
  venue,
  order,
  teamById,
  onChange,
}: {
  title: string;
  venue: string;
  order: string[];
  teamById: Map<string, BracketTeam>;
  onChange: (next: string[]) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">{title}</p>
      <p className="mt-1 text-xs text-white/55">{venue}</p>
      <div className="mt-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(e) => {
            const { active, over } = e;
            if (!over || active.id === over.id) return;
            const oldIndex = order.indexOf(String(active.id));
            const newIndex = order.indexOf(String(over.id));
            if (oldIndex < 0 || newIndex < 0) return;
            onChange(arrayMove(order, oldIndex, newIndex));
          }}
        >
          <SortableContext items={order} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {order.map((id, idx) => {
                const t = teamById.get(id);
                return (
                  <SortableTeamRow key={id} id={id} rank={idx + 1} name={t?.name ?? id} />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-white/45">
        Přetáhni týmy a nastav pořadí 1–8. (Neřešíme skóre; je to čistě tip pořadí.)
      </p>
    </div>
  );
}

function MatchPickRow({
  title,
  subtitle,
  match,
  onChange,
  teamPool,
}: {
  title: string;
  subtitle?: string;
  match: BracketMatchPick;
  onChange: (next: BracketMatchPick) => void;
  teamPool: BracketTeam[];
}) {
  const setField = (field: keyof BracketMatchPick, raw: string | null) => {
    const next: BracketMatchPick = { ...match, [field]: raw };
    onChange(normalizeWinner(next));
  };

  return (
    <div className="rounded-xl border border-white/[0.09] bg-black/35 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <p className="font-display text-sm font-semibold text-white">{title}</p>
      {subtitle ? <p className="mt-1 text-[11px] text-[#003087]/90">{subtitle}</p> : null}
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <TeamSelect label="Tým A" value={match.teamLeft} onChange={(v) => setField("teamLeft", v)} teams={teamPool} />
        <TeamSelect label="Tým B" value={match.teamRight} onChange={(v) => setField("teamRight", v)} teams={teamPool} />
        <label className="block text-xs font-medium text-white/65">
          Postupuje
          <select
            className={selectCls}
            value={match.winner ?? ""}
            onChange={(e) => setField("winner", e.target.value || null)}
          >
            {winnerOptions(match.teamLeft, match.teamRight).map((t) => (
              <option key={t.id || "w-empty"} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

function teamLabel(teamById: Map<string, BracketTeam>, id: string | null) {
  if (!id) return "—";
  return teamById.get(id)?.name ?? id;
}

function MatchBox({
  title,
  left,
  right,
  winner,
  onPickWinner,
  teamById,
}: {
  title: string;
  left: string | null;
  right: string | null;
  winner: string | null;
  onPickWinner: (id: string | null) => void;
  teamById: Map<string, BracketTeam>;
}) {
  const rowCls = (id: string | null) =>
    `flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm font-semibold ${
      id && winner === id
        ? "border-[#f1c40f]/55 bg-[#f1c40f]/[0.10] text-amber-100"
        : "border-white/12 bg-white/[0.06] text-white/85 hover:border-white/22"
    }`;
  return (
    <div className="rounded-2xl border border-white/[0.12] bg-white/[0.04] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <p className="mb-2 text-center font-display text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">
        {title}
      </p>
      <button type="button" className={rowCls(left)} onClick={() => onPickWinner(left)} disabled={!left}>
        <span className="flex min-w-0 items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.06] ring-1 ring-white/10">
            {left ? <FlagIcon id={left} className="h-[16px] w-[16px]" /> : <span className="text-sm">🏒</span>}
          </span>
          <span className="truncate">{teamLabel(teamById, left)}</span>
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/35">{left ?? ""}</span>
      </button>
      <button
        type="button"
        className={`${rowCls(right)} mt-2`}
        onClick={() => onPickWinner(right)}
        disabled={!right}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.06] ring-1 ring-white/10">
            {right ? <FlagIcon id={right} className="h-[16px] w-[16px]" /> : <span className="text-sm">🏒</span>}
          </span>
          <span className="truncate">{teamLabel(teamById, right)}</span>
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/35">{right ?? ""}</span>
      </button>
    </div>
  );
}

export function BracketPickemContent() {
  const searchParams = useSearchParams();
  const { status: authStatus } = useSession();
  const [picks, setPicks] = useState<BracketPickemPayload>(() => ({ ...EMPTY_BRACKET_PICKEM }));
  const [hydrated, setHydrated] = useState(false);
  const [czPlayers, setCzPlayers] = useState<{ id: string; name: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const allTeams = useMemo(() => MS2026_BRACKET_TEAMS, []);
  const teamById = useMemo(() => new Map(MS2026_BRACKET_TEAMS.map((t) => [t.id, t] as const)), []);

  const ensureDefaults = useCallback((p: BracketPickemPayload): BracketPickemPayload => {
    const aDefault = MS2026_GROUP_A_TEAMS.map((t) => t.id);
    const bDefault = MS2026_GROUP_B_TEAMS.map((t) => t.id);
    const bonus = (p as BracketPickemPayload).bonus ?? ({} as BracketPickemPayload["bonus"]);
    return {
      ...p,
      groupAOrder: Array.isArray(p.groupAOrder) && p.groupAOrder.length === aDefault.length ? p.groupAOrder : aDefault,
      groupBOrder: Array.isArray(p.groupBOrder) && p.groupBOrder.length === bDefault.length ? p.groupBOrder : bDefault,
      bonus: {
        topCzechGoalScorerId: bonus.topCzechGoalScorerId ?? "",
        topCzechPointsLeaderId: bonus.topCzechPointsLeaderId ?? "",
        mostPenalizedCzechPlayerId: bonus.mostPenalizedCzechPlayerId ?? "",
        czechTeamGoals: bonus.czechTeamGoals ?? "",
        czechTeamPim: bonus.czechTeamPim ?? "",
      },
    };
  }, []);

  // CZ hráči pro bonus tipy (výběr z DB kandidátů).
  useEffect(() => {
    fetch("/api/players")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("players fetch failed"))))
      .then((rows) => {
        const list = Array.isArray(rows)
          ? (rows as Array<{ id?: unknown; name?: unknown }>).flatMap((x) => {
              const id = typeof x.id === "string" ? x.id : null;
              const name = typeof x.name === "string" ? x.name : null;
              return id && name ? [{ id, name }] : [];
            })
          : [];
        setCzPlayers(list);
      })
      .catch(() => {
        // fallback: prázdno (stále lze vyplnit čísla), ale dropdown nebude mít data
        setCzPlayers([]);
      });
  }, []);

  useEffect(() => {
    const z = searchParams.get("z");
    if (z) {
      const decoded = decodeBracketPayload(z);
      if (decoded) {
        queueMicrotask(() => {
            setPicks(ensureDefaults(decoded));
          setHydrated(true);
          toast.message("Tipy načteny z odkazu.");
        });
        return;
      }
      toast.error("Odkaz se nepodařilo načíst.");
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
          const parsed = JSON.parse(raw) as BracketPickemPayload;
          if (parsed && typeof parsed === "object") {
            queueMicrotask(() => setPicks(ensureDefaults(parsed)));
          }
      }
    } catch {
      /* ignore */
    }
    queueMicrotask(() => setHydrated(true));
  }, [searchParams, ensureDefaults]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(picks));
    } catch {
      /* ignore */
    }
  }, [picks, hydrated]);

  const setGroupOrder = (which: "A" | "B", next: string[]) => {
    setPicks((p) => (which === "A" ? { ...p, groupAOrder: next } : { ...p, groupBOrder: next }));
  };

  const computedQuarterfinals = useMemo(() => {
    const A = picks.groupAOrder;
    const B = picks.groupBOrder;
    const A1 = A[0] ?? null;
    const A2 = A[1] ?? null;
    const A3 = A[2] ?? null;
    const A4 = A[3] ?? null;
    const B1 = B[0] ?? null;
    const B2 = B[1] ?? null;
    const B3 = B[2] ?? null;
    const B4 = B[3] ?? null;
    // IIHF cross-over: 1A–4B, 2A–3B, 1B–4A, 2B–3A
    return [
      { teamLeft: A1, teamRight: B4 },
      { teamLeft: A2, teamRight: B3 },
      { teamLeft: B1, teamRight: A4 },
      { teamLeft: B2, teamRight: A3 },
    ] as const;
  }, [picks.groupAOrder, picks.groupBOrder]);

  const computedSemifinals = useMemo(() => {
    // IIHF po QF re-seeding: nejlepší semifinalista vs nejhorší (podle pozice ve skupině; v případě shody A před B).
    const A = picks.groupAOrder;
    const B = picks.groupBOrder;
    const pos = (id: string): { group: "A" | "B"; place: number } | null => {
      const ia = A.indexOf(id);
      if (ia >= 0) return { group: "A", place: ia + 1 };
      const ib = B.indexOf(id);
      if (ib >= 0) return { group: "B", place: ib + 1 };
      return null;
    };
    const seedKey = (id: string): [number, number] => {
      const p = pos(id);
      if (!p) return [99, 9];
      // menší = lepší (1..4); při shodě A před B (jen deterministicky)
      return [p.place, p.group === "A" ? 0 : 1];
    };

    const winners = picks.quarterfinals
      .map((m) => m.winner ?? null)
      .filter(Boolean) as string[];

    if (winners.length < 4) {
      return [
        { teamLeft: winners[0] ?? null, teamRight: winners[1] ?? null },
        { teamLeft: winners[2] ?? null, teamRight: winners[3] ?? null },
      ] as const;
    }

    const sorted = [...winners].sort((a, b) => {
      const ka = seedKey(a);
      const kb = seedKey(b);
      return ka[0] - kb[0] || ka[1] - kb[1];
    });
    return [
      { teamLeft: sorted[0] ?? null, teamRight: sorted[3] ?? null },
      { teamLeft: sorted[1] ?? null, teamRight: sorted[2] ?? null },
    ] as const;
  }, [picks.quarterfinals, picks.groupAOrder, picks.groupBOrder]);

  const computedFinal = useMemo(() => {
    const w = picks.semifinals.map((m) => m.winner ?? null);
    return { teamLeft: w[0] ?? null, teamRight: w[1] ?? null };
  }, [picks.semifinals]);

  const computedBronze = useMemo(() => {
    const loser = (m: BracketMatchPick) => {
      if (!m.teamLeft || !m.teamRight || !m.winner) return null;
      return m.winner === m.teamLeft ? m.teamRight : m.teamLeft;
    };
    return { teamLeft: loser(picks.semifinals[0]), teamRight: loser(picks.semifinals[1]) };
  }, [picks.semifinals]);

  // Když se změní pořadí skupin, přepočítej dvojice QF a smaž neplatné vítěze.
  useEffect(() => {
    if (!hydrated) return;
    setPicks((p) => {
      const nextQf = p.quarterfinals.map((m, i) => {
        const base = computedQuarterfinals[i];
        const merged: BracketMatchPick = { ...m, teamLeft: base?.teamLeft ?? null, teamRight: base?.teamRight ?? null };
        return normalizeWinner(merged);
      });
      return { ...p, quarterfinals: nextQf };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computedQuarterfinals, hydrated]);

  // QF winners → SF teams
  useEffect(() => {
    if (!hydrated) return;
    setPicks((p) => {
      const nextSf = p.semifinals.map((m, i) => {
        const base = computedSemifinals[i];
        const merged: BracketMatchPick = { ...m, teamLeft: base?.teamLeft ?? null, teamRight: base?.teamRight ?? null };
        return normalizeWinner(merged);
      });
      return { ...p, semifinals: nextSf };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computedSemifinals, hydrated]);

  // SF winners → Final + Bronze teams
  useEffect(() => {
    if (!hydrated) return;
    setPicks((p) => {
      const nextFinal = normalizeWinner({ ...p.final, teamLeft: computedFinal.teamLeft, teamRight: computedFinal.teamRight });
      const nextBronze = normalizeWinner({ ...p.bronze, teamLeft: computedBronze.teamLeft, teamRight: computedBronze.teamRight });
      return { ...p, final: nextFinal, bronze: nextBronze };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computedFinal, computedBronze, hydrated]);

  const setQuarter = (index: number, m: BracketMatchPick) => {
    setPicks((p) => {
      const quarterfinals = [...p.quarterfinals];
      quarterfinals[index] = m;
      return { ...p, quarterfinals };
    });
  };

  const setSemi = (index: number, m: BracketMatchPick) => {
    setPicks((p) => {
      const semifinals = [...p.semifinals];
      semifinals[index] = m;
      return { ...p, semifinals };
    });
  };

  const setFinal = (m: BracketMatchPick) => setPicks((p) => ({ ...p, final: m }));
  const setBronze = (m: BracketMatchPick) => setPicks((p) => ({ ...p, bronze: m }));

  const setBonus = (key: keyof BracketPickemPayload["bonus"], value: string) => {
    setPicks((p) => ({ ...p, bonus: { ...p.bonus, [key]: value } }));
  };

  const copyLink = useCallback(() => {
    const z = encodeBracketPayload(picks);
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/bracket?z=${z}`;
    navigator.clipboard.writeText(url).then(
      () => toast.success("Odkaz zkopírován — pošli ho sobě nebo kamarádům."),
      () => toast.error("Schránka nedostupná — zkopíruj URL ručně z adresního řádku po kliknutí sem.", {
        duration: 5000,
      })
    );
  }, [picks]);

  const submitPickem = useCallback(async () => {
    if (authStatus !== "authenticated") {
      toast.error("Pro odeslání Pick’emu se musíš přihlásit.");
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      const r = await fetch("/api/pickem/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(picks),
      });
      const data = (await r.json().catch(() => null)) as any;
      if (!r.ok) {
        toast.error(data?.error ?? "Odeslání se nepovedlo.");
        return;
      }
      toast.success("Pick’em odeslán a uložen k účtu.");
    } catch {
      toast.error("Odeslání se nepovedlo.");
    } finally {
      setSubmitting(false);
    }
  }, [authStatus, picks, submitting]);

  const resetAll = () => {
    setPicks(clonePicks(EMPTY_BRACKET_PICKEM));
    toast.message("Formulář vyprázdněn.");
  };

  if (authStatus !== "authenticated") {
    return (
      <main className="relative z-10 mx-auto max-w-3xl px-4 pb-14 pt-6 sm:px-6 sm:pb-20">
        <SitePageHero
          kicker="Pick’em"
          title="Bracket Pick’em"
          subtitle="Pro odeslání tipů a vyhodnocení se musíš přihlásit. Po přihlášení se ti tipy uloží k účtu."
          align="center"
        />
        <div className="pickem-panel mx-auto mt-8 max-w-xl rounded-2xl p-6 text-center shadow-[0_20px_56px_rgba(0,0,0,0.30)]">
          <p className="text-sm text-white/75">
            Přihlášení je nutné, aby šlo Pick’em jednoznačně přiřadit k účtu a později vyhodnotit.
          </p>
          <button
            type="button"
            onClick={() => signIn(undefined, { callbackUrl: "/bracket" })}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#003087] via-[#002a5c] to-[#c8102e] px-6 py-3 font-display text-sm font-bold text-white shadow-[0_12px_40px_rgba(0,48,135,0.35),0_0_32px_rgba(200,16,46,0.15)] transition hover:brightness-110"
          >
            Přihlásit se
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative z-10 mx-auto max-w-3xl px-4 pb-14 pt-2 sm:px-6 sm:pb-20">
      <SitePageHero
        kicker="Zdarma"
        title="Bracket Pick’em"
        subtitle="Playoff MS 2026 — vyplň vítěze skupin, čtvrtfinálové páry a postup až do finále a o bronz. Tipy se ukládají v prohlížeči; odkazem je můžeš sdílet."
        align="center"
      />

      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
        <button
          type="button"
          onClick={submitPickem}
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#f1c40f] px-5 py-3 font-display text-sm font-black text-slate-900 shadow-[0_12px_40px_rgba(241,196,15,0.22)] transition hover:brightness-105 disabled:opacity-60"
        >
          {submitting ? "Odesílám…" : "Odeslat Pick’em"}
        </button>
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#003087] via-[#002a5c] to-[#c8102e] px-5 py-3 font-display text-sm font-bold text-white shadow-[0_12px_40px_rgba(0,48,135,0.35),0_0_32px_rgba(200,16,46,0.15)] transition hover:brightness-110"
        >
          <Link2 className="h-4 w-4" aria-hidden />
          Zkopírovat odkaz s tipy
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white/88 transition hover:border-[#f1c40f]/35 hover:bg-[#f1c40f]/[0.07]"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          Vymazat
        </button>
      </div>

      <div className="space-y-8">
        <Section
          title="Pořadí ve skupinách"
          hint={`Oficiální skupiny IIHF MS 2026. Přetáhni týmy a nastav pořadí ve skupině A (${MS2026_GROUP_A_VENUE}) a skupině B (${MS2026_GROUP_B_VENUE}).`}
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <GroupOrderDnd
              title="Skupina A"
              venue={MS2026_GROUP_A_VENUE}
              order={picks.groupAOrder}
              teamById={teamById}
              onChange={(next) => setGroupOrder("A", next)}
            />
            <GroupOrderDnd
              title="Skupina B"
              venue={MS2026_GROUP_B_VENUE}
              order={picks.groupBOrder}
              teamById={teamById}
              onChange={(next) => setGroupOrder("B", next)}
            />
          </div>
        </Section>

        <Section
          title="Čtvrtfinále"
          hint="Dle IIHF se čtvrtfinále hraje cross-over: 1A–4B, 2A–3B, 1B–4A, 2B–3A. Vyber postupující v každém zápase."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {picks.quarterfinals.map((m, i) => (
              <MatchBox
                key={i}
                title={`Čtvrtfinále ${i + 1}`}
                left={m.teamLeft}
                right={m.teamRight}
                winner={m.winner}
                teamById={teamById}
                onPickWinner={(id) => setQuarter(i, { ...m, winner: id })}
              />
            ))}
          </div>
          <p className="text-xs text-white/45">
            {MS2026_QF_LABELS.map((l, i) => (
              <span key={l}>
                <span className="font-semibold text-white/60">QF{i + 1}:</span> {l}
                {i < MS2026_QF_LABELS.length - 1 ? " · " : ""}
              </span>
            ))}
          </p>
        </Section>

        <Section
          title="Bracket"
          hint="IIHF po čtvrtfinále re-seeduje semifinalisty (nejlepší vs nejhorší). Klikni na tým, který postupuje."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <MatchBox
              title="Semifinále 1"
              left={picks.semifinals[0].teamLeft}
              right={picks.semifinals[0].teamRight}
              winner={picks.semifinals[0].winner}
              teamById={teamById}
              onPickWinner={(id) => setSemi(0, { ...picks.semifinals[0], winner: id })}
            />
            <MatchBox
              title="Semifinále 2"
              left={picks.semifinals[1].teamLeft}
              right={picks.semifinals[1].teamRight}
              winner={picks.semifinals[1].winner}
              teamById={teamById}
              onPickWinner={(id) => setSemi(1, { ...picks.semifinals[1], winner: id })}
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <MatchBox
              title="Finále"
              left={picks.final.teamLeft}
              right={picks.final.teamRight}
              winner={picks.final.winner}
              teamById={teamById}
              onPickWinner={(id) => setFinal({ ...picks.final, winner: id })}
            />
            <MatchBox
              title="O bronz"
              left={picks.bronze.teamLeft}
              right={picks.bronze.teamRight}
              winner={picks.bronze.winner}
              teamById={teamById}
              onPickWinner={(id) => setBronze({ ...picks.bronze, winner: id })}
            />
          </div>
        </Section>

        <Section
          title="Bonusové tipy"
          hint="Vyhodnocení jde udělat jen z českých hráčů + týmových součtů (bez databáze všech hráčů světa)."
        >
          <label className="block text-xs font-medium text-white/65">
            Nejlepší český střelec (CZ hráč)
            <select
              className={selectCls}
              value={picks.bonus.topCzechGoalScorerId}
              onChange={(e) => setBonus("topCzechGoalScorerId", e.target.value)}
            >
              <option value="">— vyber hráče —</option>
              {czPlayers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-medium text-white/65">
            Nejlepší český hráč v bodování (CZ hráč)
            <select
              className={selectCls}
              value={picks.bonus.topCzechPointsLeaderId}
              onChange={(e) => setBonus("topCzechPointsLeaderId", e.target.value)}
            >
              <option value="">— vyber hráče —</option>
              {czPlayers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-medium text-white/65">
            Nejtrestanější český hráč (PIM) (CZ hráč)
            <select
              className={selectCls}
              value={picks.bonus.mostPenalizedCzechPlayerId}
              onChange={(e) => setBonus("mostPenalizedCzechPlayerId", e.target.value)}
            >
              <option value="">— vyber hráče —</option>
              {czPlayers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-medium text-white/65">
              Počet gólů českého týmu
              <input
                type="text"
                inputMode="numeric"
                className={inputCls}
                value={picks.bonus.czechTeamGoals}
                onChange={(e) => setBonus("czechTeamGoals", e.target.value.replace(/[^\d]/g, ""))}
                placeholder="např. 22"
                autoComplete="off"
              />
            </label>
            <label className="block text-xs font-medium text-white/65">
              Počet trestných minut českého týmu
              <input
                type="text"
                inputMode="numeric"
                className={inputCls}
                value={picks.bonus.czechTeamPim}
                onChange={(e) => setBonus("czechTeamPim", e.target.value.replace(/[^\d]/g, ""))}
                placeholder="např. 48"
                autoComplete="off"
              />
            </label>
          </div>
        </Section>
      </div>

      <div className="pickem-panel mt-10 flex flex-col items-center gap-3 rounded-2xl p-6 text-center ring-1 ring-[#f1c40f]/22 shadow-[0_0_48px_rgba(241,196,15,0.06)]">
        <Trophy className="h-8 w-8 text-[#f1c40f]/90" aria-hidden />
        <p className="text-sm text-white/78">
          Hotovo? Klikni na <strong className="text-white">Odeslat Pick’em</strong> a tipy se uloží k tvému účtu.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={submitPickem}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#f1c40f] px-5 py-3 font-display text-sm font-black text-slate-900 shadow-[0_12px_40px_rgba(241,196,15,0.22)] transition hover:brightness-105 disabled:opacity-60"
          >
            {submitting ? "Odesílám…" : "Odeslat Pick’em"}
          </button>
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/14 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white/88 transition hover:border-[#f1c40f]/35 hover:bg-[#f1c40f]/[0.07]"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Zkopírovat odkaz
          </button>
        </div>
        <p className="text-xs text-white/50">
          Chceš nominovat hráče?{" "}
          <Link href="/sestava" className="font-semibold text-cyan-300 underline-offset-2 hover:underline">
            Editor sestavy nominace
          </Link>
        </p>
      </div>
    </main>
  );
}
