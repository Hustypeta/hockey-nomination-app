"use client";

import { useId } from "react";
import { LayoutGrid, MessageSquare, Share2, Sparkles, Trophy, Users } from "lucide-react";
import { LineupJerseyCard } from "@/components/sestava/LineupJerseyCard";
import { NamesOnlySharePoster } from "@/components/NamesOnlySharePoster";
import { Nhl25SharePoster } from "@/components/Nhl25SharePoster";
import { FB_PROMO_HEIGHT, FB_PROMO_WIDTH } from "@/components/marketing/fbCoverDimensions";
import {
  PROMO_FB_CAPTAIN_ID,
  PROMO_FB_LINEUP,
  PROMO_FB_PLAYERS,
  PROMO_FB_TITLE,
} from "@/lib/promoFbCoverData";
import type { Player } from "@/types";
import { SITE_LOGO_URL } from "@/lib/siteBranding";

const POSTER_CAPTURE_W = 920;
/** Fixní čas pro neměnný export plakátu v promo (SSR i klient). */
const PROMO_POSTER_ISO = "2026-04-14T12:00:00.000Z";

function IceBackdrop({ prefix }: { prefix: string }) {
  const pid = prefix.replace(/[^a-zA-Z0-9_-]/g, "");
  const ice = `${pid}-fb-ice`;
  const rink = `${pid}-fb-rink`;
  const glowR = `${pid}-fb-glow-r`;
  const glowB = `${pid}-fb-glow-b`;

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox={`0 0 ${FB_PROMO_WIDTH} ${FB_PROMO_HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={ice} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0a1628" />
          <stop offset="45%" stopColor="#05080f" />
          <stop offset="100%" stopColor="#02040a" />
        </linearGradient>
        <linearGradient id={rink} x1="600" y1="380" x2="600" y2="630" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(56,189,248,0.14)" />
          <stop offset="100%" stopColor="rgba(5,8,15,0.96)" />
        </linearGradient>
        <radialGradient id={glowR} cx="18%" cy="22%" r="45%">
          <stop offset="0%" stopColor="#c8102e" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#c8102e" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={glowB} cx="88%" cy="18%" r="42%">
          <stop offset="0%" stopColor="#003087" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#003087" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={FB_PROMO_WIDTH} height={FB_PROMO_HEIGHT} fill={`url(#${ice})`} />
      <ellipse cx="180" cy="120" rx="340" ry="260" fill={`url(#${glowR})`} />
      <ellipse cx="1040" cy="100" rx="300" ry="220" fill={`url(#${glowB})`} />
      <path d="M0 420 Q400 360 800 400 T1200 410 V630 H0Z" fill={`url(#${rink})`} />
      <path
        d="M0 455 H1200"
        stroke="rgba(255,255,255,0.11)"
        strokeWidth="2"
        strokeDasharray="16 12"
      />
      <circle cx="600" cy="505" r="52" fill="none" stroke="rgba(200,16,46,0.35)" strokeWidth="2.2" />
      <circle cx="600" cy="505" r="8" fill="#c8102e" opacity="0.55" />
    </svg>
  );
}

function playerById(players: Player[], id: string | null): Player | null {
  if (!id) return null;
  return players.find((p) => p.id === id) ?? null;
}

function SquadBuilderPreview() {
  const lineup = PROMO_FB_LINEUP;
  const aids = lineup.assistantIds ?? [];
  const cap = PROMO_FB_CAPTAIN_ID;
  const get = (id: string | null) => playerById(PROMO_FB_PLAYERS, id);

  const lineBadge = "text-[7px] font-semibold uppercase tracking-[0.18em] text-white/38";

  const row = (
    lw: string | null,
    c: string | null,
    rw: string | null,
    labels: readonly [string, string, string],
    scale: string
  ) => (
    <div className={`mx-auto flex w-max justify-center gap-0.5 ${scale}`}>
      <LineupJerseyCard
        player={get(lw)}
        positionLabel={labels[0]}
        size="compact"
        isCaptain={!!lw && cap === lw}
        isAssistant={!!lw && aids.includes(lw)}
        disableMotion
      />
      <LineupJerseyCard
        player={get(c)}
        positionLabel={labels[1]}
        size="compact"
        isCaptain={!!c && cap === c}
        isAssistant={!!c && aids.includes(c)}
        disableMotion
      />
      <LineupJerseyCard
        player={get(rw)}
        positionLabel={labels[2]}
        size="compact"
        isCaptain={!!rw && cap === rw}
        isAssistant={!!rw && aids.includes(rw)}
        disableMotion
      />
    </div>
  );

  const g1 = lineup.goalies[0];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.11] bg-gradient-to-br from-[#0c182e]/96 via-[#060a14]/94 to-[#03050a]/98 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.55)] ring-1 ring-white/[0.05] backdrop-blur-md">
      <div className="pointer-events-none absolute -right-10 top-0 h-36 w-36 rounded-full bg-[#00B4FF]/10 blur-3xl" aria-hidden />
      <div className="relative mb-1.5 flex items-center justify-between gap-2 border-b border-white/[0.07] pb-1.5">
        <p className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-sky-200/88">Squad builder</p>
        <span className="rounded bg-[#c8102e]/28 px-1.5 py-0.5 font-display text-[8px] font-bold uppercase tracking-wider text-red-100/95">
          NHL 25
        </span>
      </div>

      <div className="relative space-y-1">
        <p className={`${lineBadge} pl-0.5`}>1. lajna</p>
        {row(lineup.forwardLines[0].lw, lineup.forwardLines[0].c, lineup.forwardLines[0].rw, ["LW", "C", "RW"], "origin-top scale-[0.5]")}
        <p className={`${lineBadge} mt-1 pl-0.5`}>2. lajna</p>
        {row(lineup.forwardLines[1].lw, lineup.forwardLines[1].c, lineup.forwardLines[1].rw, ["LW", "C", "RW"], "origin-top scale-[0.5]")}
        <p className={`${lineBadge} mt-1 pl-0.5`}>1. golman</p>
        <div className="mx-auto flex w-max justify-center origin-top scale-[0.52]">
          <LineupJerseyCard
            player={get(g1)}
            positionLabel="G"
            size="goalie"
            isCaptain={!!g1 && cap === g1}
            isAssistant={!!g1 && aids.includes(g1)}
            disableMotion
          />
        </div>
      </div>
    </div>
  );
}

function MiniPosterThumb({
  title,
  variant,
}: {
  title: string;
  variant: "jerseys" | "names";
}) {
  const scale = 158 / POSTER_CAPTURE_W;
  const hClip = variant === "jerseys" ? 118 : 112;

  return (
    <div className="flex flex-col gap-1">
      <p className="text-center font-display text-[8px] font-bold uppercase tracking-[0.22em] text-white/48">{title}</p>
      <div
        className="relative overflow-hidden rounded-xl border border-white/[0.12] bg-black/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
        style={{
          width: POSTER_CAPTURE_W * scale,
          height: hClip,
        }}
      >
        <div
          className="pointer-events-none absolute left-0 top-0 origin-top-left"
          style={{
            transform: `scale(${scale})`,
            width: POSTER_CAPTURE_W,
          }}
        >
          {variant === "jerseys" ? (
            <Nhl25SharePoster
              players={PROMO_FB_PLAYERS}
              lineup={PROMO_FB_LINEUP}
              nominationTitle={PROMO_FB_TITLE}
              siteUrl="hokejlineup.cz"
              posterTheme="light"
              captainId={PROMO_FB_CAPTAIN_ID}
              assistantIds={PROMO_FB_LINEUP.assistantIds ?? []}
              footerInstantIso={PROMO_POSTER_ISO}
            />
          ) : (
            <NamesOnlySharePoster
              players={PROMO_FB_PLAYERS}
              lineup={PROMO_FB_LINEUP}
              nominationTitle={PROMO_FB_TITLE}
              siteUrl="hokejlineup.cz"
              footerInstantIso={PROMO_POSTER_ISO}
            />
          )}
        </div>
      </div>
    </div>
  );
}

const feat = [
  { icon: Trophy, label: "Soutěž", sub: "časový bonus", color: "text-amber-200" },
  { icon: LayoutGrid, label: "Pick’em", sub: "play-off bracket", color: "text-sky-200" },
  { icon: MessageSquare, label: "Fórum", sub: "diskuse", color: "text-emerald-200" },
  { icon: Share2, label: "Sdílení", sub: "plakát & odkaz", color: "text-fuchsia-200" },
] as const;

export function FbCoverPromoArt() {
  const reactId = useId();
  const svgPrefix = `fb${reactId.replace(/:/g, "")}`;

  return (
    <div
      className="relative mx-auto overflow-hidden rounded-lg shadow-[0_40px_120px_rgba(0,0,0,0.65)] ring-2 ring-white/10"
      style={{ width: FB_PROMO_WIDTH, height: FB_PROMO_HEIGHT }}
    >
      <IceBackdrop prefix={svgPrefix} />

      <div className="relative z-10 flex h-full flex-col px-8 pb-5 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={SITE_LOGO_URL}
              alt=""
              width={960}
              height={288}
              className="h-[12rem] w-auto shrink-0 object-contain object-left drop-shadow-[0_12px_40px_rgba(0,0,0,0.65)] md:h-[13.5rem]"
            />
            <div className="min-w-0 border-l border-white/[0.12] pl-5">
              <p className="font-display text-[10px] font-bold uppercase tracking-[0.26em] text-white/45">Fanouškovský web</p>
              <p className="font-display text-2xl font-black uppercase tracking-[0.12em] text-white drop-shadow-md md:text-3xl">
                MS 2026
              </p>
            </div>
          </div>
          <div className="hidden shrink-0 items-center gap-2 rounded-xl border border-sky-400/20 bg-black/35 px-3 py-1.5 sm:flex">
            <Users className="h-4 w-4 text-sky-300" aria-hidden />
            <div className="text-right leading-tight">
              <p className="font-display text-[8px] font-bold uppercase tracking-[0.2em] text-white/45">130+ hráčů</p>
              <p className="text-[11px] font-semibold text-white/85">reálný výběr repre</p>
            </div>
          </div>
        </div>

        <div className="mt-3 flex min-h-0 flex-1 gap-5">
          <div className="flex min-w-0 max-w-[310px] shrink-0 flex-col justify-center gap-3">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#c8102e]/35 bg-[#c8102e]/15 px-2.5 py-1">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-sky-300" aria-hidden />
              <span className="font-display text-[9px] font-bold uppercase tracking-[0.18em] text-red-100/95">
                Časový bonus · žebříček · play-off tip
              </span>
            </div>
            <h1 className="font-display text-[2.05rem] font-black uppercase leading-[1.02] tracking-[0.02em] text-white drop-shadow-[0_6px_40px_rgba(0,0,0,0.45)] sm:text-[2.2rem]">
              Sestav repre.
              <br />
              <span className="bg-gradient-to-r from-white via-sky-100 to-sky-300 bg-clip-text text-transparent">
                Vyhraj pozornost.
              </span>
            </h1>
            <p className="max-w-[300px] text-[13px] font-medium leading-snug text-slate-200/90 sm:text-sm">
              Editor sestavy, soutěž o dres, Pick’em bracket a fórum — vše na jednom místě pro fanoušky hokeje.
            </p>
          </div>

          <div className="flex min-w-0 flex-1 items-start justify-center gap-4 pt-1">
            <div className="max-w-[340px] shrink">
              <SquadBuilderPreview />
            </div>
            <div className="flex shrink-0 flex-col gap-2 pr-0.5">
              <MiniPosterThumb variant="jerseys" title="Plakát · dresy" />
              <MiniPosterThumb variant="names" title="Plakát · jen jména" />
            </div>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3 border-t border-white/[0.08] pt-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {feat.map(({ icon: Icon, label, sub, color }) => (
              <div
                key={`${label}-${sub}`}
                className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-black/45 px-2.5 py-1.5 shadow-inner shadow-black/40"
              >
                <Icon className={`h-4 w-4 shrink-0 ${color}`} aria-hidden />
                <div className="leading-tight">
                  <p className="font-display text-[10px] font-bold uppercase tracking-wide text-white">{label}</p>
                  <p className="text-[9px] text-white/45">{sub}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-right">
            <p className="font-display text-[9px] font-bold uppercase tracking-[0.35em] text-white/35">Web</p>
            <p className="font-display text-[1.65rem] font-black tracking-wide text-white drop-shadow-[0_0_28px_rgba(56,189,248,0.35)]">
              hokejlineup.cz
            </p>
          </div>
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/[0.03]"
        aria-hidden
      />
    </div>
  );
}
