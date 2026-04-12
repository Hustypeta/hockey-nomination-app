/**
 * Dekorativní hokejové pozadí hero — led, čára, puk, vlajka, siluety (bez fotek).
 */
export function LandingHeroVisual({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none select-none ${className}`}
      aria-hidden
    >
      <svg
        viewBox="0 0 1200 640"
        className="h-full w-full"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="lh-ice" x1="600" y1="120" x2="600" y2="640" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(56, 189, 248, 0.12)" />
            <stop offset="35%" stopColor="rgba(15, 23, 42, 0.45)" />
            <stop offset="100%" stopColor="rgba(5, 8, 15, 0.92)" />
          </linearGradient>
          <linearGradient id="lh-glow-red" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c8102e" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#c8102e" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lh-glow-blue" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#003087" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#003087" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="lh-puck" cx="40%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>
          <filter id="lh-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="b" />
          </filter>
        </defs>

        {/* Ledová plocha */}
        <path
          d="M0 280 Q300 220 600 250 T1200 260 L1200 640 L0 640 Z"
          fill="url(#lh-ice)"
        />
        {/* Čáry na ledu */}
        <path
          d="M0 380 H1200 M600 280 V520"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="2"
          strokeDasharray="14 10"
        />
        <circle cx="600" cy="420" r="42" fill="none" stroke="rgba(200,16,46,0.35)" strokeWidth="2.5" />
        <circle cx="600" cy="420" r="6" fill="#c8102e" opacity="0.5" />

        {/* Červená / modrá záře */}
        <ellipse cx="220" cy="200" rx="280" ry="200" fill="url(#lh-glow-red)" opacity="0.35" filter="url(#lh-blur)" />
        <ellipse cx="1020" cy="240" rx="260" ry="180" fill="url(#lh-glow-blue)" opacity="0.4" filter="url(#lh-blur)" />

        {/* Siluety hráčů (zjednodušené) */}
        <g opacity="0.22" fill="#f8fafc">
          <path d="M180 420c12-48 38-72 58-88l8 24c-18 14-32 36-38 64h-28zm52-118c18-6 32 4 38 22s-4 34-22 40-34-6-40-24 6-32 24-38z" />
          <path d="M280 380l44-120 26 10-32 98 24 52h-32l-16-40-14 40h-30l20-40zm88-100c20 0 36 16 36 36s-16 36-36 36-36-16-36-36 16-36 36-36z" />
          <path d="M920 400c-10-52 8-88 28-108l20 18c-16 18-26 48-22 90h-26zm36-128c16 8 22 28 14 44s-28 22-44 14-22-28-14-44 28-22 44-14z" />
        </g>
        {/* Hole + puk */}
        <g transform="translate(420 460)">
          <ellipse cx="0" cy="8" rx="34" ry="10" fill="rgba(0,0,0,0.35)" />
          <ellipse cx="0" cy="0" rx="28" ry="9" fill="url(#lh-puck)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
          <ellipse cx="-6" cy="-3" rx="10" ry="3" fill="rgba(255,255,255,0.12)" />
        </g>

        {/* Stuha vlajky — abstraktní vlna */}
        <g opacity="0.5">
          <path
            d="M720 80 Q820 40 920 70 T1120 60 L1120 120 Q1020 100 920 125 T720 115 Z"
            fill="#c8102e"
          />
          <path
            d="M720 115 Q820 95 920 118 T1120 108 L1120 155 Q1020 138 920 158 T720 148 Z"
            fill="#f8fafc"
          />
          <path
            d="M720 148 Q820 128 920 152 T1120 142 L1120 195 Q1020 175 920 195 T720 182 Z"
            fill="#003087"
          />
        </g>
      </svg>
    </div>
  );
}
