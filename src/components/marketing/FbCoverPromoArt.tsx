"use client";

import { useId } from "react";
import { LayoutGrid, MessageSquare, Share2, Sparkles, Trophy, Users } from "lucide-react";
import { NamesOnlySharePoster } from "@/components/NamesOnlySharePoster";
import { Nhl25SharePoster } from "@/components/Nhl25SharePoster";
import { FB_PROMO_HEIGHT, FB_PROMO_WIDTH } from "@/components/marketing/fbCoverDimensions";
import { SquadPromoPreview } from "@/components/marketing/SquadPromoPreview";
import {
  PROMO_FB_CAPTAIN_ID,
  PROMO_FB_LINEUP,
  PROMO_FB_PLAYERS,
  PROMO_FB_TITLE,
} from "@/lib/promoFbCoverData";
import { SITE_LOGO_URL } from "@/lib/siteBranding";

const POSTER_CAPTURE_W = 920;
/** Šířka náhledu — max. využití šířky plátna (dva vedle sebe). */
const POSTER_DISPLAY_W = 378;
const POSTER_SCALE = POSTER_DISPLAY_W / POSTER_CAPTURE_W;
/** Viditelná výška ořezu — vyšší pás pro zaplnění výšky mezi hlavičkou a patičkou. */
const POSTER_CLIP_H_JERSEYS = 278;
const POSTER_CLIP_H_NAMES = 258;
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

function MiniPosterThumb({
  title,
  variant,
}: {
  title: string;
  variant: "jerseys" | "names";
}) {
  const hClip = variant === "jerseys" ? POSTER_CLIP_H_JERSEYS : POSTER_CLIP_H_NAMES;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-1">
      <p className="text-center font-display text-[9px] font-bold uppercase tracking-[0.2em] text-white/55">{title}</p>
      <div
        className="relative w-full overflow-hidden rounded-xl border border-white/[0.14] bg-slate-100/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
        style={{
          width: POSTER_CAPTURE_W * POSTER_SCALE,
          height: hClip,
        }}
      >
        <div
          className="pointer-events-none absolute left-0 top-0 origin-top-left"
          style={{
            transform: `scale(${POSTER_SCALE})`,
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

      <div className="relative z-10 flex h-full flex-col pb-2 pl-4 pr-3 pt-3 sm:pl-5 sm:pr-4">
        {/* Horní řádek: logo + MS 2026 + nadpis vedle sebe */}
        <div className="flex flex-wrap items-start gap-x-5 gap-y-3">
          <div className="flex min-w-0 shrink-0 items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={SITE_LOGO_URL}
              alt=""
              width={960}
              height={288}
              className="h-[7.25rem] w-auto shrink-0 object-contain object-left drop-shadow-[0_12px_40px_rgba(0,0,0,0.65)] sm:h-[7.75rem]"
            />
            <div className="min-w-0 border-l border-white/[0.12] pl-4">
              <p className="font-display text-[10px] font-bold uppercase tracking-[0.26em] text-white/45">Fanouškovský web</p>
              <p className="font-display text-2xl font-black uppercase tracking-[0.12em] text-white drop-shadow-md md:text-[1.75rem]">
                MS 2026
              </p>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1.5 border-l border-white/[0.08] pl-4 sm:gap-2 sm:pl-5 md:min-w-[320px]">
            <div className="inline-flex w-max max-w-full items-center gap-2 rounded-full border border-[#c8102e]/35 bg-[#c8102e]/15 px-2.5 py-1">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-sky-300" aria-hidden />
              <span className="font-display text-[9px] font-bold uppercase tracking-[0.18em] text-red-100/95">
                Časový bonus · žebříček · play-off tip
              </span>
            </div>
            <h1 className="font-display text-[1.55rem] font-black uppercase leading-[1.08] tracking-[0.02em] text-white drop-shadow-[0_6px_40px_rgba(0,0,0,0.45)] sm:text-[1.7rem] md:text-[1.85rem]">
              Sestav repre.{" "}
              <span className="bg-gradient-to-r from-white via-sky-100 to-sky-300 bg-clip-text text-transparent">
                Vyhraj pozornost.
              </span>
            </h1>
            <p className="max-w-full text-[10px] font-medium leading-snug text-slate-200/88 sm:text-[11px] md:max-w-[560px]">
              Editor sestavy, soutěž o dres, Pick’em bracket a fórum — vše na jednom místě pro fanoušky hokeje.
            </p>
          </div>

          <div className="ml-auto hidden shrink-0 items-center gap-2 rounded-xl border border-sky-400/20 bg-black/35 px-3 py-1.5 sm:flex">
            <Users className="h-4 w-4 text-sky-300" aria-hidden />
            <div className="text-right leading-tight">
              <p className="font-display text-[8px] font-bold uppercase tracking-[0.2em] text-white/45">130+ hráčů</p>
              <p className="text-[11px] font-semibold text-white/85">reálný výběr repre</p>
            </div>
          </div>
        </div>

        {/* Hlavní vizuály — roztažení až k pravému okraji */}
        <div className="mt-2 flex min-h-0 flex-1 items-stretch gap-2 overflow-visible sm:mt-3 sm:gap-3">
          <div className="flex h-full min-h-0 min-w-0 max-w-[min(100%,520px)] flex-[1_1_42%] flex-col">
            <SquadPromoPreview />
          </div>
          <div className="flex min-h-0 min-w-0 flex-[1.4] items-start gap-2 sm:gap-2.5">
            <MiniPosterThumb variant="jerseys" title="Plakát · dresy" />
            <MiniPosterThumb variant="names" title="Plakát · jména" />
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-2 border-t border-white/[0.08] pt-2 sm:flex-row sm:items-end sm:justify-between sm:pt-2.5">
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
