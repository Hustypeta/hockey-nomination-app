import type { DailyNewsFeedConfig } from "@/lib/dailyNews/types";

/** Zdroje novinek — Sport.cz, Livesport, ČT Sport, NHL.com/cs (české hráče). */
export const DAILY_NEWS_FEEDS: DailyNewsFeedConfig[] = [
  {
    id: "sport-cz",
    source: "Sport.cz",
    url: "https://www.sport.cz/rss/sekce/hokej-32",
    mode: "sport_cz_section",
  },
  {
    id: "livesport",
    source: "Livesport.cz",
    url: "https://www.livesport.cz/zpravy/hokej/",
    mode: "livesport_html",
  },
  {
    id: "ct-sport",
    source: "ČT Sport",
    url: "https://sport.ceskatelevize.cz/rss/rubrika/hokej-2",
    mode: "hockey",
  },
  {
    id: "nhl-com-cs",
    source: "NHL.com/cs",
    url: "https://www.nhl.com/cs",
    mode: "nhl_cs_czech",
  },
];

export const DAILY_NEWS_HOME_COUNT = 5;
export const DAILY_NEWS_CACHE_MS = 10 * 60 * 1000;
