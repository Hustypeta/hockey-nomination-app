/**
 * VOLITELNĚ: převod pozadí na přesných 1080×1350.
 *
 * Výchozí workflow — jen nahrajte soubor, nic nespouštějte:
 *   public/images/reprezentace/poster-roster-ice-bg.png
 *
 * Skript se spouští jen s --normalize a nikdy nepoužívá jiný „zdrojový“ soubor.
 * Před přepsáním vytvoří zálohu poster-roster-ice-bg.backup.png.
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const W = 1080;
const H = 1350;
const target = path.join(root, "public/images/reprezentace/poster-roster-ice-bg.png");
const backup = path.join(root, "public/images/reprezentace/poster-roster-ice-bg.backup.png");

const normalize = process.argv.includes("--normalize");

if (!fs.existsSync(target)) {
  console.error("Chybí public/images/reprezentace/poster-roster-ice-bg.png — nahrajte obrázek a hotovo.");
  process.exit(1);
}

const meta = await sharp(target).metadata();
console.log(`Aktuální: ${meta.width}x${meta.height} (${meta.format})`);

if (!normalize) {
  console.log("Soubor je na místě. Pro resize na 1080×1350 spusťte: node scripts/generate-poster-ice-bg.mjs --normalize");
  process.exit(0);
}

if (meta.width === W && meta.height === H) {
  console.log(`Už je ${W}x${H}, nic se nemění.`);
  process.exit(0);
}

fs.copyFileSync(target, backup);
console.log(`Záloha -> ${backup}`);

await sharp(target)
  .resize(W, H, { fit: "cover", position: "centre" })
  .png()
  .toFile(target);

console.log(`Přepsáno -> ${target} (${W}x${H})`);
