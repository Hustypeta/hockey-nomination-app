export const contentType = "image/svg+xml";

export default function Icon() {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Lineup">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b1220"/>
      <stop offset="1" stop-color="#05080f"/>
    </linearGradient>
    <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#00B4FF" stop-opacity="0.9"/>
      <stop offset="0.55" stop-color="#ffffff" stop-opacity="0.25"/>
      <stop offset="1" stop-color="#c8102e" stop-opacity="0.85"/>
    </linearGradient>
  </defs>

  <circle cx="32" cy="32" r="30" fill="url(#bg)"/>
  <circle cx="32" cy="32" r="30" fill="none" stroke="url(#ring)" stroke-width="3"/>

  <path d="M22 16h10v28h18v10H22V16z" fill="#ffffff"/>
  <path d="M22 44h28v10H22z" fill="#00B4FF" opacity="0.25"/>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}

