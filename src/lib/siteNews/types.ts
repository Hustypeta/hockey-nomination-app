export type SiteNewsItem = {
  id: string;
  title: string;
  /** Krátký náhled v kartě */
  summary: string;
  /** Celý text ve vloženém panelu */
  body: string;
  /** ISO datum */
  publishedAt: string;
  tag: string;
  /** Zkrácený text do zvonku notifikací */
  notificationShort: string;
  /** Volitelný obrázek v náhledu / detailu */
  imageUrl?: string;
};
