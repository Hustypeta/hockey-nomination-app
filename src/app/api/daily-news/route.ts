import { NextResponse } from "next/server";
import { enrichDailyNewsImages } from "@/lib/dailyNews/enrichImages";
import { fetchDailyNews, pickHomeNews } from "@/lib/dailyNews/fetchDailyNews";
import { DAILY_NEWS_HOME_COUNT } from "@/lib/dailyNews/feeds";

export const dynamic = "force-dynamic";
export const revalidate = 600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Math.min(40, Math.max(1, Number(limitParam) || DAILY_NEWS_HOME_COUNT)) : 30;
  const enrich =
    searchParams.get("enrich") === "1" ||
    (limit <= DAILY_NEWS_HOME_COUNT && searchParams.get("enrich") !== "0");

  try {
    let items = await fetchDailyNews(limit <= DAILY_NEWS_HOME_COUNT ? Math.max(limit * 4, 20) : limit);
    if (limit <= DAILY_NEWS_HOME_COUNT) {
      items = pickHomeNews(items, limit);
    } else {
      items = items.slice(0, limit);
    }
    if (enrich) {
      items = await enrichDailyNewsImages(items, Math.min(limit, DAILY_NEWS_HOME_COUNT));
    }
    return NextResponse.json(
      {
        items,
        count: items.length,
        fetchedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
        },
      }
    );
  } catch (error) {
    console.error("daily-news:", error);
    return NextResponse.json({ items: [], count: 0, error: "fetch_failed" }, { status: 500 });
  }
}
