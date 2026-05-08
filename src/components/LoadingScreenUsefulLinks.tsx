import { SITE_INSTAGRAM_PAGE_URL } from "@/lib/siteBranding";

const LOADING_INSTAGRAM_FALLBACK = "https://www.instagram.com/svet_hokeje/";

function InstagramMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M7.6 2h8.8A5.6 5.6 0 0 1 22 7.6v8.8A5.6 5.6 0 0 1 16.4 22H7.6A5.6 5.6 0 0 1 2 16.4V7.6A5.6 5.6 0 0 1 7.6 2Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 16.3A4.3 4.3 0 1 0 12 7.7a4.3 4.3 0 0 0 0 8.6Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M17.5 6.7h.01" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export type LoadingScreenUsefulLinksProps = {
  className?: string;
};

/** Rámeček s odkazem na Instagram (stejný vizuál jako dřív spodní část staršího bloku). */
export function LoadingScreenUsefulLinks({ className = "" }: LoadingScreenUsefulLinksProps) {
  const instagramHref = SITE_INSTAGRAM_PAGE_URL?.trim() || LOADING_INSTAGRAM_FALLBACK;
  const instagramLabel =
    instagramHref === LOADING_INSTAGRAM_FALLBACK ? "Instagram Svět_hokeje" : "Instagram";

  return (
    <div
      className={`flex w-full justify-center rounded-2xl border-2 border-[#f1c40f]/40 bg-gradient-to-br from-[#003087]/35 via-black/55 to-[#c8102e]/25 p-4 shadow-[0_12px_48px_rgba(0,0,0,0.55)] ring-2 ring-white/[0.08] sm:p-6 ${className}`}
    >
      <a
        href={instagramHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full max-w-sm items-center justify-center gap-2.5 rounded-xl border-2 border-[#f1c40f]/50 bg-gradient-to-r from-[#833ab4]/30 via-[#fd1d1d]/20 to-[#fcb045]/25 px-5 py-3.5 text-[15px] font-black text-white shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition hover:border-[#f1c40f] hover:brightness-110 sm:w-auto"
      >
        <InstagramMark className="h-6 w-6 shrink-0 text-white" />
        <span>{instagramLabel}</span>
      </a>
    </div>
  );
}
