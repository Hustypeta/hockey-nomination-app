"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Search, Filter, Info } from "lucide-react";
import type { Player, Position } from "@/types";
import { POSITION_LABELS, POSITION_LIMITS, ROLE_LABELS } from "@/types";
import { poolPositionSquareLabel } from "@/lib/poolPositionLabel";
import { getAmbiguousLastNameKeys, jerseyNameForPlayer } from "@/lib/jerseyDisplayName";
import { PlayerAvatar } from "./PlayerAvatar";
import {
  FIFA_EDITOR_INPUT,
  FIFA_EDITOR_POOL_FILTERS,
  FIFA_EDITOR_SCROLL,
  FIFA_EDITOR_SELECT,
  FIFA_EDITOR_TAB,
  FIFA_EDITOR_TAB_ACTIVE,
  FIFA_EDITOR_TABS,
  FIFA_POOL_CARD,
} from "@/lib/fifa/fifaEditorClasses";
import { fifaPoolCardKitClass } from "@/lib/posterJerseyKit";

type Tab = "all" | "G" | "D" | "F";
type PickRateSort = "popular" | "unique";

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function sortPlayersByPickRate(players: Player[], direction: "asc" | "desc") {
  const dir = direction === "asc" ? 1 : -1;
  return [...players].sort((a, b) => {
    const ar = Number.isFinite(a.pick_rate) ? a.pick_rate : 0;
    const br = Number.isFinite(b.pick_rate) ? b.pick_rate : 0;
    if (ar !== br) return (ar - br) * dir;
    return a.name.localeCompare(b.name, "cs");
  });
}

function CompactPickCardBody({
  player,
  rate,
  fifaUi,
  ambiguousKeys,
  hidePickRate = false,
}: {
  player: Player;
  rate: number;
  fifaUi: boolean;
  ambiguousKeys?: ReadonlySet<string> | null;
  hidePickRate?: boolean;
}) {
  const posLabel = poolPositionSquareLabel(player);
  const displayName = jerseyNameForPlayer(player, ambiguousKeys);
  return (
    <div className="fifa-pool-card__compact-stack flex min-w-0 flex-col justify-center gap-0.5 pr-4">
      <div className="flex min-w-0 items-center justify-between gap-1">
        <span className="fifa-pool-card__pos shrink-0 font-mono font-bold leading-none tabular-nums text-[var(--fifa-accent-text)]">
          {posLabel}
        </span>
        {hidePickRate ? null : <PickRateBadge rate={rate} fifaUi={fifaUi} />}
      </div>
      <p className="fifa-pool-card__name min-w-0 text-left leading-snug" title={player.name}>
        {displayName}
      </p>
    </div>
  );
}

function PickRateBadge({ rate, fifaUi = false }: { rate: number; fifaUi?: boolean }) {
  const r = Number.isFinite(rate) ? rate : 0;
  const base = fifaUi
    ? "fifa-pool-card__rate inline-flex items-center rounded border border-[var(--fifa-border)] px-1 py-px text-[8px] font-semibold tabular-nums leading-none"
    : "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold";
  if (r > 50) {
    return (
      <span className={`${base} ${fifaUi ? "text-emerald-300" : "bg-emerald-400/10 text-emerald-400"}`}>
        {!fifaUi ? <span aria-hidden>🔥</span> : null}
        {r}%
      </span>
    );
  }
  if (r < 15) {
    return (
      <span className={`${base} ${fifaUi ? "text-amber-300" : "bg-amber-400/10 text-amber-400"}`}>
        {!fifaUi ? <span aria-hidden>💎</span> : null}
        {r}%
      </span>
    );
  }
  return (
    <span className={`${base} ${fifaUi ? "text-[var(--fifa-text-muted)]" : "bg-slate-400/10 text-slate-400"}`}>
      {r}%
    </span>
  );
}

function PoolAbbrevLegend({ fifaUi = false }: { fifaUi?: boolean }) {
  if (fifaUi) {
    return (
      <div className="fifa-pool-legend" aria-label="Vysvětlivky zkratek pozic">
        <p className="fifa-pool-legend__title">Zkratky pozic</p>
        <ul className="grid gap-x-3 gap-y-1 sm:grid-cols-2">
          <li>
            <span className="font-mono font-semibold text-[var(--fifa-accent-text)]">G</span> — {ROLE_LABELS.G}
          </li>
          <li>
            <span className="font-mono font-semibold text-[var(--fifa-accent-text)]">D</span> — obránce (obecně)
          </li>
          <li>
            <span className="font-mono font-semibold text-[var(--fifa-accent-text)]">LB</span> — {ROLE_LABELS.LB}
          </li>
          <li>
            <span className="font-mono font-semibold text-[var(--fifa-accent-text)]">RB</span> — {ROLE_LABELS.RB}
          </li>
          <li>
            <span className="font-mono font-semibold text-[var(--fifa-accent-text)]">F</span> — {POSITION_LABELS.F} (obecně)
          </li>
          <li>
            <span className="font-mono font-semibold text-[var(--fifa-accent-text)]">LW</span> — {ROLE_LABELS.LW}
          </li>
          <li>
            <span className="font-mono font-semibold text-[var(--fifa-accent-text)]">C</span> — {ROLE_LABELS.C}
          </li>
          <li>
            <span className="font-mono font-semibold text-[var(--fifa-accent-text)]">RW</span> — {ROLE_LABELS.RW}
          </li>
        </ul>
        <p className="mt-2.5 border-t border-[var(--fifa-border)] pt-2 text-[var(--fifa-text-muted)]">
          U hráče s více útočnými rolemi v datech se v čtverci může objevit např.{" "}
          <span className="font-mono text-[var(--fifa-text-secondary)]">LW/RW</span>. Kombinace{" "}
          <span className="font-mono text-[var(--fifa-text-secondary)]">LW+C+RW</span> se zobrazí jako{" "}
          <span className="font-mono text-[var(--fifa-text-secondary)]">F</span>.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border border-white/[0.1] bg-gradient-to-br from-[#0a1428]/90 via-[#0f172a]/85 to-[#05080f]/95 px-4 py-3 text-[11px] leading-snug text-slate-200/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_24px_rgba(0,48,135,0.12)] sm:text-xs sm:leading-relaxed"
      aria-label="Vysvětlivky zkratek pozic"
    >
      <p className="mb-2 font-bold uppercase tracking-[0.12em] text-[#f1c40f]/90">Zkratky pozic</p>
      <ul className="grid gap-x-3 gap-y-1 sm:grid-cols-2">
        <li>
          <span className="font-mono font-semibold text-sky-200">G</span> — {ROLE_LABELS.G}
        </li>
        <li>
          <span className="font-mono font-semibold text-blue-200">D</span> — obránce (obecně)
        </li>
        <li>
          <span className="font-mono font-semibold text-blue-200">LB</span> — {ROLE_LABELS.LB}
        </li>
        <li>
          <span className="font-mono font-semibold text-blue-200">RB</span> — {ROLE_LABELS.RB}
        </li>
        <li>
          <span className="font-mono font-semibold text-red-200">F</span> — {POSITION_LABELS.F} (obecně)
        </li>
        <li>
          <span className="font-mono font-semibold text-red-200">LW</span> — {ROLE_LABELS.LW}
        </li>
        <li>
          <span className="font-mono font-semibold text-red-200">C</span> — {ROLE_LABELS.C}
        </li>
        <li>
          <span className="font-mono font-semibold text-red-200">RW</span> — {ROLE_LABELS.RW}
        </li>
      </ul>
      <p className="mt-3 border-t border-white/[0.1] pt-2.5 text-[10px] text-slate-400 sm:text-[11px]">
        U hráče s více útočnými rolemi v datech se v čtverci může objevit např.{" "}
        <span className="font-mono text-white/70">LW/RW</span>. Kombinace{" "}
        <span className="font-mono text-white/70">LW+C+RW</span> se zobrazí jako{" "}
        <span className="font-mono text-white/70">F</span>.
      </p>
    </div>
  );
}

function DraggableCard({
  player,
  disabled,
  slotBlocks,
  inRoster,
  onAdd,
  onInfo,
  counts,
  enableDnd,
  simplePickList,
  compactInline,
  ambiguousKeys,
  fifaUi = false,
  hidePickRate = false,
}: {
  player: Player;
  disabled: boolean;
  /** Vybraný slot ve sestavě — hráč nejde na tento slot (např. náhr. D bez 7. bekovi). */
  slotBlocks: boolean;
  inRoster: boolean;
  onAdd: () => void;
  onInfo: () => void;
  counts: { G: number; D: number; F: number };
  enableDnd?: boolean;
  /** Nominace / zápasová sestava: jméno, %, pozice a info na cihle; klub jen v info modalu. */
  simplePickList?: boolean;
  compactInline?: boolean;
  ambiguousKeys?: ReadonlySet<string> | null;
  fifaUi?: boolean;
  hidePickRate?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `drag-player-${player.id}`,
    disabled: !enableDnd || disabled || slotBlocks || inRoster,
    data: { player },
  });
  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;
  const lim = POSITION_LIMITS[player.position];
  const cur = counts[player.position];
  const rate = Number.isFinite(player.pick_rate) ? Math.max(0, Math.min(100, player.pick_rate)) : 0;

  const canInteract = !disabled && !slotBlocks && !inRoster;
  const dndOn = enableDnd && canInteract;

  const muted = inRoster || disabled || slotBlocks;

  const cardClass = fifaUi
    ? [
        FIFA_POOL_CARD,
        fifaPoolCardKitClass(player.poolKey),
        muted ? "fifa-pool-card--muted" : "",
        isDragging ? "fifa-pool-card--dragging" : "",
      ]
        .filter(Boolean)
        .join(" ")
    : `
        group/pool relative flex flex-col gap-2 rounded-xl border p-3 sm:p-3.5
        transition-[opacity,box-shadow,border-color,transform] duration-200 ease-out
        before:pointer-events-none before:absolute before:inset-y-2.5 before:left-0 before:w-[3px] before:rounded-full before:bg-[#c8102e] before:opacity-90 before:shadow-[0_0_12px_rgba(200,16,46,0.5)]
        ${
          inRoster
            ? "border-white/[0.07] bg-[#05080f]/50"
            : disabled || slotBlocks
              ? "border-white/[0.05] bg-[#080d14]/80"
              : `border-white/[0.12] bg-gradient-to-br from-[#0a1428]/95 via-[#121c34]/92 to-[#0a0f1a]/95
                 shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.07),0_0_0_1px_rgba(0,48,135,0.15)]
                 hover:-translate-y-0.5 hover:border-[#f1c40f]/35 hover:shadow-[0_12px_40px_rgba(200,16,46,0.2),0_0_40px_rgba(241,196,15,0.08),inset_0_1px_0_rgba(255,255,255,0.1)]`
        }
        ${
          isDragging
            ? "z-50 scale-[1.02] opacity-[0.98] shadow-2xl ring-2 ring-[#c8102e]/55"
            : inRoster
              ? "opacity-[0.45]"
              : disabled || slotBlocks
                ? "opacity-50"
                : "opacity-100"
        }
      `;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${cardClass}${dndOn ? " cursor-grab active:cursor-grabbing" : ""}`}
      aria-label={dndOn ? "Přetáhnout do soupisky nebo klepnout pro přidání" : undefined}
      {...(dndOn ? listeners : {})}
      {...(dndOn ? attributes : {})}
    >
      {!fifaUi ? (
        <div
          className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-[#003087]/18 opacity-90"
          aria-hidden
        />
      ) : null}
      <div className={`relative flex gap-1 ${fifaUi ? "fifa-pool-card__body" : ""}`}>
        <div
          data-dnd-card={dndOn ? "1" : "0"}
          data-player={player.id}
          className={`flex min-w-0 flex-1 touch-manipulation flex-col gap-0.5 rounded-lg px-0 py-0 ${canInteract ? "cursor-pointer" : ""}`}
          role="presentation"
          onClick={() => canInteract && onAdd()}
        >
          {fifaUi && simplePickList && compactInline ? (
            <CompactPickCardBody player={player} rate={rate} fifaUi={fifaUi} ambiguousKeys={ambiguousKeys} hidePickRate={hidePickRate} />
          ) : fifaUi && simplePickList ? (
            <div className="flex min-w-0 items-center gap-1">
              <div className="flex shrink-0 flex-col items-center gap-0.5">
                <PlayerAvatar
                  name={player.name}
                  position={player.position}
                  role={player.role}
                  imageUrl={player.imageUrl}
                  size="xs"
                />
                {hidePickRate ? null : <PickRateBadge rate={rate} fifaUi />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="fifa-pool-card__name line-clamp-2 break-words text-pretty">{player.name}</p>
              </div>
            </div>
          ) : (
            <>
          <div className="flex items-center gap-1">
            <div className="shrink-0">
              <PlayerAvatar
                name={player.name}
                position={player.position}
                role={player.role}
                imageUrl={player.imageUrl}
                size={fifaUi ? "xs" : "md"}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={
                  fifaUi
                    ? "fifa-pool-card__name line-clamp-1 break-words text-pretty"
                    : "line-clamp-2 break-words text-pretty text-sm font-bold leading-snug text-white sm:text-[15px]"
                }
              >
                {player.name}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-0.5 pl-0">
            {!simplePickList ? (
              <span
                className={
                  fifaUi
                    ? "rounded border border-[var(--fifa-border)] bg-[var(--fifa-bg-base)] px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-[var(--fifa-text-secondary)]"
                    : "rounded-lg border border-[#003087]/40 bg-[#003087]/20 px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-sky-100/95 sm:text-xs"
                }
              >
                {cur}/{lim} v nominaci
              </span>
            ) : null}
            <PickRateBadge rate={rate} fifaUi={fifaUi} />
            {canInteract && !fifaUi ? (
              <span className="text-[10px] font-medium leading-tight text-sky-200/75 sm:hidden">
                {enableDnd ? "Úchyt vlevo = táhnout" : "Klepni → přidat"}
              </span>
            ) : null}
          </div>
            </>
          )}
        </div>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onInfo();
          }}
          className={
            fifaUi
              ? "shrink-0 self-start rounded p-0.5 text-[var(--fifa-text-muted)] transition-colors hover:bg-[var(--fifa-bg-hover)] hover:text-[var(--fifa-accent-text)]"
              : "shrink-0 self-start rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/10 hover:text-[#f1c40f] sm:p-1.5"
          }
          aria-label="Detail hráče"
        >
          <Info className={`${fifaUi ? "h-2.5 w-2.5" : "h-3.5 w-3.5"}`} />
        </button>
      </div>
      {fifaUi && !compactInline && !hidePickRate ? (
        <div className="fifa-pool-card__rate-bar">
          <div className="fifa-pool-card__rate-fill" style={{ width: `${Math.round(clamp01(rate / 100) * 100)}%` }} aria-hidden />
        </div>
      ) : !fifaUi && !hidePickRate ? (
        <div className="mt-1 h-[2px] w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-sky-300/70"
            style={{ width: `${Math.round(clamp01(rate / 100) * 100)}%` }}
            aria-hidden
          />
        </div>
      ) : null}
    </div>
  );
}

const TapCard = memo(function TapCard({
  player,
  disabled,
  slotBlocks,
  inRoster,
  onAdd,
  onInfo,
  counts,
  simplePickList,
  compactInline,
  ambiguousKeys,
  fifaUi = false,
  hidePickRate = false,
}: {
  player: Player;
  disabled: boolean;
  slotBlocks: boolean;
  inRoster: boolean;
  onAdd: () => void;
  onInfo: () => void;
  counts: { G: number; D: number; F: number };
  simplePickList?: boolean;
  compactInline?: boolean;
  ambiguousKeys?: ReadonlySet<string> | null;
  fifaUi?: boolean;
  hidePickRate?: boolean;
}) {
  const lim = POSITION_LIMITS[player.position];
  const cur = counts[player.position];
  const rate = Number.isFinite(player.pick_rate) ? Math.max(0, Math.min(100, player.pick_rate)) : 0;
  const canInteract = !disabled && !slotBlocks && !inRoster;
  const muted = inRoster || disabled || slotBlocks;

  return (
    <div
      className={
        fifaUi
          ? [FIFA_POOL_CARD, fifaPoolCardKitClass(player.poolKey), muted ? "fifa-pool-card--muted" : ""]
              .filter(Boolean)
              .join(" ")
          : `relative flex flex-col gap-2 rounded-xl border p-3 ${inRoster ? "border-white/[0.07] bg-[#05080f]/45 opacity-60" : "border-white/[0.12] bg-[#0a1428]/75"} ${disabled || slotBlocks ? "opacity-55" : "opacity-100"}`
      }
    >
      <button
        type="button"
        className={`flex min-h-0 min-w-0 flex-1 touch-manipulation flex-col justify-center rounded-lg px-0 py-0 text-left ${fifaUi ? "gap-0.5" : "gap-1.5 px-0.5 py-0.5"}${compactInline ? " min-h-[2.25rem]" : ""}`}
        onClick={() => canInteract && onAdd()}
        disabled={!canInteract}
      >
        {fifaUi && simplePickList && compactInline ? (
          <CompactPickCardBody player={player} rate={rate} fifaUi={fifaUi} ambiguousKeys={ambiguousKeys} hidePickRate={hidePickRate} />
        ) : fifaUi && simplePickList ? (
          <div className="flex min-w-0 items-center gap-1 pr-4">
            <div className="flex shrink-0 flex-col items-center gap-0.5">
              <PlayerAvatar
                name={player.name}
                position={player.position}
                role={player.role}
                imageUrl={player.imageUrl}
                size="xs"
              />
              {hidePickRate ? null : <PickRateBadge rate={rate} fifaUi />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="fifa-pool-card__name line-clamp-2 break-words text-pretty">{player.name}</p>
            </div>
          </div>
        ) : (
          <>
        <div className={`flex ${fifaUi ? "items-center gap-1" : "items-start gap-2"}`}>
          <div className="shrink-0">
            <PlayerAvatar
              name={player.name}
              position={player.position}
              role={player.role}
              imageUrl={player.imageUrl}
              size={fifaUi ? "xs" : "md"}
            />
          </div>
          <div className={`min-w-0 flex-1 ${fifaUi ? "" : "pt-0.5"}`}>
            <p
              className={
                fifaUi
                  ? "fifa-pool-card__name line-clamp-1 break-words text-pretty"
                  : "line-clamp-2 break-words text-pretty text-sm font-bold leading-snug text-white"
              }
            >
              {player.name}
            </p>
          </div>
        </div>
        <div className={`flex flex-wrap items-center ${fifaUi ? "gap-0.5 pl-0" : "gap-1.5 pl-0.5"}`}>
          {!simplePickList ? (
            <span
              className={
                fifaUi
                  ? "rounded border border-[var(--fifa-border)] bg-[var(--fifa-bg-base)] px-1 py-px font-mono text-[8px] tabular-nums text-[var(--fifa-text-secondary)]"
                  : "rounded-lg border border-[#003087]/35 bg-[#003087]/15 px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-sky-100/95"
              }
            >
              {cur}/{lim}
            </span>
          ) : null}
          {!fifaUi || !simplePickList ? <PickRateBadge rate={rate} fifaUi={fifaUi} /> : null}
        </div>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onInfo();
        }}
        className={
          fifaUi
            ? "absolute right-1 top-1 rounded p-0.5 text-[var(--fifa-text-muted)] transition-colors hover:bg-[var(--fifa-bg-hover)] hover:text-[var(--fifa-accent-text)]"
            : "absolute right-2 top-2 rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/10 hover:text-[#f1c40f]"
        }
        aria-label="Detail hráče"
      >
        <Info className={`${fifaUi ? "h-2.5 w-2.5" : "h-3.5 w-3.5"}`} />
      </button>

      {fifaUi && !compactInline && !hidePickRate ? (
        <div className="fifa-pool-card__rate-bar">
          <div className="fifa-pool-card__rate-fill" style={{ width: `${Math.round(clamp01(rate / 100) * 100)}%` }} aria-hidden />
        </div>
      ) : !fifaUi && !hidePickRate ? (
        <div className="mt-1 h-[2px] w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-sky-300/70"
            style={{ width: `${Math.round(clamp01(rate / 100) * 100)}%` }}
            aria-hidden
          />
        </div>
      ) : null}
    </div>
  );
});

interface PlayerPoolPanelProps {
  players: Player[];
  usedIds: Set<string>;
  counts: { G: number; D: number; F: number };
  onAddPlayer: (player: Player) => void;
  onPreview: (player: Player) => void;
  /** Desktop: drag&drop; mobile: často lepší tap-only. */
  enableDnd?: boolean;
  /** Když je ve sestavě vybraný slot — zúží výběr na danou pozici. */
  forcedPosition?: Position | null;
  /** Při vybraném slotu — kdo může na něj (např. náhr. D jen po 7. bekovi). Ostatní karty se ztmaví. */
  assignableFilter?: (player: Player) => boolean;
  /** Doplňková nápověda pod bannerem (např. pravidla pro náhradního D). */
  slotHint?: string | null;
  /** Nominace / zápasová sestava: jméno, %, pozice a info na cihle; klub v modalu Info. */
  simplePickList?: boolean;
  /** Po kliknutí na jinou pozici zruší výběr slotu ve sestavě (uvolní filtr). */
  onClearSelectedSlot?: () => void;
  /** FIFA design — kompaktní karty a jednotné filtry. */
  uiVariant?: "classic" | "fifa";
  /** Počet sloupců karet — 3 na desktopu v úzkém levém panelu editoru. */
  gridColumns?: 2 | 3;
  /** Mobilní inline pool pod ledem — ultra kompaktní filtry a karty. */
  compactInline?: boolean;
  /** Volitelná nápověda při prázdném poolu (schema vs. opravdu prázdný klub). */
  emptyHint?: string | null;
  /** Historical Lineup — bez % popularity a řazení podle ní. */
  hidePickRate?: boolean;
}

export function PlayerPoolPanel({
  players,
  usedIds,
  counts,
  onAddPlayer,
  onPreview,
  enableDnd = true,
  forcedPosition = null,
  assignableFilter,
  simplePickList = false,
  onClearSelectedSlot,
  uiVariant = "classic",
  gridColumns = 2,
  compactInline = false,
  emptyHint = null,
  hidePickRate = false,
}: PlayerPoolPanelProps) {
  const fifaUi = uiVariant === "fifa";
  const denseGrid = gridColumns === 3 || compactInline;
  const ambiguousLastNameKeys = useMemo(() => getAmbiguousLastNameKeys(players), [players]);
  const [tab, setTab] = useState<Tab>("all");
  /** Při vybraném slotu ve sestavě zrcadlíme pozici bez synchronizace přes effect. */
  const activeTab: Tab = tab;

  useEffect(() => {
    if (forcedPosition) setTab(forcedPosition);
  }, [forcedPosition]);

  const [q, setQ] = useState("");
  const [league, setLeague] = useState<string>("");
  const [pickSort, setPickSort] = useState<PickRateSort>("popular");

  const leagues = useMemo(() => {
    const s = new Set<string>();
    players.forEach((p) => p.league && s.add(p.league));
    return Array.from(s).sort();
  }, [players]);

  const filtered = useMemo(() => {
    let list = players;
    const posFilter = forcedPosition ?? (tab === "all" ? null : tab);
    if (posFilter) list = list.filter((p) => p.position === posFilter);
    else if (tab !== "all") list = list.filter((p) => p.position === tab);
    if (league && !simplePickList) list = list.filter((p) => p.league === league);
    const nq = q.trim().toLowerCase();
    if (nq) {
      list = list.filter((p) =>
        simplePickList
          ? p.name.toLowerCase().includes(nq)
          : p.name.toLowerCase().includes(nq) ||
              p.club.toLowerCase().includes(nq) ||
              (p.league && p.league.toLowerCase().includes(nq))
      );
    }
    // pick rate sort
    if (hidePickRate) {
      return [...list].sort((a, b) => {
        const al = a.name.trim().split(/\s+/).pop() ?? a.name;
        const bl = b.name.trim().split(/\s+/).pop() ?? b.name;
        return al.localeCompare(bl, "cs") || a.name.localeCompare(b.name, "cs");
      });
    }
    return sortPlayersByPickRate(list, pickSort === "popular" ? "desc" : "asc");
  }, [players, tab, league, q, forcedPosition, pickSort, simplePickList, hidePickRate]);

  const canAdd = (player: Player) => {
    if (usedIds.has(player.id)) return false;
    const lim = POSITION_LIMITS[player.position];
    return counts[player.position] < lim;
  };

  if (players.length === 0) {
    return (
      <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-8 text-center">
        <p className="font-medium text-amber-200">Žádní hráči v databázi</p>
        <p className="mt-2 text-sm text-white/50">
          {emptyHint ?? (
            <>
              Lokálně / na Railway:{" "}
              <code className="rounded bg-black/40 px-2 py-0.5 text-amber-200/90">npm run db:push</code>
              {" "}pak{" "}
              <code className="rounded bg-black/40 px-2 py-0.5 text-amber-200/90">npm run import:lineup-pools</code>
            </>
          )}
        </p>
      </div>
    );
  }

  const tabLabels = compactInline
    ? ([
        ["all", "Vše"],
        ["G", "G"],
        ["D", "D"],
        ["F", "F"],
      ] as const)
    : ([
        ["all", "Všichni"],
        ["G", POSITION_LABELS.G],
        ["D", POSITION_LABELS.D],
        ["F", POSITION_LABELS.F],
      ] as const);

  const tabsBlock = (
      <div
        className={
          fifaUi
            ? FIFA_EDITOR_TABS
            : `sticky top-0 z-20 flex flex-wrap gap-2 rounded-2xl border border-white/[0.1] bg-[#0a1428]/95 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_32px_rgba(0,48,135,0.15)] backdrop-blur-sm`
        }
      >
        {tabLabels.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => {
              if (forcedPosition && key !== forcedPosition && key !== "all") {
                onClearSelectedSlot?.();
              } else if (forcedPosition && key === "all") {
                onClearSelectedSlot?.();
              }
              setTab(key);
            }}
            className={
              fifaUi
                ? activeTab === key
                  ? FIFA_EDITOR_TAB_ACTIVE
                  : FIFA_EDITOR_TAB
                : `
              flex-1 min-w-[4.5rem] rounded-xl px-2.5 py-2.5 font-display text-sm font-bold tracking-wide transition-all sm:px-3 sm:py-3
              ${
                activeTab === key
                  ? "bg-gradient-to-b from-[#c8102e] via-[#9e0c24] to-[#003087] text-white shadow-[0_8px_32px_rgba(200,16,46,0.4),0_0_0_1px_rgba(241,196,15,0.35)] ring-1 ring-white/25"
                  : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
              }
            `
            }
          >
            {label}
          </button>
        ))}
      </div>
  );

  const searchBlock = (
      <div className="relative min-w-0 flex-1">
        <Search
          className={`pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 ${fifaUi ? "text-[var(--fifa-text-muted)]" : "text-[#f1c40f]/50"}`}
        />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={compactInline ? "Hledat…" : simplePickList ? "Hledat podle jména…" : "Hledat jméno, klub, ligu…"}
          className={
            fifaUi
              ? `${FIFA_EDITOR_INPUT}${compactInline ? " pl-7" : ""}`
              : "w-full rounded-2xl border border-white/[0.12] bg-[#0a1428]/80 py-3.5 pl-11 pr-3.5 text-sm text-white shadow-[inset_0_2px_8px_rgba(0,0,0,0.25)] placeholder:text-slate-500 focus:border-[#f1c40f]/45 focus:outline-none focus:ring-2 focus:ring-[#c8102e]/25 sm:py-4 sm:pr-4"
          }
        />
      </div>
  );

  /** Search + sort share one row (mobile compact + desktop/simple pick list). */
  const searchSortInline = compactInline || simplePickList;

  const sortSelect = (
        <select
          value={pickSort}
          onChange={(e) => setPickSort(e.target.value as PickRateSort)}
          className={`${fifaUi ? FIFA_EDITOR_SELECT : "rounded-xl border border-white/[0.12] bg-[#0a1428]/80 px-3 py-3 text-sm text-white focus:border-[#f1c40f]/40 focus:outline-none focus:ring-1 focus:ring-[#f1c40f]/20"} shrink-0${compactInline ? " fifa-editor-pool-sort--compact" : ""}${simplePickList && !compactInline ? " fifa-editor-pool-sort--inline" : ""}`}
          aria-label="Řazení podle oblíbenosti"
        >
          <option value="popular">{compactInline ? "Top" : "Nejoblíbenější"}</option>
          <option value="unique">{compactInline ? "Unik." : "Unikátní"}</option>
        </select>
  );

  const filterControlsBlock =
    compactInline || simplePickList ? null : (
      <div className="flex flex-wrap items-center gap-2">
        <Filter className={`h-4 w-4 ${fifaUi ? "text-[var(--fifa-text-muted)]" : "text-[#c8102e]/70"}`} />
        <select
          value={league}
          onChange={(e) => setLeague(e.target.value)}
          className={fifaUi ? FIFA_EDITOR_SELECT : "rounded-xl border border-white/[0.12] bg-[#0a1428]/80 px-3 py-3 text-sm text-white focus:border-[#f1c40f]/40 focus:outline-none focus:ring-1 focus:ring-[#f1c40f]/20"}
        >
          <option value="">Všechny ligy</option>
          {leagues.map((lg) => (
            <option key={lg} value={lg}>
              {lg}
            </option>
          ))}
        </select>
        {sortSelect}
      </div>
  );

  const searchToolbarBlock = searchSortInline ? (
    <div className={`fifa-editor-pool-toolbar flex min-w-0 items-center ${compactInline ? "gap-1" : "gap-1.5"}`}>
      {searchBlock}
      {hidePickRate ? null : sortSelect}
    </div>
  ) : null;

  const playerGridBlock = (
      <div
        className={
          compactInline
            ? "fifa-pool-grid fifa-pool-grid--cols-3 fifa-pool-grid--inline-compact grid grid-cols-3 gap-0.5"
            : denseGrid
            ? fifaUi
              ? "fifa-pool-grid fifa-pool-grid--cols-3 grid grid-cols-2 gap-1 sm:grid-cols-4 lg:grid-cols-6"
              : "grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
            : fifaUi
              ? "fifa-pool-grid fifa-pool-grid--cols-2 grid grid-cols-2 gap-1"
              : "grid gap-3 sm:grid-cols-2 sm:gap-3"
        }
      >
        {filtered.map((player) => {
          const inRoster = usedIds.has(player.id);
          const disabled = !canAdd(player);
          const slotBlocks = assignableFilter ? !assignableFilter(player) : false;
          return (
            <div
              key={player.id}
              className={
                compactInline
                  ? "[content-visibility:auto] [contain-intrinsic-size:56px]"
                  : denseGrid
                    ? "[content-visibility:auto] [contain-intrinsic-size:60px]"
                    : "[content-visibility:auto] [contain-intrinsic-size:84px]"
              }
            >
              {enableDnd ? (
                <DraggableCard
                  player={player}
                  disabled={disabled}
                  slotBlocks={slotBlocks}
                  inRoster={inRoster}
                  counts={counts}
                  enableDnd
                  simplePickList={simplePickList}
                  compactInline={compactInline}
                  ambiguousKeys={ambiguousLastNameKeys}
                  fifaUi={fifaUi}
                  hidePickRate={hidePickRate}
                  onAdd={() => onAddPlayer(player)}
                  onInfo={() => onPreview(player)}
                />
              ) : (
                <TapCard
                  player={player}
                  disabled={disabled}
                  slotBlocks={slotBlocks}
                  inRoster={inRoster}
                  counts={counts}
                  simplePickList={simplePickList}
                  compactInline={compactInline}
                  ambiguousKeys={ambiguousLastNameKeys}
                  fifaUi={fifaUi}
                  hidePickRate={hidePickRate}
                  onAdd={() => onAddPlayer(player)}
                  onInfo={() => onPreview(player)}
                />
              )}
            </div>
          );
        })}
      </div>
  );

  const emptyBlock =
    filtered.length === 0 ? (
      <p className={`py-8 text-center text-sm ${fifaUi ? "text-[var(--fifa-text-muted)]" : "text-white/40"}`}>
        Žádní hráči nevyhovují filtru.
      </p>
    ) : null;

  const legendBlock = <PoolAbbrevLegend fifaUi={fifaUi} />;

  if (fifaUi) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className={`${FIFA_EDITOR_POOL_FILTERS} shrink-0 ${compactInline ? "" : "space-y-3"}`}>
          {tabsBlock}
          {searchSortInline ? searchToolbarBlock : searchBlock}
          {filterControlsBlock}
        </div>
        <div className={`${FIFA_EDITOR_SCROLL} min-h-0 flex-1 overflow-y-auto overscroll-contain ${compactInline ? "pt-0.5" : "pt-1"}`}>
          <div className={compactInline ? "pb-1" : "space-y-3 pb-1"}>
            {playerGridBlock}
            {emptyBlock}
            {!compactInline ? legendBlock : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {tabsBlock}
      {searchSortInline ? searchToolbarBlock : searchBlock}
      {filterControlsBlock}
      {playerGridBlock}
      {emptyBlock}
      {legendBlock}
    </div>
  );
}
