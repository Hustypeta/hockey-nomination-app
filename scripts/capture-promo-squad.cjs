/**
 * Generuje PNG editoru soupisky pro FB cover promo.
 *
 * Před spuštěním:
 *   1. npx playwright install chromium   (jednou)
 *   2. npm run dev                        (terminál A)
 *   3. npm run promo:capture-squad        (terminál B)
 *
 * Výstup: public/images/promo/fb-cover-squad-editor.png
 *
 * Env: BASE_URL (výchozí http://127.0.0.1:3000), OUT (cesta k PNG)
 */
const path = require("path");
const fs = require("fs");

async function main() {
  const { chromium } = require("playwright");

  const base = process.env.BASE_URL || "http://127.0.0.1:3000";
  const url = `${base.replace(/\/$/, "")}/promo/squad-capture`;
  const root = path.join(__dirname, "..");
  const out =
    process.env.OUT ||
    path.join(root, "public", "images", "promo", "fb-cover-squad-editor.png");

  fs.mkdirSync(path.dirname(out), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 800, height: 2800 },
    deviceScaleFactor: 2,
  });

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });
    await page.waitForSelector('[data-capture-ready="true"]', { timeout: 90000 });
    await page.evaluate(() => new Promise((r) => setTimeout(r, 500)));

    const handle = await page.$("#squad-capture-root");
    if (!handle) {
      throw new Error("Missing #squad-capture-root");
    }
    await handle.screenshot({ path: out, type: "png" });
    console.log("Wrote", out);
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
