"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import type { LineupStructure, Player } from "@/types";
import { getAmbiguousLastNameKeys, jerseyNameOnJersey } from "@/lib/jerseyDisplayName";
import { collectMatchLineupIds } from "@/lib/matchLineupValidation";
import { MatchOfficialLineupView } from "@/components/match/MatchOfficialLineupView";
import { MatchRatingClient } from "@/components/match/MatchRatingClient";
import { FloatingPrimaryBar } from "@/components/shared/FloatingPrimaryBar";
import { MatchRatingSaveShareModal } from "@/components/match/MatchRatingSaveShareModal";

type RatingMap = Record<string, { avg: number; count: number }>;

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}
function roundDeci(n: number): number {
  return Math.round(clamp(n, 1, 10) * 10) / 10;
}
function formatRating(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "–";
  return n.toFixed(1).replace(".", ",");
}

function draftFromMineOrAggregate(
  mine: number | undefined,
  aggregate: { avg: number; count: number }
): number {
  if (typeof mine === "number" && Number.isFinite(mine)) return roundDeci(mine);
  if (aggregate.count > 0 && aggregate.avg > 0 && aggregate.avg <= 10) return roundDeci(aggregate.avg);
  return 7;
}

interface MatchRatingExperienceProps {
  slug: string;
  matchTitle: string;
  lineup: LineupStructure;
  players: Player[];
  captainId: string | null;
  defenseCount: 6 | 7 | 8;
  allowExtraForward: boolean;
  initialRatings: RatingMap;
  initialMyRatings: Record<string, number>;
  canRate: boolean;
  lockedReason?: string;
}

/**
 * Spojené UI „oficiální sestava + hodnocení“ — drží jeden state, propaguje moje hodnocení i agregát
 * do dresů (badge), na mobilu zobrazí hodnocení v sheetu po kliku na hráče místo dlouhého seznamu pod sestavou.
 */
export function MatchRatingExperience({
  slug,
  matchTitle,
  lineup,
  players,
  captainId,
  defenseCount,
  allowExtraForward,
  initialRatings,
  initialMyRatings,
  canRate,
  lockedReason,
}: MatchRatingExperienceProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const [ratings, setRatings] = useState<RatingMap>(initialRatings);
  const [myRatings, setMyRatings] = useState<Record<string, number>>(initialMyRatings);
  const [sheetPlayerId, setSheetPlayerId] = useState<string | null>(null);
  /** Po uložení v mobilním sheetu — zarovnání „dotčeného“ řádku na desktopové straně hodnocení. */
  const [sheetCommittedPid, setSheetCommittedPid] = useState<string | undefined>(undefined);
  const acknowledgeSheetCommitted = useCallback(() => setSheetCommittedPid(undefined), []);

  const ambiguousJerseyLastKeys = useMemo(() => getAmbiguousLastNameKeys(players), [players]);

  const byId = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);

  const ratingByPlayerId = ratings;
  const myRatingByPlayerId = myRatings;

  const ids = useMemo(
    () => collectMatchLineupIds(lineup, { defenseCount, allowExtraForward }),
    [lineup, defenseCount, allowExtraForward]
  );

  const sheetPlayer = sheetPlayerId ? byId.get(sheetPlayerId) ?? null : null;

  return (
    <>
      {canRate ? (
        <>
          <FloatingPrimaryBar
            label="Uložit & sdílet"
            onClick={() => setShareOpen(true)}
          />
          <MatchRatingSaveShareModal
            open={shareOpen}
            onClose={() => setShareOpen(false)}
            matchTitle={matchTitle}
            matchSlug={slug}
          />
        </>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-display text-lg font-black">Oficiální sestava</h2>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
              {ids.length} hráčů
            </span>
          </div>
          <div
            className="max-h-[calc(100dvh-13rem)] overflow-y-auto overscroll-contain rounded-xl pr-1"
            style={{ scrollbarGutter: "stable" }}
          >
            <MatchOfficialLineupView
              lineup={lineup}
              players={players}
              captainId={captainId}
              matchDefenseCount={defenseCount}
              matchAllowExtraForward={allowExtraForward}
              ratingByPlayerId={ratingByPlayerId}
              myRatingByPlayerId={myRatingByPlayerId}
              jerseyBadgesPreferFanAverage
              onPlayerClick={(pid) => setSheetPlayerId(pid)}
            />
          </div>
          <p className="mt-3 text-center text-[11px] text-white/45">
            Klepni na hráče pro otevření hodnocení.
          </p>
        </section>

        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-display text-lg font-black">Hodnocení hráčů (1,0–10,0)</h2>
            {canRate ? (
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
                Otevřeno
              </span>
            ) : null}
          </div>
          {!canRate ? (
            <div className="mb-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/65">
              {lockedReason ?? "Hodnocení zatím nebylo spuštěno administrátorem."}
            </div>
          ) : null}

          {/* Mobile UX: dlouhý seznam slidrů skryjeme pod sestavou — používá se sheet po kliku na dres. */}
          <div
            className="hidden lg:block max-h-[calc(100dvh-13rem)] overflow-y-auto overscroll-contain rounded-2xl pr-1"
            style={{ scrollbarGutter: "stable" }}
          >
            <MatchRatingClient
              slug={slug}
              players={players}
              lineup={lineup}
              defenseCount={defenseCount}
              allowExtraForward={allowExtraForward}
              initialRatings={ratings}
              initialMyRatings={myRatings}
              canRate={canRate}
              lockedReason={lockedReason}
              onRatingsChange={setRatings}
              onMyRatingsChange={setMyRatings}
              sheetCommittedPlayerId={sheetCommittedPid}
              onConsumeSheetCommitted={acknowledgeSheetCommitted}
            />
          </div>

          <div className="lg:hidden rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white/70">
            Klepni na hráče v sestavě a oboduj ho 1,0–10,0. Na velkém displeji použij blok vpravo: posuny jsou jen návrh
            — potvrď je tlačítkem „Uložit svoje hodnocení“. Na dresech je vždy průměr všech fanoušků; své uložené známky
            najdeš i pod účtem v sekci Moje hodnocení.
          </div>
        </section>
      </div>

      <h2 className="sr-only">{matchTitle} – hodnocení hráčů</h2>

      {sheetPlayer ? (
        <RatingSheet
          slug={slug}
          player={sheetPlayer}
          aggregate={ratings[sheetPlayer.id] ?? { avg: 0, count: 0 }}
          mine={myRatings[sheetPlayer.id]}
          ambiguousJerseyLastKeys={ambiguousJerseyLastKeys}
          canRate={canRate}
          lockedReason={lockedReason}
          onClose={() => setSheetPlayerId(null)}
          onSaved={(newMine, newRatings) => {
            setMyRatings((m) => ({ ...m, [sheetPlayer.id]: newMine }));
            setSheetCommittedPid(sheetPlayer.id);
            if (newRatings) setRatings(newRatings);
          }}
        />
      ) : null}
    </>
  );
}

function RatingSheet({
  slug,
  player,
  aggregate,
  mine,
  ambiguousJerseyLastKeys,
  canRate,
  lockedReason,
  onClose,
  onSaved,
}: {
  slug: string;
  player: Player;
  aggregate: { avg: number; count: number };
  mine: number | undefined;
  ambiguousJerseyLastKeys: ReadonlySet<string>;
  canRate: boolean;
  lockedReason?: string;
  onClose: () => void;
  onSaved: (newMine: number, newRatings?: RatingMap) => void;
}) {
  const [draft, setDraft] = useState(() => draftFromMineOrAggregate(mine, aggregate));
  const [saving, setSaving] = useState(false);

  /** Po otevření sheetu pro nového hráče zresetujeme draft z props, ne z předchozího sheetu. */
  useEffect(() => {
    setDraft(draftFromMineOrAggregate(mine, aggregate));
  }, [mine, player.id, aggregate]);

  const submit = async () => {
    if (!canRate) {
      toast.error(lockedReason || "Hodnocení zatím není otevřené.");
      return;
    }
    const value = roundDeci(draft);
    setSaving(true);
    try {
      const r = await fetch(`/api/matches/${encodeURIComponent(slug)}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: player.id, rating: value }),
      });
      const data: unknown = await r.json().catch(() => ({}));
      const err = (data as { error?: unknown } | null)?.error;
      if (!r.ok) {
        if (r.status === 401) {
          toast.error("Pro hodnocení se musíte přihlásit.");
          void signIn("google", { callbackUrl: `/zapasy/${encodeURIComponent(slug)}` });
          return;
        }
        toast.error(typeof err === "string" ? err : "Hodnocení se nepovedlo.");
        return;
      }
      toast.success(`Uloženo ${formatRating(value)} / 10`);

      const rr = await fetch(`/api/matches/${encodeURIComponent(slug)}`, { cache: "no-store" });
      const dd: unknown = await rr.json().catch(() => null);
      const nextRatings = (dd as { ratings?: unknown } | null)?.ratings;
      onSaved(value, rr.ok && nextRatings && typeof nextRatings === "object" ? (nextRatings as RatingMap) : undefined);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const displayName = jerseyNameOnJersey(player.name, ambiguousJerseyLastKeys);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-t-3xl border border-white/15 bg-gradient-to-b from-[#0a1428] via-[#0f172a] to-[#05080f] text-white shadow-[0_24px_80px_rgba(0,0,0,0.65)] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div className="min-w-0">
            <div className="truncate font-display text-lg font-black text-white">{player.name}</div>
            <div className="mt-0.5 text-xs text-white/55">
              {player.club}
              {player.league ? <span className="text-white/35"> · {player.league}</span> : null}
            </div>
            {player.name !== displayName ? (
              <div className="mt-0.5 text-[11px] text-white/40">Na dresu: {displayName}</div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-sm font-bold text-white/80 hover:bg-white/[0.08]"
            aria-label="Zavřít"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 border-b border-white/10 bg-black/20 px-5 py-3 text-xs">
          <div>
            <div className="text-white/45">Průměr fanoušků ({aggregate.count})</div>
            <div className="font-display text-2xl font-black tabular-nums text-amber-300">
              {formatRating(aggregate.avg)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-white/45">Tvoje uložené</div>
            <div className="font-display text-2xl font-black tabular-nums text-emerald-300">
              {typeof mine === "number" ? formatRating(mine) : "–"}
            </div>
          </div>
        </div>

        <div className="px-5 py-4">
          {!canRate ? (
            <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/65">
              {lockedReason ?? "Hodnocení zatím nebylo spuštěno administrátorem."}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs text-white/55">
                <span>1,0</span>
                <span className="font-display text-3xl font-black tabular-nums text-white">
                  {formatRating(draft)}
                </span>
                <span>10,0</span>
              </div>
              <input
                aria-label={`Hodnocení ${player.name}`}
                type="range"
                min={1}
                max={10}
                step={0.1}
                value={draft}
                disabled={saving}
                onChange={(e) => setDraft(roundDeci(Number(e.target.value)))}
                className="mt-2 w-full accent-[#00B4FF] disabled:opacity-50"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {[5, 6, 7, 8, 9].map((v) => (
                  <button
                    key={v}
                    type="button"
                    disabled={saving}
                    onClick={() => setDraft(v)}
                    className={`flex-1 rounded-xl border px-2 py-2 font-display text-sm font-bold tabular-nums transition-colors ${
                      Math.abs(draft - v) < 0.05
                        ? "border-[#f1c40f]/55 bg-[#f1c40f]/15 text-[#f1e6a8]"
                        : "border-white/10 bg-black/20 text-white/70 hover:bg-white/[0.06]"
                    }`}
                  >
                    {v},0
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2 border-t border-white/10 bg-black/30 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-bold text-white/80 hover:bg-white/[0.08]"
          >
            Zavřít
          </button>
          <button
            type="button"
            disabled={!canRate || saving}
            onClick={() => void submit()}
            className="flex-1 rounded-xl border border-emerald-400/55 bg-gradient-to-b from-emerald-400 to-emerald-600 px-3 py-2 font-display text-sm font-black uppercase tracking-wide text-white shadow-[0_8px_24px_rgba(0,0,0,0.45)] disabled:opacity-50"
          >
            {saving ? "Ukládám…" : "Uložit tuto známku"}
          </button>
        </div>
      </div>
    </div>
  );
}
