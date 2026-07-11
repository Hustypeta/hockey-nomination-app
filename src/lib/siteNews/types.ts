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
  /** Náhled na úvodu = jen obrázek (bez překryvného textu a scrimu). */
  homeImageOnly?: boolean;
  /** Náhled na úvodu — celý obrázek (contain), text a „Číst více“ zůstanou. */
  homeImageContain?: boolean;
};
