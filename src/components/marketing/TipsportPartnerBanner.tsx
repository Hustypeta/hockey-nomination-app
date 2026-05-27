"use client";

import { useId, useState } from "react";
import { TIPSPORT_BANNER_IMAGE_SRC, TIPSPORT_PARTNER_HREF } from "@/lib/tipsportPromo";

type TipsportPartnerBannerProps = {
  className?: string;
  /** Kompaktní varianta pro loading screen. */
  compact?: boolean;
};

function TipsportPromoHeading({ compact, headingId }: { compact: boolean; headingId: string }) {
  return (
    <p
      id={headingId}
      className={`mx-auto max-w-md text-pretty text-center font-medium leading-snug text-slate-300/95 ${
        compact ? "mb-3 text-[12px]" : "text-[13px] sm:text-sm sm:leading-relaxed"
      }`}
    >
      Rád tipuješ? Vsaď si u{" "}
      <span className="font-semibold text-[#4ade80]/95">Tipsportu</span> na zápas české hokejové reprezentace a
      získej <span className="font-semibold text-white">1000 Kč</span> jako vstupní bonus zdarma.
    </p>
  );
}

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
  const headingId = useId();
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = !imgFailed;

  return (
    <div className={className}>
      {!compact ? (
        <div
          className="mx-auto mb-5 h-px w-full max-w-[12rem] bg-gradient-to-r from-transparent via-[#00a550]/55 to-transparent sm:mb-6"
          aria-hidden
        />
      ) : null}
      <TipsportPromoHeading compact={compact} headingId={headingId} />

      <a
        href={TIPSPORT_PARTNER_HREF}
        target="_blank"
        rel="noopener noreferrer nofollow sponsored"
        aria-labelledby={headingId}
        className={`group relative mt-4 block overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-black/30 shadow-[0_18px_70px_rgba(0,0,0,0.45)] ring-1 ring-white/[0.06] transition duration-200 hover:-translate-y-0.5 hover:border-[#00a550]/40 hover:shadow-[0_24px_80px_rgba(0,0,0,0.50),0_0_70px_rgba(0,165,80,0.16)] sm:mt-5`}
      >
        <span
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          aria-hidden
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, rgba(255,255,255,0.16) 0px, rgba(255,255,255,0.16) 1px, transparent 1px, transparent 12px)",
          }}
        />
        <span
          className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-[#00a550]/20 blur-3xl transition-opacity duration-300 group-hover:opacity-90"
          aria-hidden
        />
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- partner asset v /public nebo vlastní URL
          <img
            src={TIPSPORT_BANNER_IMAGE_SRC}
            alt="Tipsport — partnerská nabídka"
            className="relative mx-auto block h-auto w-full max-w-full object-contain"
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
