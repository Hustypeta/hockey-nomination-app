import type { MetadataRoute } from "next";

export default function Icon(): MetadataRoute.Icon {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      role="img"
      aria-label="Lineup"
    >
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0b1220" />
          <stop offset="1" stopColor="#05080f" />
        </linearGradient>
        <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#00B4FF" stopOpacity="0.9" />
          <stop offset="0.55" stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="1" stopColor="#c8102e" stopOpacity="0.85" />
        </linearGradient>
      </defs>

      <circle cx="32" cy="32" r="30" fill="url(#bg)" />
      <circle cx="32" cy="32" r="30" fill="none" stroke="url(#ring)" strokeWidth="3" />

      {/* Stylizované "L" — čitelné i jako 16px favicon */}
      <path
        d="M22 16h10v28h18v10H22V16z"
        fill="#ffffff"
      />
      <path
        d="M22 44h28v10H22z"
        fill="#00B4FF"
        opacity="0.25"
      />
    </svg>
  );
}

