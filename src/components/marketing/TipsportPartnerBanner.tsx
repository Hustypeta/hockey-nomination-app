"use client";

import { useState } from "react";
import { TIPSPORT_BANNER_IMAGE_SRC, TIPSPORT_PARTNER_HREF } from "@/lib/tipsportPromo";

type TipsportPartnerBannerProps = {
  className?: string;
  /** Kompaktní varianta pro loading screen. */
  compact?: boolean;
};

function TipsportVisualFallback({ compact }: { compact: boolean }) {
  return (
    <div
      className={`flex w-full flex-col items-center justify-center bg-gradient-to-br from-[#008f45] via-[#00a550] to-[#007a3d] text-center ${
        compact ? "min-h-[5.5rem] px-4 py-4" : "min-h-[7rem] px-6 py-6 sm:min-h-[7.5rem]"
      }`}
    >
      <span
        className={`font-display font-black uppercase tracking-[0.22em] text-white drop-shadow-sm ${
          compact ? "text-2xl" : "text-3xl sm:text-4xl"
        }`}
      >
        Tipsport
      </span>
      <span className={`mt-1 font-semibold text-white/90 ${compact ? "text-xs" : "text-sm sm:text-base"}`}>
        Sázková kancelář · Registrace
      </span>
    </div>
  );
}

export function TipsportPartnerBanner({ className = "", compact = false }: TipsportPartnerBannerProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = !imgFailed;

  return (
    <div className={className}>
      {!compact ? (
        <>
          <div
            className="mx-auto mb-5 h-px w-full max-w-[12rem] bg-gradient-to-r from-transparent via-[#00a550]/55 to-transparent sm:mb-6"
            aria-hidden
          />
          <p
            id="tipsport-promo-heading"
            className="mx-auto max-w-md text-pretty text-center text-[13px] font-medium leading-snug text-slate-300/95 sm:text-sm sm:leading-relaxed"
          >
            Rád tipuješ? Zaregistruj se u{" "}
            <span className="font-semibold text-[#4ade80]/95">Tipsport</span> přes partnerský odkaz.
          </p>
        </>
      ) : null}

      <a
        href={TIPSPORT_PARTNER_HREF}
        target="_blank"
        rel="noopener noreferrer nofollow sponsored"
        aria-labelledby={compact ? undefined : "tipsport-promo-heading"}
        aria-label={compact ? "Partnerská nabídka Tipsport" : undefined}
        className={`block overflow-hidden rounded-2xl border border-white/10 bg-black/20 shadow-[0_8px_32px_rgba(0,0,0,0.35)] ring-1 ring-white/[0.06] transition hover:border-[#00a550]/40 hover:shadow-[0_12px_40px_rgba(0,165,80,0.15)] ${
          compact ? "" : "mt-4 sm:mt-5"
        }`}
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- partner asset v /public nebo vlastní URL
          <img
            src={TIPSPORT_BANNER_IMAGE_SRC}
            alt="Tipsport — partnerská nabídka"
            className="mx-auto block h-auto w-full max-w-full object-contain"
            loading="lazy"
            decoding="async"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <TipsportVisualFallback compact={compact} />
        )}
      </a>

      <p
        className={`mx-auto max-w-md text-pretty text-center text-xs font-medium leading-relaxed text-slate-500 ${
          compact ? "mt-2" : "mt-3"
        }`}
      >
        Ministerstvo financí varuje: Účastí na hazardní hře může vzniknout závislost! Zákaz účasti osob mladších
        18 let.
      </p>
    </div>
  );
}
