"use client";

/**
 * Značka pro fanouškovskou hru: červený štít + „ČR“ (není to oficiální logo ČSLH).
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
        strokeOpacity="0.2"
        strokeWidth="0.4"
      />
      <text
        x="10"
        y="14.5"
        textAnchor="middle"
        fill="#f4f7fb"
        fontSize="7"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
        letterSpacing="-0.05em"
      >
        ČR
      </text>
    </svg>
  );
}
