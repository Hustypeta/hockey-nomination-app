import Link from "next/link";
import { ChevronRight, LayoutGrid } from "lucide-react";
import { FifaHomeEditorCardArt } from "@/components/fifa/FifaHomeEditorCardArt";

const LINEUP_EDITOR_HREF = "/zapasy/sestava";

export function FifaHomeEditorCard({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href={LINEUP_EDITOR_HREF}
      className={`fifa-card fifa-card--interactive fifa-card-hero fifa-home-editor-card group relative flex min-h-[17.5rem] flex-col justify-between overflow-hidden lg:h-full lg:min-h-0 ${
        compact ? "p-4 lg:p-5" : "min-h-[10rem] p-5 lg:p-6"
      }`}
    >
      <FifaHomeEditorCardArt className={compact ? "opacity-95" : "opacity-100"} />

      <div className={`fifa-image-text-layer flex flex-col ${compact ? "max-w-[88%] lg:max-w-[62%]" : "max-w-[55%]"}`}>
        <span className="flex w-fit items-center gap-2">
          <span className="fifa-icon-chip fifa-icon-chip--lg">
            <LayoutGrid className="h-4 w-4" aria-hidden />
          </span>
          <span className="fifa-kicker fifa-image-kicker">Editor sestavy</span>
        </span>
      </div>

      <div className={`fifa-image-text-layer mt-auto ${compact ? "max-w-[92%] pt-2 lg:max-w-[65%]" : "max-w-[60%] pt-4"}`}>
        <h1
          className={`font-display fifa-image-text-shadow--strong leading-tight tracking-tight text-[var(--fifa-text)] ${
            compact ? "text-xl lg:text-2xl" : "text-3xl lg:text-4xl"
          }`}
        >
          Vytvoř si svou sestavu
        </h1>
        <p
          className={`fifa-image-text-muted leading-snug ${
            compact
              ? "mt-1.5 line-clamp-2 text-sm leading-relaxed lg:line-clamp-4 lg:text-base"
              : "mt-3 text-lg lg:text-xl"
          }`}
        >
          Poskládej si sestavu na zápas v novém editoru sestavy, ukládej si svoje týmy a sdílej je s ostatními fanoušky.
        </p>
        <span className={`fifa-btn-primary ${compact ? "mt-2.5 px-3 py-1.5 text-xs" : "mt-5 px-6 py-3 text-base lg:text-lg"}`}>
          Otevřít editor
          <ChevronRight
            className={`transition-transform duration-200 group-hover:translate-x-0.5 ${compact ? "h-3.5 w-3.5" : "h-5 w-5"}`}
            aria-hidden
          />
        </span>
      </div>
    </Link>
  );
}
