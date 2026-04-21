/**
 * Přidá horní pruh k promo OG obrázku — Facebook náhled často „usekává“ horní edge,
 * meta tagy obsah posunout neumí.
 * Usage: node scripts/pad-og-top.mjs [padPx]
 */
import sharp from "sharp";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const input = join(root, "public/images/promo/og-share-ms2026-jerseys.png");
const output = input;

const pad = Math.min(140, Math.max(40, Number(process.argv[2]) || 72));

const bg = { r: 15, g: 23, b: 40, alpha: 1 }; // tmavě modrá (~ header)

async function main() {
  const meta = await sharp(input).metadata();
  const w = meta.width ?? 1200;
  const h = meta.height ?? 630;

  await sharp({
    create: {
      width: w,
      height: h + pad,
      channels: 4,
      background: bg,
    },
  })
    .composite([{ input, top: pad, left: 0 }])
    .png({ compressionLevel: 9 })
    .toFile(output + ".tmp");

  const fs = await import("node:fs/promises");
  await fs.rename(output + ".tmp", output);
  console.log(`OK: top padding ${pad}px → ${w}×${h + pad} (${input})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
