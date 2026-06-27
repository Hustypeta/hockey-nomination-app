export type DailyNewsItem = {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string | null;
  /** RSS media / OG preview — null = brand tile na kartě */
  imageUrl: string | null;
};

export type DailyNewsFeedMode =
  | "hockey"
  | "filter_hockey"
  | "czech_hockey"
  | "google"
  | "nhl_com"
  | "elite_prospects"
  | "sport_cz_section"
  | "livesport_html"
  | "nhl_cs_czech";

export type DailyNewsFeedConfig = {
  id: string;
  source: string;
  url: string;
  mode: DailyNewsFeedMode;
};
