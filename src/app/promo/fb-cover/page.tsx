import type { Metadata } from "next";
import { FB_PROMO_HEIGHT, FB_PROMO_WIDTH } from "@/components/marketing/fbCoverDimensions";
import { FbCoverPromoArt } from "@/components/marketing/FbCoverPromoArt";

export const metadata: Metadata = {
  title: "Promo — Facebook cover",
  description: `Grafika ${FB_PROMO_WIDTH}×${FB_PROMO_HEIGHT} px pro screenshot / reklamu na sociální sítě.`,
  robots: { index: false, follow: false },
};

/**
 * Promo plátno pro screenshot (Facebook příspěvek / OG poměr 1,91∶1).
 * Otevři na velkém monitoru, případně zoom 100 %, vyfoť jen oblast grafiky.
 */
export default function PromoFbCoverPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] px-3 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-[min(100%,1240px)]">
        <p className="mb-4 text-center font-sans text-xs leading-relaxed text-white/45 sm:text-sm">
          Plátno <strong className="text-white/70">{FB_PROMO_WIDTH} × {FB_PROMO_HEIGHT} px</strong> — ideální pro příspěvek
          na Facebook nebo náhled odkazu. Zvětši okno nad šířku plátna, v prohlížeči{" "}
          <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-[11px]">100 %</kbd> zoom,{" "}
          vyber oblast jen kolem rámečku (např. Win+Shift+S). Text později doladíš v kódu komponenty.
        </p>
        <FbCoverPromoArt />
      </div>
    </div>
  );
}
