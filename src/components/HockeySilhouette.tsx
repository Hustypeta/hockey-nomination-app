"use client";

/** Jednotná barva siluety na všech dresech (brankář i hráč, všechny tvary). */
export const HOCKEY_SILHOUETTE_COLOR = "#1a3a5c";

/**
 * Siluety hokejisty a brankáře – postoj z ledu, čitelná hůl, helma, brusle.
 */
export function HockeySilhouette({
  kind,
  className = "",
}: {
  kind: "goalie" | "skater";
  className?: string;
}) {
  const c = HOCKEY_SILHOUETTE_COLOR;

  if (kind === "goalie") {
    return (
      <svg
        viewBox="0 0 56 82"
        className={className}
        aria-hidden
        fill={c}
      >
        <ellipse cx="28" cy="12" rx="8" ry="7" />
        <path
          d="M20 13h16"
          stroke={c}
          strokeWidth={1.25}
          strokeOpacity={0.32}
          strokeLinecap="round"
          fill="none"
        />
        <path d="M22 18h12v5H22z" />
        <path d="M12 24 Q10 32 11 40l1 8h32l1-8q1-8-1-16l-4-6q-7-4-14-4t-14 4z" />
        <path d="M10 42 Q7 54 8 66l2 12h15l1-6q2-14-1-26l-5-6z" />
        <path d="M46 42 Q49 54 48 66l-2 12H31l-1-6q-2-14 1-26l5-6z" />
        <ellipse cx="14" cy="36" rx="4" ry="5" transform="rotate(-12 14 36)" />
        <ellipse cx="42" cy="36" rx="4" ry="5" transform="rotate(12 42 36)" />
        <path d="M33 30 L48 22 L50 26 L37 34 L44 58 L40 60 L32 36 Z" />
        <path d="M38 56 L52 52 L53 58 L39 62 Z" />
        <path
          d="M4 78h48"
          stroke={c}
          strokeWidth={1.5}
          strokeOpacity={0.22}
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 52 84"
      className={className}
      aria-hidden
      fill={c}
    >
      <path d="M26 5c-5 0-9 3.5-9 8.5 0 3 1.5 5.5 4 6.5v2h10v-2c2.5-1 4-3.5 4-6.5 0-5-4-8.5-9-8.5z" />
      <path
        d="M18 14.5 Q26 18.5 34 14.5"
        stroke={c}
        strokeWidth={1.1}
        strokeOpacity={0.32}
        strokeLinecap="round"
        fill="none"
      />
      <path d="M14 24 Q11 32 12 40l1 6h26l1-6q1-8-2-16l-5-5q-5.5-3.5-12-3.5T14 19z" />
      <path d="M15 46 Q14 52 16 58h20q2-6 1-12H15z" />
      <path d="M16 58 L12 72 L8 75 L11 79 L19 76 L22 60 Z" />
      <path d="M7 76 L20 72 L21 76 L8 80 Z" />
      <path d="M32 58 L38 72 L42 75 L39 79 L31 76 L28 60 Z" />
      <path d="M30 76 L43 72 L44 76 L31 80 Z" />
      <path d="M14 26 Q9 34 11 44l5 2 3-2q-3-8 1-15z" />
      <path d="M36 25 Q41 30 39 38l-5 1-2-10q2-3 4-4z" />
      <path d="M38 26 L42 24 L16 76 L10 78 L8 74 L34 28 Z" />
      <path d="M4 76 L14 73 L16 79 L6 82 Z" />
      <path
        d="M2 80h48"
        stroke={c}
        strokeWidth={1.2}
        strokeOpacity={0.2}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
