"use client";

import { useId } from "react";
import { Sparkles } from "lucide-react";
import { NamesOnlySharePoster } from "@/components/NamesOnlySharePoster";
import { Nhl25SharePoster } from "@/components/Nhl25SharePoster";
import { SquadPromoPreview } from "@/components/marketing/SquadPromoPreview";
import {
  PROMO_FB_CAPTAIN_ID,
  PROMO_FB_LINEUP,
  PROMO_FB_PLAYERS,
  PROMO_FB_TITLE,
} from "@/lib/promoFbCoverData";
import { SITE_BRAND, SITE_LOGO_URL } from "@/lib/siteBranding";
import { SOCIAL_COVER_HEIGHT, SOCIAL_COVER_WIDTH } from "@/lib/socialCoverDimensions";
import { SocialCoverBackdrop } from "@/components/social/SocialCoverBackdrop";

const POSTER_CAPTURE_W = 920;
/** Větší náhledy dresů než na FB promo mini — stále stejný capture šířky 920px. */
const POSTER_DISPLAY_W = 440;
const POSTER_SCALE = POSTER_DISPLAY_W / POSTER_CAPTURE_W;
const POSTER_CLIP_H_JERSEYS = 312;
const POSTER_CLIP_H_NAMES = 292;

const PROMO_POSTER_ISO = "2026-04-14T12:00:00.000Z";

function CoverPosterThumb({
  title,
  variant,
}: {
  title: string;
  variant: "jerseys" | "names";
}) {
  const hClip = variant === "jerseys" ? POSTER_CLIP_H_JERSEYS : POSTER_CLIP_H_NAMES;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-1.5">
      <p className="text-center font-display text-[11px] font-bold uppercase tracking-[0.22em] text-white/65">{title}</p>
      <div
        className="relative w-full overflow-hidden rounded-xl border border-white/[0.16] bg-slate-100/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
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

/**
 * Statické plátno 1640×856 — jen vizuály pro screenshot (bez navigace, toastů, editoru).
 */
export function SocialCoverCanvas() {
  const reactId = useId();
  const svgPrefix = `sc${reactId.replace(/:/g, "")}`;

  return (
    <div
      className="social-cover-canvas relative mx-auto overflow-hidden rounded-xl shadow-[0_40px_120px_rgba(0,0,0,0.75)] ring-2 ring-white/[0.12]"
      style={{ width: SOCIAL_COVER_WIDTH, height: SOCIAL_COVER_HEIGHT }}
    >
      <SocialCoverBackdrop prefix={svgPrefix} />

      <div className="relative z-10 flex h-full flex-col px-8 pb-7 pt-7">
        <header className="flex flex-wrap items-start gap-x-10 gap-y-4 border-b border-white/[0.08] pb-5">
          <div className="flex min-w-0 shrink-0 items-center gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={SITE_LOGO_URL}
              alt=""
              width={960}
              height={288}
              className="h-[6.5rem] w-auto shrink-0 object-contain object-left drop-shadow-[0_14px_48px_rgba(0,0,0,0.65)]"
            />
            <div className="min-w-0 border-l border-white/[0.14] pl-5">
              <p className="font-display text-[12px] font-black uppercase tracking-[0.28em] text-[#c8102e] drop-shadow-sm">
                LINEUP MS 2026
              </p>
              <p className="mt-1 font-display text-[10px] font-bold uppercase tracking-[0.26em] text-white/55">
                Fanouškovský web
              </p>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-3 md:max-w-[720px]">
            <div className="inline-flex w-max max-w-full items-center gap-2 rounded-full border border-[#c8102e]/40 bg-[#c8102e]/18 px-3 py-1.5">
              <Sparkles className="h-4 w-4 shrink-0 text-sky-300" aria-hidden />
              <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-red-100/95">
                Časový bonus · žebříček · play-off tip
              </span>
            </div>
            <h1 className="font-display text-[2.05rem] font-black uppercase leading-[1.06] tracking-[0.03em] text-white drop-shadow-[0_8px_36px_rgba(0,0,0,0.55)] md:text-[2.35rem]">
              Sestav repre.{" "}
              <span className="bg-gradient-to-r from-white via-sky-100 to-sky-300 bg-clip-text text-transparent">
                Vyhraj pozornost.
              </span>
            </h1>
          </div>
        </header>

        <div className="relative mt-4 flex min-h-0 flex-1 gap-5">
          <div className="flex h-full min-h-0 w-[42%] min-w-0 flex-col">
            <SquadPromoPreview />
          </div>
          <div className="flex min-h-0 min-w-0 flex-1 items-start gap-4">
            <CoverPosterThumb variant="jerseys" title="Plakát · dresy" />
            <CoverPosterThumb variant="names" title="Plakát · jména" />
          </div>

          <div
            className="pointer-events-none absolute inset-x-8 bottom-[5.25rem] top-[36%] flex items-center justify-center px-4"
            aria-hidden
          >
            <p
              className="max-w-[98%] text-center font-display text-[clamp(2.1rem,3.9vw,3.45rem)] font-black uppercase leading-[1.08] tracking-[0.06em]"
              style={{
                color: "#ffffff",
                textShadow:
                  "0 2px 0 rgba(200,16,46,0.65), 0 8px 32px rgba(0,0,0,0.88), 0 0 48px rgba(0,0,0,0.55), 0 0 2px rgba(10,10,10,0.9)",
              }}
            >
              Sestav si repre na{" "}
              <span style={{ color: "#fecaca" }}>MS 2026</span>
            </p>
          </div>
        </div>

        <footer className="relative z-[2] mt-auto flex items-end justify-end border-t border-white/[0.09] pt-5">
          <div className="text-right">
            <p className="font-display text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">{SITE_BRAND}</p>
            <p className="font-display text-[1.85rem] font-black tracking-wide text-white drop-shadow-[0_0_32px_rgba(56,189,248,0.38)]">
              hokejlineup.cz
            </p>
          </div>
        </footer>
      </div>

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/[0.035]"
        aria-hidden
      />
    </div>
  );
}
