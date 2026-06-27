"use client";

import { useState } from "react";
import { FifaImageTextScrim } from "@/components/fifa/FifaImageTextScrim";
import { getDailyNewsSourceBrand } from "@/lib/dailyNews/sourceBrand";

type Props = {
  imageUrl: string | null;
  source: string;
};

export function FifaHomeDailyNewsVisual({ imageUrl, source }: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const brand = getDailyNewsSourceBrand(source);
  const showPhoto = Boolean(imageUrl) && !imgFailed;

  return (
    <div className="absolute inset-0 bg-[var(--fifa-bg-base)]">
      {showPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl!}
          alt=""
          className="fifa-home-tile-media fifa-image-art-photo"
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${brand.gradient}`}>
          <span
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 90% 70% at 20% 0%, ${brand.glow}, transparent 55%)`,
            }}
            aria-hidden
          />
          <span
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(-14deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 22px)",
            }}
            aria-hidden
          />
          <span
            className="pointer-events-none absolute -right-8 top-1/4 font-display text-[7rem] font-bold leading-none tracking-tight text-white/[0.06] lg:text-[8rem]"
            aria-hidden
          >
            {brand.short}
          </span>
        </div>
      )}

      <FifaImageTextScrim variant="media-bottom" />
    </div>
  );
}

export function DailyNewsSourceBadge({ source }: { source: string }) {
  const brand = getDailyNewsSourceBrand(source);
  return (
    <span
      className="inline-flex max-w-[10rem] items-center truncate rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white shadow-lg backdrop-blur-md"
      style={{
        borderColor: brand.accentBorder,
        backgroundColor: `${brand.accent}33`,
        boxShadow: `0 0 20px ${brand.glow}`,
      }}
    >
      {brand.short}
    </span>
  );
}
