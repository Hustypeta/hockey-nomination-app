"use client";

import { SOCIAL_COVER_HEIGHT, SOCIAL_COVER_WIDTH } from "@/lib/socialCoverDimensions";

/** Tmavý led + akcenty — vyplní 1640×856, žádné proporce FB 1200×630. */
export function SocialCoverBackdrop({ prefix }: { prefix: string }) {
  const pid = prefix.replace(/[^a-zA-Z0-9_-]/g, "");
  const ice = `${pid}-sc-ice`;
  const rink = `${pid}-sc-rink`;
  const glowR = `${pid}-sc-glow-r`;
  const glowB = `${pid}-sc-glow-b`;

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox={`0 0 ${SOCIAL_COVER_WIDTH} ${SOCIAL_COVER_HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={ice} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#070d18" />
          <stop offset="45%" stopColor="#05080f" />
          <stop offset="100%" stopColor="#02040a" />
        </linearGradient>
        <linearGradient id={rink} x1="820" y1="420" x2="820" y2={SOCIAL_COVER_HEIGHT} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(56,189,248,0.16)" />
          <stop offset="100%" stopColor="rgba(5,8,15,0.97)" />
        </linearGradient>
        <radialGradient id={glowR} cx="22%" cy="18%" r="42%">
          <stop offset="0%" stopColor="#c8102e" stopOpacity="0.48" />
          <stop offset="100%" stopColor="#c8102e" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={glowB} cx="88%" cy="14%" r="38%">
          <stop offset="0%" stopColor="#003087" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#003087" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={SOCIAL_COVER_WIDTH} height={SOCIAL_COVER_HEIGHT} fill={`url(#${ice})`} />
      <ellipse cx="260" cy="140" rx="420" ry="300" fill={`url(#${glowR})`} />
      <ellipse cx="1380" cy="110" rx="360" ry="240" fill={`url(#${glowB})`} />
      <path
        d={`M0 520 Q520 440 ${SOCIAL_COVER_WIDTH * 0.45} 480 T${SOCIAL_COVER_WIDTH} 490 V${SOCIAL_COVER_HEIGHT} H0Z`}
        fill={`url(#${rink})`}
      />
      <path
        d={`M0 560 H${SOCIAL_COVER_WIDTH}`}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="2"
        strokeDasharray="18 14"
      />
      <circle
        cx={SOCIAL_COVER_WIDTH / 2}
        cy={SOCIAL_COVER_HEIGHT * 0.72}
        r="58"
        fill="none"
        stroke="rgba(200,16,46,0.38)"
        strokeWidth="2.5"
      />
      <circle cx={SOCIAL_COVER_WIDTH / 2} cy={SOCIAL_COVER_HEIGHT * 0.72} r="9" fill="#c8102e" opacity="0.55" />
    </svg>
  );
}
