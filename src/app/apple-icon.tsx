import type { MetadataRoute } from "next";

export default function AppleIcon(): MetadataRoute.AppleIcon {
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
          <stop offset="0" stopColor="#00B4FF" stopOpacity="0.95" />
          <stop offset="1" stopColor="#c8102e" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      <rect x="4" y="4" width="56" height="56" rx="14" fill="url(#bg)" />
      <rect x="4" y="4" width="56" height="56" rx="14" fill="none" stroke="url(#ring)" strokeWidth="3" />

      <path d="M22 16h10v28h18v10H22V16z" fill="#ffffff" />
    </svg>
  );
}

