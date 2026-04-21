import type { Metadata } from "next";
import Link from "next/link";
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
        <div className="mb-5 rounded-xl border border-sky-400/20 bg-sky-500/[0.06] px-4 py-3 text-center sm:px-5">
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-sky-200/85">
            Cover snímek z úvodní stránky (1640×856 px)
          </p>
          <p className="mt-2 text-xs leading-relaxed text-white/55">
            Veřejný cover režim bez hlavičky — vhodný pro screenshot na desktopu.
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Link
              href="/?cover=true"
              className="inline-flex items-center rounded-lg bg-white/[0.08] px-3 py-2 font-mono text-[12px] font-semibold text-sky-100 underline-offset-4 transition hover:bg-white/[0.12] hover:underline"
            >
              /?cover=true
            </Link>
            <span className="text-white/35">nebo</span>
            <Link
              href="/cover"
              className="inline-flex items-center rounded-lg bg-white/[0.08] px-3 py-2 font-mono text-[12px] font-semibold text-sky-100 underline-offset-4 transition hover:bg-white/[0.12] hover:underline"
            >
              /cover
            </Link>
          </div>
        </div>
        <p className="mb-4 text-center font-sans text-xs leading-relaxed text-white/45 sm:text-sm">
          Plátno <strong className="text-white/70">{FB_PROMO_WIDTH} × {FB_PROMO_HEIGHT} px</strong> — ideální pro příspěvek
          na Facebook nebo náhled odkazu. Zvětši okno nad šířku plátna, v prohlížeči{" "}
          <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-[11px]">100 %</kbd> zoom,{" "}
          vyber oblast jen kolem rámečku (např. Win+Shift+S). Ukázka editoru vlevo preferuje{" "}
          <span className="font-mono text-[11px] text-white/55">squad-builder-showcase.png</span>, další fallback{" "}
          <span className="font-mono text-[11px] text-white/55">fb-cover-squad-editor.png</span> — přegenerovat{" "}
          <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-[11px]">
            npm run promo:capture-squad
          </kbd>{" "}
          při běžícím <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-[11px]">
            npm run dev
          </kbd>{" "}
          (Playwright uloží PNG do <span className="font-mono text-[11px] text-white/55">public/images/promo/</span>).
        </p>
        <FbCoverPromoArt />
      </div>
    </div>
  );
}
