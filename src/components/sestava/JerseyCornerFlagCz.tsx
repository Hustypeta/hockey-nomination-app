/**
 * Miniatura české vlajky v rohu dresu (export i editor).
 */
export function JerseyCornerFlagCz({ className = "" }: { className?: string }) {
  return (
    <span
      className={`pointer-events-none absolute bottom-1 right-1 z-[22] drop-shadow-[0_1px_3px_rgba(0,0,0,0.75)] ${className}`}
      aria-hidden
    >
      <svg width="18" height="12" viewBox="0 0 3 2" className="rounded-[2px] ring-[0.5px] ring-black/25">
        <title>ČR</title>
        <rect width="3" height="2" fill="#ffffff" />
        <rect width="3" height="1" y="1" fill="#d7141a" />
        <polygon points="0,0 1.35,1 0,2" fill="#11457e" />
      </svg>
    </span>
  );
}
