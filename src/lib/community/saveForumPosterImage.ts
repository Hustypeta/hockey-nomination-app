import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

const MAX_BYTES = 2 * 1024 * 1024;

/** Uloží PNG z base64 do public/images/forum/posts/ a vrátí veřejnou cestu. */
export async function saveForumPosterPngFromBase64(pngBase64: string): Promise<string> {
  const raw = pngBase64.replace(/^data:image\/png;base64,/i, "").trim();
  if (!raw) throw new Error("Chybí data obrázku.");

  const buf = Buffer.from(raw, "base64");
  if (buf.length === 0) throw new Error("Neplatný obrázek.");
  if (buf.length > MAX_BYTES) throw new Error("Obrázek je příliš velký (max. 2 MB).");

  const dir = path.join(process.cwd(), "public", "images", "forum", "posts");
  await fs.mkdir(dir, { recursive: true });
  const name = `${randomUUID()}.png`;
  await fs.writeFile(path.join(dir, name), buf);
  return `/images/forum/posts/${name}`;
}
