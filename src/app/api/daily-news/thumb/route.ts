import { NextRequest, NextResponse } from "next/server";

function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h.endsWith(".local")) return true;
  if (h === "127.0.0.1" || h === "0.0.0.0") return true;
  if (h.startsWith("10.") || h.startsWith("192.168.") || h.startsWith("169.254.")) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  return false;
}

export const dynamic = "force-dynamic";

/** Proxy náhledu zprávy — stejný princip jako server-side OG fetch. */
export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("url");
  if (!raw) {
    return NextResponse.json({ error: "Chybí parametr url." }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return NextResponse.json({ error: "Neplatná URL." }, { status: 400 });
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return NextResponse.json({ error: "Nepodporovaný protokol." }, { status: 400 });
  }

  if (isBlockedHost(parsed.hostname)) {
    return NextResponse.json({ error: "Host není povolen." }, { status: 403 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const upstream = await fetch(parsed.href, {
      headers: {
        "User-Agent": "HokejLineup/1.0 (+https://hokejlineup.cz; news-thumb)",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        Referer: `${parsed.protocol}//${parsed.host}/`,
      },
      signal: controller.signal,
      redirect: "follow",
      next: { revalidate: 3600 },
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: "Obrázek se nepodařilo načíst." }, { status: 502 });
    }

    const contentType = upstream.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Odpověď není obrázek." }, { status: 415 });
    }

    const bytes = await upstream.arrayBuffer();
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return NextResponse.json({ error: "Obrázek se nepodařilo načíst." }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
