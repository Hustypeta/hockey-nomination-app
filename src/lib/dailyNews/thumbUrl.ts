/** Náhled článku přes vlastní API — obchází hotlink / referrer blokace u zdrojů. */
export function dailyNewsThumbUrl(imageUrl: string): string {
  return `/api/daily-news/thumb?url=${encodeURIComponent(imageUrl)}`;
}
