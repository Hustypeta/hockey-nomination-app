import { chromium, devices } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const BASE = process.env.UI_BASE_URL?.trim() || "https://hokejlineup.cz";
const OUT_DIR = path.resolve(process.cwd(), "artifacts", "ui");

const PAGES = [
  { slug: "rules", path: "/pravidla-souteze" },
  { slug: "bracket", path: "/bracket" },
];

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

function safeName(s) {
  return s.replace(/[^a-z0-9_-]+/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

async function shoot(page, name) {
  await page.waitForLoadState("networkidle");
  // Stabilizace: počkej, ať doběhnou animace/blur (jen krátce)
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(OUT_DIR, `${safeName(name)}.png`), fullPage: true });
}

const iphone = devices["iPhone 14"];

const viewports = [
  {
    key: "desktop",
    contextOptions: {
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    },
  },
  {
    key: "iphone",
    contextOptions: {
      ...iphone,
    },
  },
];

const browser = await chromium.launch();
try {
  await ensureDir(OUT_DIR);
  for (const vp of viewports) {
    const context = await browser.newContext(vp.contextOptions);
    const page = await context.newPage();
    for (const p of PAGES) {
      const url = `${BASE}${p.path}`;
      await page.goto(url, { waitUntil: "domcontentloaded" });
      await shoot(page, `${p.slug}-${vp.key}`);
    }
    await context.close();
  }
  console.log(`Saved screenshots to ${OUT_DIR}`);
} finally {
  await browser.close();
}

