/** Jedna SVG vlajka — použití v rohu dresu i v „lemu“ pod exportním plakátem. */
export function JerseyFlagCzSvg({
  width = 18,
  height = 12,
  className = "",
}: {
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 3 2"
      className={`rounded-[2px] ring-[0.5px] ring-black/25 ${className}`}
      aria-hidden
    >
      <title>ČR</title>
      <rect width="3" height="2" fill="#ffffff" />
      <rect width="3" height="1" y="1" fill="#d7141a" />
      <polygon points="0,0 1.35,1 0,2" fill="#11457e" />
    </svg>
  );
}

/**
 * Miniatura české vlajky v rohu dresu (export i editor).
 */
export function JerseyCornerFlagCz({ className = "" }: { className?: string }) {
  return (
    <span
      className={`pointer-events-none absolute bottom-1 right-1 z-[22] drop-shadow-[0_1px_3px_rgba(0,0,0,0.75)] ${className}`}
      aria-hidden
    >
      <JerseyFlagCzSvg width={18} height={12} />
    </span>
  );
}

/** Vlajka v řádku (např. spodní lem exportního plakátu vedle příjmení). */
export function JerseyFlagCzInline({
  className = "",
  width = 22,
  height = 15,
}: {
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <span
      className={`pointer-events-none inline-flex shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)] ${className}`}
      aria-hidden
    >
      <JerseyFlagCzSvg width={width} height={height} />
    </span>
  );
}
