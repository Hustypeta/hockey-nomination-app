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

/** Proklik na Instagram (Svět Hokeje) — kompaktní tlačítko bez vnějšího rámu. */
export function LoadingScreenUsefulLinks({ className = "" }: LoadingScreenUsefulLinksProps) {
  return (
    <a
      href="https://www.instagram.com/svet_hokeje/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Svět Hokeje na Instagramu"
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-[#f1c40f]/50 bg-gradient-to-r from-[#833ab4]/30 via-[#fd1d1d]/20 to-[#fcb045]/25 px-3.5 py-2 text-[13px] font-black tracking-tight text-white shadow-[0_6px_22px_rgba(0,0,0,0.35)] transition hover:border-[#f1c40f] hover:brightness-110 sm:px-4 sm:text-sm ${className}`}
    >
      <InstagramMark className="h-4 w-4 shrink-0 text-white sm:h-[1.125rem] sm:w-[1.125rem]" />
      <span>Svět Hokeje</span>
    </a>
  );
}
