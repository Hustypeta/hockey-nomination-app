import { NextResponse } from "next/server";
import { getThrownStatus, requireAdminOrThrow } from "@/lib/matchAdmin";
import { loadMsFantasyBestDayLineupPoster } from "@/lib/msFantasyPosterData";

export async function GET() {
  try {
    await requireAdminOrThrow();
    const poster = await loadMsFantasyBestDayLineupPoster();
    if (!poster) {
      return NextResponse.json({ error: "Žádná vyhodnocená sestava k exportu." }, { status: 404 });
    }
    return NextResponse.json({ poster });
  } catch (e) {
    const status = getThrownStatus(e) ?? 500;
    if (status === 401) return NextResponse.json({ error: "Neautorizováno." }, { status: 401 });
    console.error("admin fantasy poster best-day:", e);
    return NextResponse.json({ error: "Nepodařilo se načíst data plakátu." }, { status });
  }
}
