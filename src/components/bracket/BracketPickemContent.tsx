"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Link2, RotateCcw, Trash2, Trophy } from "lucide-react";
import {
  MS2026_BRACKET_TEAMS,
  MS2026_GROUP_A_TEAMS,
  MS2026_GROUP_A_VENUE,
  MS2026_GROUP_B_TEAMS,
  MS2026_GROUP_B_VENUE,
  MS2026_QF_LABELS,
  type BracketTeam,
} from "@/data/ms2026BracketTeams";
import { encodeBracketPayload, decodeBracketPayload } from "@/lib/bracketPayload";
import type { BracketMatchPick, BracketPickemPayload } from "@/types/bracketPickem";
import { EMPTY_BRACKET_PICKEM } from "@/types/bracketPickem";

/** v2: oficiální skupiny IIHF MS 2026 (16 týmů vč. SLO, ITA; bez KAZ/FRA). */
const STORAGE_KEY = "ms2026-bracket-pickem-v2";

const selectCls =
  "mt-1 w-full rounded-lg border border-white/15 bg-[#0a0e17] px-3 py-2.5 text-sm text-white focus:border-[#003087]/55 focus:outline-none focus:ring-1 focus:ring-[#003087]/40";

const inputCls =
  "mt-1 w-full rounded-lg border border-white/15 bg-[#0a0e17] px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#003087]/55 focus:outline-none focus:ring-1 focus:ring-[#003087]/40";

function clonePicks(p: BracketPickemPayload): BracketPickemPayload {
  return JSON.parse(JSON.stringify(p)) as BracketPickemPayload;
}

function teamSelectOptions(teams: BracketTeam[]) {
  return [{ id: "", name: "— vyber —" }, ...teams];
}

function winnerOptions(left: string | null, right: string | null) {
  const opts: { id: string; name: string }[] = [{ id: "", name: "— postupuje —" }];
  const byId = new Map(MS2026_BRACKET_TEAMS.map((t) => [t.id, t.name]));
  if (left) opts.push({ id: left, name: byId.get(left) ?? left });
  if (right && right !== left) opts.push({ id: right, name: byId.get(right) ?? right });
  return opts;
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
    <section className="rounded-2xl border border-white/[0.08] bg-[#0a0e17]/75 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-6">
      <h2 className="font-display text-lg font-bold tracking-wide text-white sm:text-xl">{title}</h2>
      {hint ? <p className="mt-2 text-xs leading-relaxed text-white/50 sm:text-sm">{hint}</p> : null}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
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
      <select
        className={selectCls}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
      >
        {teamSelectOptions(teams).map((t) => (
          <option key={t.id || "empty"} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
    </label>
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
    <div className="rounded-xl border border-white/10 bg-black/25 p-4">
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

export function BracketPickemContent() {
  const searchParams = useSearchParams();
  const [picks, setPicks] = useState<BracketPickemPayload>(() => ({ ...EMPTY_BRACKET_PICKEM }));
  const [hydrated, setHydrated] = useState(false);

  const allTeams = useMemo(() => MS2026_BRACKET_TEAMS, []);

  useEffect(() => {
    const z = searchParams.get("z");
    if (z) {
      const decoded = decodeBracketPayload(z);
      if (decoded) {
        setPicks(decoded);
        setHydrated(true);
        toast.message("Tipy načteny z odkazu.");
        return;
      }
      toast.error("Odkaz se nepodařilo načíst.");
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as BracketPickemPayload;
        if (parsed?.v === 1) setPicks(parsed);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, [searchParams]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(picks));
    } catch {
      /* ignore */
    }
  }, [picks, hydrated]);

  const setGroupWinner = (key: "groupAWinner" | "groupBWinner", id: string | null) => {
    setPicks((p) => ({ ...p, [key]: id }));
  };

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

  const resetAll = () => {
    setPicks(clonePicks(EMPTY_BRACKET_PICKEM));
    toast.message("Formulář vyprázdněn.");
  };

  return (
    <main className="relative z-10 mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 text-center">
        <p className="font-display text-xs font-bold uppercase tracking-[0.28em] text-[#c8102e]/90">Zdarma</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Bracket Pick’em
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/60">
          Playoff MS 2026 — vyplň vítěze skupin, čtvrtfinálové páry a postup až do finále a o bronz. Tipy se ukládají v
          prohlížeči; odkazem je můžeš sdílet.
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#003087] to-[#002266] px-5 py-3 font-display text-sm font-bold text-white shadow-lg shadow-[#003087]/25 transition hover:brightness-110"
        >
          <Link2 className="h-4 w-4" aria-hidden />
          Zkopírovat odkaz s tipy
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/85 transition hover:border-[#c8102e]/40 hover:bg-[#c8102e]/10"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          Vymazat
        </button>
      </div>

      <div className="space-y-8">
        <Section
          title="Vítězové skupin"
          hint={`Oficiální skupiny IIHF MS 2026. Skupina A (${MS2026_GROUP_A_VENUE}), skupina B (${MS2026_GROUP_B_VENUE}). Vyber vítěze každé skupiny.`}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <TeamSelect
              label={`Skupina A — ${MS2026_GROUP_A_VENUE}`}
              value={picks.groupAWinner}
              onChange={(v) => setGroupWinner("groupAWinner", v)}
              teams={MS2026_GROUP_A_TEAMS}
            />
            <TeamSelect
              label={`Skupina B — ${MS2026_GROUP_B_VENUE}`}
              value={picks.groupBWinner}
              onChange={(v) => setGroupWinner("groupBWinner", v)}
              teams={MS2026_GROUP_B_TEAMS}
            />
          </div>
        </Section>

        <Section
          title="Čtvrtfinále"
          hint="Vyplň všechy čtyři dvojice a u každé vyber postupujícího. Nápověda ukazuje typický kříž play-off (1.×4., 2.×3.)."
        >
          {picks.quarterfinals.map((m, i) => (
            <MatchPickRow
              key={i}
              title={`Čtvrtfinále ${i + 1}`}
              subtitle={MS2026_QF_LABELS[i]}
              match={m}
              onChange={(next) => setQuarter(i, next)}
              teamPool={allTeams}
            />
          ))}
        </Section>

        <Section title="Semifinále" hint="Dva zápasy — vždy dva týmy a postupující do finále.">
          <MatchPickRow
            title="Semifinále 1"
            match={picks.semifinals[0]}
            onChange={(next) => setSemi(0, next)}
            teamPool={allTeams}
          />
          <MatchPickRow
            title="Semifinále 2"
            match={picks.semifinals[1]}
            onChange={(next) => setSemi(1, next)}
            teamPool={allTeams}
          />
        </Section>

        <Section title="Medailové zápasy" hint="Finále o zlato a zápas o bronz.">
          <MatchPickRow
            title="Finále"
            subtitle="O mistra světa"
            match={picks.final}
            onChange={setFinal}
            teamPool={allTeams}
          />
          <MatchPickRow
            title="O bronz"
            subtitle="Třetí místo"
            match={picks.bronze}
            onChange={setBronze}
            teamPool={allTeams}
          />
        </Section>

        <Section
          title="Bonusové otázky"
          hint="Krátké tipy — vyhodnocení dodáme podle oficiálních statistik po turnaji."
        >
          <label className="block text-xs font-medium text-white/65">
            MVP turnaje (jméno)
            <input
              type="text"
              className={inputCls}
              value={picks.bonus.mvp}
              onChange={(e) => setBonus("mvp", e.target.value)}
              placeholder="např. David Pastrňák"
              autoComplete="off"
            />
          </label>
          <label className="block text-xs font-medium text-white/65">
            Nejlepší střelec českého týmu
            <input
              type="text"
              className={inputCls}
              value={picks.bonus.topCzechScorer}
              onChange={(e) => setBonus("topCzechScorer", e.target.value)}
              placeholder="jméno hráče"
              autoComplete="off"
            />
          </label>
          <label className="block text-xs font-medium text-white/65">
            Vítěz kanadského bodování (celý turnaj)
            <input
              type="text"
              className={inputCls}
              value={picks.bonus.pointsLeader}
              onChange={(e) => setBonus("pointsLeader", e.target.value)}
              placeholder="jméno hráče"
              autoComplete="off"
            />
          </label>
          <label className="block text-xs font-medium text-white/65">
            Postoupí Česko do čtvrtfinále?
            <select
              className={selectCls}
              value={picks.bonus.czechQuarterFinals}
              onChange={(e) => setBonus("czechQuarterFinals", e.target.value)}
            >
              <option value="">— nevybráno —</option>
              <option value="ano">Ano</option>
              <option value="ne">Ne</option>
            </select>
          </label>
          <label className="block text-xs font-medium text-white/65">
            Součet gólů ve finále (obě týmy dohromady)
            <input
              type="text"
              inputMode="numeric"
              className={inputCls}
              value={picks.bonus.finalTotalGoals}
              onChange={(e) => setBonus("finalTotalGoals", e.target.value)}
              placeholder="např. 5"
              autoComplete="off"
            />
          </label>
        </Section>
      </div>

      <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-5 text-center">
        <Trophy className="h-8 w-8 text-amber-200/90" aria-hidden />
        <p className="text-sm text-white/75">
          Pick’em je jen pro radost — <strong className="text-white">bez vstupného</strong>, bez účtu. Chceš nominovat
          hráče?{" "}
          <Link href="/sestava" className="font-semibold text-cyan-300 underline-offset-2 hover:underline">
            Editor sestavy nominace
          </Link>
        </p>
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center gap-2 text-sm font-semibold text-amber-100/90 underline-offset-2 hover:underline"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          Znovu zkopírovat odkaz
        </button>
      </div>
    </main>
  );
}
