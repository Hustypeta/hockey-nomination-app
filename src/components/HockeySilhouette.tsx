"use client";

/** Jednoduchá silueta brankáře / hráče v poli (pro sestavu i plakát). */
export function HockeySilhouette({
  kind,
  className = "",
}: {
  kind: "goalie" | "skater";
  className?: string;
}) {
  if (kind === "goalie") {
    return (
      <svg
        viewBox="0 0 48 64"
        className={className}
        aria-hidden
        fill="currentColor"
      >
        <ellipse cx="24" cy="10" rx="9" ry="8" opacity={0.95} />
        <path
          d="M12 20 Q10 38 14 52 L18 60 L30 60 L34 52 Q38 38 36 20 Q28 16 24 16 Q20 16 12 20Z"
          opacity={0.9}
        />
        <rect x="8" y="42" width="8" height="18" rx="2" opacity={0.85} />
        <rect x="32" y="42" width="8" height="18" rx="2" opacity={0.85} />
        <path d="M6 28 L4 48 L10 50 L12 32 Z" opacity={0.75} />
        <path d="M42 28 L44 48 L38 50 L36 32 Z" opacity={0.75} />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 48 64"
      className={className}
      aria-hidden
      fill="currentColor"
    >
      <ellipse cx="24" cy="11" rx="8" ry="7" opacity={0.95} />
      <path
        d="M16 20 L14 38 L18 58 L22 60 L26 60 L30 58 L34 38 L32 20 Q28 17 24 17 Q20 17 16 20Z"
        opacity={0.9}
      />
      <path d="M18 58 L16 62 L22 64 L24 60 Z" opacity={0.8} />
      <path d="M30 58 L32 62 L26 64 L24 60 Z" opacity={0.8} />
      <path
        d="M32 24 L44 18 L46 22 L36 30 Z"
        opacity={0.75}
      />
    </svg>
  );
}
