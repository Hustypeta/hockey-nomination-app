"use client";

import type { CSSProperties, ReactNode } from "react";

function IceNoiseOverlay({ filterId }: { filterId: string }) {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.055]" aria-hidden>
      <defs>
        <filter id={filterId} x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" result="n" />
          <feColorMatrix in="n" type="saturate" values="0" result="g" />
          <feComponentTransfer in="g" result="a">
            <feFuncA type="linear" slope="0.35" />
          </feComponentTransfer>
        </filter>
      </defs>
      <rect width="100%" height="100%" filter={`url(#${filterId})`} />
    </svg>
  );
}

/** SVG: čáry a kruhy na ledu (stejné jako fantasy editor). */
function RinkMarkings({ patternId }: { patternId: string }) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full text-[#c8102e]"
      viewBox="0 0 200 260"
      preserveAspectRatio="xMidYMid slice"
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
      aria-hidden
    >
      <defs>
        <linearGradient id={`${patternId}-shine`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.65)" />
          <stop offset="38%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(0,60,90,0.05)" />
        </linearGradient>
        <pattern id={patternId} width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)">
          <path d="M0 12h28" stroke="rgba(255,255,255,0.16)" strokeWidth="0.7" vectorEffect="nonScalingStroke" />
          <path d="M8 0v28" stroke="rgba(0,80,120,0.08)" strokeWidth="0.5" vectorEffect="nonScalingStroke" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="200" height="260" fill={`url(#${patternId})`} opacity="0.52" />
      <rect x="0" y="0" width="200" height="44" fill="rgba(0,48,135,0.07)" />
      <rect x="0" y="104" width="200" height="52" fill="rgba(0,48,135,0.05)" />
      <line x1="0" y1="130" x2="200" y2="130" stroke="currentColor" strokeWidth="2.2" vectorEffect="nonScalingStroke" />
      <line x1="0" y1="76" x2="200" y2="76" stroke="#1d4ed8" strokeWidth="1.6" opacity="0.78" vectorEffect="nonScalingStroke" />
      <line x1="0" y1="184" x2="200" y2="184" stroke="#1d4ed8" strokeWidth="1.6" opacity="0.78" vectorEffect="nonScalingStroke" />
      <circle cx="44" cy="64" r="18" fill="none" stroke="rgba(200,16,46,0.38)" strokeWidth="1.05" />
      <circle cx="156" cy="64" r="18" fill="none" stroke="rgba(200,16,46,0.38)" strokeWidth="1.05" />
      <circle cx="44" cy="196" r="18" fill="none" stroke="rgba(200,16,46,0.38)" strokeWidth="1.05" />
      <circle cx="156" cy="196" r="18" fill="none" stroke="rgba(200,16,46,0.38)" strokeWidth="1.05" />
      <circle cx="100" cy="130" r="11" fill="none" stroke="rgba(200,16,46,0.48)" strokeWidth="1" />
      <path
        d="M 56 236 A 44 28 0 0 0 144 236"
        fill="rgba(0,48,135,0.06)"
        stroke="rgba(0,48,135,0.22)"
        strokeWidth="1"
      />
      <g opacity="0.4" stroke="rgba(255,255,255,0.42)" strokeWidth="0.55" fill="none" strokeLinecap="round">
        <path d="M24 176 Q 44 164 60 180" />
        <path d="M136 84 Q 156 72 176 88" />
        <path d="M80 48 Q 96 36 116 52" />
        <path d="M36 104 L 52 96" />
        <path d="M148 144 L 164 156" />
      </g>
      <rect x="0" y="0" width="200" height="260" fill={`url(#${patternId}-shine)`} />
    </svg>
  );
}

function ArenaBackdrop() {
  return (
    <>
      <div
        className="ms-fantasy-arena-lights absolute -inset-[18%] opacity-90"
        style={{
          background: `
            radial-gradient(ellipse 55% 45% at 20% 30%, rgba(200, 16, 46, 0.35), transparent 62%),
            radial-gradient(ellipse 50% 40% at 78% 22%, rgba(0, 180, 255, 0.28), transparent 58%),
            radial-gradient(ellipse 70% 55% at 50% 100%, rgba(15, 23, 42, 0.95), transparent 55%),
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(30, 58, 95, 0.55), transparent 50%),
            linear-gradient(185deg, #0a0f1a 0%, #050810 45%, #020308 100%)
          `,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.22] mix-blend-screen"
        style={{
          background:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 6px)",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_120%,rgba(0,0,0,0.55),transparent_55%)]" />
    </>
  );
}

export type IceRinkShellProps = {
  noiseFilterId: string;
  scratchPatternId: string;
  children: ReactNode;
  /** Tailwind třídy na vnější obal s perspektivou (šířka apod.). */
  className?: string;
  /** Vlastní CSS transform (default = fantasy editor). */
  transform?: CSSProperties["transform"];
  /** Vnitřní zóna nad ledem (padding kolem řad karet). */
  innerClassName?: string;
};

/**
 * Vizuální „kluziště“ ze fantasy editoru — sdílené s exportní grafikou hodnocení (bez slotů / salary).
 */
export function IceRinkShell({
  noiseFilterId,
  scratchPatternId,
  children,
  className = "",
  transform = "perspective(920px) rotateX(4deg) scale(0.88) translateZ(0)",
  innerClassName = "relative z-10 flex flex-col items-stretch px-1.5 pb-4 pt-[2.35rem] sm:px-3 sm:pb-5 sm:pt-[2.5rem]",
}: IceRinkShellProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-[1.35rem] border border-cyan-200/25 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.08)_inset] sm:rounded-[1.5rem] [backface-visibility:hidden] ${className}`}
      style={{
        transform,
        transformOrigin: "50% 38%",
      }}
    >
      <ArenaBackdrop />
      <IceNoiseOverlay filterId={noiseFilterId} />

      <div
        className="absolute inset-0 opacity-[0.18] mix-blend-multiply"
        style={{
          background:
            "repeating-linear-gradient(-28deg, transparent, transparent 8px, rgba(0,60,90,0.11) 8px, rgba(0,60,90,0.11) 9px), repeating-linear-gradient(18deg, transparent, transparent 13px, rgba(255,255,255,0.09) 13px, rgba(255,255,255,0.09) 14px)",
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-white/88 via-cyan-50/82 to-sky-100/78" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_55%_at_50%_-5%,rgba(255,255,255,0.75),transparent_52%)]" />
      <div className="absolute inset-0 opacity-50 mix-blend-soft-light bg-[radial-gradient(ellipse_at_80%_20%,rgba(0,180,255,0.12),transparent_45%)]" />

      <RinkMarkings patternId={scratchPatternId} />

      <div className="pointer-events-none absolute inset-0 rounded-[1.35rem] ring-[1px] ring-white/50 ring-inset sm:rounded-[1.5rem]" />
      <div className="pointer-events-none absolute inset-0 rounded-[1.35rem] shadow-[inset_0_0_50px_rgba(0,40,80,0.08)] sm:rounded-[1.5rem]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-slate-900/20 to-transparent sm:h-8" />

      <div className={innerClassName}>{children}</div>
    </div>
  );
}
