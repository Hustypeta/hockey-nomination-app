"use client";

/**
 * Jednotná barva siluety – modrá v duchu českého reprezentačního dresu (kontrast k bílému tělu karty).
 */
export const HOCKEY_SILHOUETTE_COLOR = "#11457E";

/**
 * Celopostavové siluety v profilu (hráč / brankář), ne ikonka na hrudi.
 * Postoj z ledu: předklon, hůl s listem u ledu, brusle.
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
        viewBox="0 0 44 100"
        className={className}
        aria-hidden
        fill="none"
      >
        {/* Brankářská hůl – širší pádlo, částečně za tělem */}
        <path
          d="M2 88 L0 94 L14 97 L34 38 L30 35 Z"
          fill={c}
        />
        {/* Helma */}
        <ellipse cx="22" cy="11" rx="7" ry="6.5" fill={c} />
        <path
          d="M16 12 Q22 15 28 12"
          stroke={c}
          strokeWidth={1}
          strokeOpacity={0.35}
          strokeLinecap="round"
        />
        {/* Krk */}
        <path d="M18 17h8v4h-8z" fill={c} />
        {/* Trup + širší ramena (výstroj) */}
        <path
          d="M10 22 Q8 32 9 42l1 10h24l1-10q1-10-1-20l-3-5q-5-3-11-3t-11 3z"
          fill={c}
        />
        {/* Levý beton */}
        <path
          d="M6 44 Q3 58 5 74l2 14h12l1-8q2-16-1-30l-4-6z"
          fill={c}
        />
        {/* Pravý beton */}
        <path
          d="M38 44 Q41 58 39 74l-2 14H25l-1-8q-2-16 1-30l4-6z"
          fill={c}
        />
        {/* Rukavice u těla */}
        <ellipse cx="11" cy="38" rx="3.5" ry="4.5" fill={c} transform="rotate(-8 11 38)" />
        <ellipse cx="33" cy="38" rx="3.5" ry="4.5" fill={c} transform="rotate(8 33 38)" />
        {/* Pádlo detail */}
        <path d="M30 72 L40 68 L42 76 L32 80 Z" fill={c} />
        {/* Led */}
        <path
          d="M0 96h44"
          stroke={c}
          strokeWidth={1.2}
          strokeOpacity={0.25}
          strokeLinecap="round"
        />
      </svg>
    );
  }

  /* Útočník / obránce – profil doleva: postava před holí (hůl v popředí jako u klasických ikon) */
  return (
    <svg
      viewBox="0 0 42 100"
      className={className}
      aria-hidden
      fill="none"
    >
      {/* Tělo od helmy po brusle */}
      <path
        d="M26 7 C19 7 14 11 14 17 C14 21 16 24 19 25 L17 28 C12 36 14 46 18 50 L16 68 L10 84 L15 89 L23 81 L25 62 L29 60 L31 79 L37 81 L39 75 L35 56 L33 38 L29 28 C31 22 29 14 26 7 Z"
        fill={c}
      />
      <path
        d="M16 18 Q22 21 28 18"
        stroke={c}
        strokeWidth={0.9}
        strokeOpacity={0.35}
        strokeLinecap="round"
      />
      <path
        d="M30 30 Q34 36 32 44 L28 45 L26 36 Z"
        fill={c}
      />
      {/* Hůl přes tělo */}
      <path
        d="M3 90 L1 95 L11 98 L28 36 L24 33 Z"
        fill={c}
      />
      <ellipse cx="21" cy="33" rx="3.2" ry="4" fill={c} transform="rotate(-42 21 33)" />
      <path
        d="M0 96h42"
        stroke={c}
        strokeWidth={1.1}
        strokeOpacity={0.22}
        strokeLinecap="round"
      />
    </svg>
  );
}
