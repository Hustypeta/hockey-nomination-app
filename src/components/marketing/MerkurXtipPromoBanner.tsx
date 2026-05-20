import {
  MERKURXTIP_PROMO_HREF,
  MERKURXTIP_PROMO_HREF_LANDING,
  MERKURXTIP_PROMO_IMAGE_SRC,
} from "@/lib/merkurXtipPromo";

type MerkurXtipPromoBannerProps = {
  className?: string;
  /** Kompaktní varianta do modálů sdílení. */
  compact?: boolean;
  /** Výchozí `promo` = odkaz pro modály; `landing` = odkaz s parametry pro úvod. */
  hrefVariant?: "promo" | "landing";
  showTagline?: boolean;
};

export function MerkurXtipPromoBanner({
  className = "",
  compact = false,
  hrefVariant = "promo",
  showTagline = true,
}: MerkurXtipPromoBannerProps) {
  const href = hrefVariant === "landing" ? MERKURXTIP_PROMO_HREF_LANDING : MERKURXTIP_PROMO_HREF;

  return (
    <aside
      className={`border-t border-white/10 pt-5 ${compact ? "pt-4" : "pt-5 sm:pt-6"} ${className}`}
      aria-label="Partnerská nabídka MerkurXtip"
    >
      {!compact ? (
        <div
          className="mx-auto mb-5 h-px w-full max-w-[12rem] bg-gradient-to-r from-transparent via-[#f1c40f]/55 to-transparent sm:mb-6"
          aria-hidden
        ></div>
      ) : (
        <div
          className="mx-auto mb-3 h-px w-full max-w-[10rem] bg-gradient-to-r from-transparent via-[#f1c40f]/45 to-transparent"
          aria-hidden
        />
      )}

      {showTagline ? (
        <p
          className={
            compact
              ? "mx-auto max-w-md text-pretty text-center text-[12px] font-medium leading-snug text-slate-300/90"
              : "mx-auto max-w-md text-pretty text-center text-[13px] font-medium leading-snug text-slate-300/95 sm:text-sm sm:leading-relaxed"
          }
        >
          Rád tipuješ? Vsad si na svůj tip na{" "}
          <span className="font-semibold text-[#f1c40f]/95">MerkurXtip</span> a získej{" "}
          <span className="font-semibold text-white">500 Kč zdarma</span>
        </p>
      ) : null}

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer nofollow sponsored"
        className={`block overflow-hidden rounded-xl border border-white/10 bg-black/20 shadow-[0_8px_28px_rgba(0,0,0,0.35)] ring-1 ring-white/[0.06] transition hover:border-[#f1c40f]/35 hover:shadow-[0_12px_36px_rgba(241,196,15,0.12)] ${showTagline ? "mt-3" : ""} ${compact ? "rounded-lg" : "rounded-2xl"}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- externí hostitel banneru */}
        <img
          src={MERKURXTIP_PROMO_IMAGE_SRC}
          alt="MerkurXtip — partnerská nabídka"
          className="mx-auto block h-auto w-full max-w-full object-contain"
          loading="lazy"
          decoding="async"
        />
      </a>
      <p
        className={
          compact
            ? "mx-auto mt-2 max-w-md text-pretty text-center text-[11px] font-medium leading-snug text-slate-500"
            : "mx-auto mt-3 max-w-md text-pretty text-center text-xs font-medium leading-relaxed text-slate-500"
        }
      >
        Ministerstvo financí varuje: Účastí na hazardní hře může vzniknout závislost! Zákaz účasti osob mladších 18 let.
      </p>
    </aside>
  );
}
