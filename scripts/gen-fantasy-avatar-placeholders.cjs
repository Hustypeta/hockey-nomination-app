const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "public", "assets", "fantasy-avatars");
fs.mkdirSync(dir, { recursive: true });

for (let i = 1; i <= 28; i++) {
  const hue = (i * 97 + 13) % 330;
  const hue2 = (hue + 38) % 360;
  const skin = `hsl(${hue},16%,74%)`;
  const j1 = `hsl(${hue2},58%,32%)`;
  const j2 = `hsl(${hue2},48%,18%)`;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96">
<defs>
<radialGradient id="bg" cx="50%" cy="35%" r="70%">
<stop offset="0%" stop-color="hsl(215,22%,32%)"/>
<stop offset="100%" stop-color="hsl(222,40%,8%)"/>
</radialGradient>
<linearGradient id="j" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stop-color="${j1}"/>
<stop offset="100%" stop-color="${j2}"/>
</linearGradient>
<radialGradient id="sk" cx="42%" cy="38%" r="55%">
<stop offset="0%" stop-color="${skin}"/>
<stop offset="100%" stop-color="hsl(${hue},22%,48%)"/>
</radialGradient>
<radialGradient id="lit" cx="30%" cy="25%" r="40%">
<stop offset="0%" stop-color="rgba(255,255,255,0.35)"/>
<stop offset="100%" stop-color="rgba(255,255,255,0)"/>
</radialGradient>
</defs>
<rect width="96" height="96" fill="url(#bg)"/>
<ellipse cx="48" cy="56" rx="30" ry="24" fill="url(#j)"/>
<ellipse cx="48" cy="34" rx="19" ry="21" fill="url(#sk)"/>
<ellipse cx="48" cy="32" rx="17" ry="19" fill="url(#lit)" opacity="0.55"/>
<path d="M34 52 Q48 60 62 52" fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="1.2" stroke-linecap="round"/>
<ellipse cx="48" cy="78" rx="14" ry="5" fill="rgba(0,0,0,0.25)" opacity="0.4"/>
</svg>`;
  fs.writeFileSync(path.join(dir, `player_${String(i).padStart(2, "0")}.svg`), svg);
}
console.log("Wrote 28 SVG placeholders to public/assets/fantasy-avatars/");
