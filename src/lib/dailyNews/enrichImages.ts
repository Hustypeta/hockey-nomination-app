import { fetchOgImage } from "@/lib/dailyNews/ogImage";
import type { DailyNewsItem } from "@/lib/dailyNews/types";

/** Doplní OG náhled u položek bez obrázku z RSS (paralelně, s krátkým timeoutem). */
export async function enrichDailyNewsImages(
  items: DailyNewsItem[],
  max = 5
): Promise<DailyNewsItem[]> {
  const slice = items.slice(0, max);
  const rest = items.slice(max);

  const enriched = await Promise.all(
    slice.map(async (item) => {
      if (item.imageUrl) return item;
      const og = await fetchOgImage(item.url);
      return og ? { ...item, imageUrl: og } : item;
    })
  );

  return [...enriched, ...rest];
}
