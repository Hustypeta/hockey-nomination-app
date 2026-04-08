"use client";

/**
 * Zjednodušený erb na hrudi (červený štít, světlý lev) – výraznější obrys,
 * aby byl na modrém yoke i na bílém čitelný (stín řeší Tailwind na rodiči).
 */
export function CzechHockeyCrest({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <title>ČR</title>
      <path
        d="M10 1.2 L17.2 4.8 L16.4 15.2 C16.1 18.5 13.5 21.2 10 22.8 C6.5 21.2 3.9 18.5 3.6 15.2 L2.8 4.8 Z"
        fill="#c41e3a"
        stroke="#5c0d1a"
        strokeWidth="0.55"
      />
      <path
        d="M10 2.4 L15.6 5.4 L14.9 14.8 C14.7 17.5 12.7 19.8 10 21.1 C7.3 19.8 5.3 17.5 5.1 14.8 L4.4 5.4 Z"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.22"
        strokeWidth="0.4"
      />
      <path
        d="M10 7.5c-1.2 0-2.1.6-2.4 1.4-.2.5-.1 1 .3 1.3.3.2.7.2 1-.1.3-.4.9-.7 1.6-.7.6 0 1.1.3 1.4.7.3.3.7.3 1 .1.4-.3.5-.8.3-1.3-.3-.8-1.2-1.4-2.4-1.4z"
        fill="#f2f5fa"
      />
      <path
        d="M7 11.5c-.8 1-1 2.2-.4 3.2l1.2-1c.3-.8 1-1.4 1.8-1.6"
        fill="none"
        stroke="#f2f5fa"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M13 11.5c.8 1 1 2.2.4 3.2l-1.2-1c-.3-.8-1-1.4-1.8-1.6"
        fill="none"
        stroke="#f2f5fa"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <ellipse cx="10" cy="6.8" rx="1.15" ry="1.05" fill="#f2f5fa" />
    </svg>
  );
}
