import type { Metadata } from "next";
import {
  SITE_FACEBOOK_PAGE_URL,
  SITE_INSTAGRAM_PAGE_URL,
  SITE_OG_DEFAULT_IMAGE_HEIGHT,
  SITE_OG_DEFAULT_IMAGE_URL,
  SITE_OG_DEFAULT_IMAGE_WIDTH,
  SITE_TIKTOK_PAGE_URL,
} from "@/lib/siteBranding";

export const SITE_ORIGIN = "https://hokejlineup.cz";

export const DEFAULT_TITLE =
  "Lineup | Editor hokejové sestavy, nominace a fantasy";
export const DEFAULT_DESCRIPTION =
  "Sestav si českou hokejovou soupisku, ulož formace na zápas a porovnej je s ostatními. Editor sestavy, fantasy a komunita fanoušků.";
export const DEFAULT_OG_ALT =
  "Lineup — editor hokejové sestavy, nominace a fantasy · hokejlineup.cz";

export const ARTICLE_AUTHOR = "Lineup";

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
  index?: boolean;
  follow?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogAlt?: string;
};

export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  index = true,
  follow = true,
  ogTitle,
  ogDescription,
  ogAlt,
}: PageMetaInput): Metadata {
  const canonical = path === "/" ? "/" : path;
  const ogT = ogTitle ?? title;
  const ogD = ogDescription ?? description;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical },
    robots: { index, follow },
    openGraph: {
      type: "website",
      locale: "cs_CZ",
      url: canonical,
      siteName: "Lineup",
      title: ogT,
      description: ogD,
      images: [
        {
          url: SITE_OG_DEFAULT_IMAGE_URL,
          width: SITE_OG_DEFAULT_IMAGE_WIDTH,
          height: SITE_OG_DEFAULT_IMAGE_HEIGHT,
          alt: ogAlt ?? DEFAULT_OG_ALT,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogT,
      description: ogD,
      images: [SITE_OG_DEFAULT_IMAGE_URL],
    },
  };
}

export function absoluteUrl(path: string): string {
  if (!path || path === "/") return SITE_ORIGIN;
  return `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

export function organizationJsonLd() {
  const sameAs = [SITE_FACEBOOK_PAGE_URL, SITE_INSTAGRAM_PAGE_URL, SITE_TIKTOK_PAGE_URL].filter(
    (url) => url.trim().length > 0,
  );
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_ORIGIN}/#organization`,
    name: "Lineup",
    url: SITE_ORIGIN,
    logo: `${SITE_ORIGIN}/images/logo/logo.png`,
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_ORIGIN}/#website`,
    name: "Lineup",
    url: SITE_ORIGIN,
    inLanguage: "cs-CZ",
    description: DEFAULT_DESCRIPTION,
    publisher: { "@id": `${SITE_ORIGIN}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_ORIGIN}/hraci?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function articleJsonLd(input: {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.headline,
    description: input.description,
    inLanguage: "cs-CZ",
    mainEntityOfPage: absoluteUrl(input.path),
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    author: { "@type": "Organization", name: ARTICLE_AUTHOR, url: SITE_ORIGIN },
    publisher: { "@id": `${SITE_ORIGIN}/#organization` },
    image: [`${SITE_ORIGIN}${SITE_OG_DEFAULT_IMAGE_URL.replace(/\?.*$/, "")}`],
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export const PAGE_SEO = {
  home: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    path: "/",
  },
  sestava: {
    title: "Editor nominace Česka",
    description:
      "Sestav si nominaci české hokejové reprezentace. Vyber brankáře, obranu a útok, porovnej sestavu s ostatními fanoušky.",
    path: "/sestava",
  },
  matchEditor: {
    title: "Editor sestavy na zápas",
    description:
      "Poskládej si hokejovou sestavu na zápas, ulož formace a sdílej je. Prohlížet a skládat můžeš bez účtu, přihlášení až při uložení.",
    path: "/zapasy/sestava",
  },
  souteze: {
    title: "Soutěže",
    description:
      "Hokejové soutěže na Lineupu: historické sestavy, Draft Fantasy Extraliga 2026/27 a nástroje k české reprezentaci.",
    path: "/souteze",
  },
  historical: {
    title: "Historické sestavy",
    description:
      "Sestav si historickou českou hokejovou soupisku — od Nagana 1998 po zlaté MS. Fanouškovský editor slavných týmů.",
    path: "/souteze/historical-lineup",
  },
  extraliga: {
    title: "Draft Fantasy Extraliga 2026/27",
    description:
      "Draft Fantasy české hokejové extraligy 2026/27. Připravujeme sezónní fantasy, ve kterém poskládáš svůj tým z extraligových hráčů.",
    path: "/souteze/extraliga",
  },
  aTym: {
    title: "A-tým české reprezentace",
    description:
      "Nástroje k seniorské české hokejové reprezentaci — nominace, historické sestavy a soutěže na Lineupu.",
    path: "/souteze/ceska-reprezentace/a-tym",
  },
  u20: {
    title: "U20 — česká reprezentace",
    description: "Fanouškovské nástroje k reprezentaci do 20 let. Turnaje této kategorie jsou uzavřené, další ročníky přidáme.",
    path: "/souteze/ceska-reprezentace/u20",
  },
  u18: {
    title: "U18 — česká reprezentace",
    description: "Fanouškovské nástroje k reprezentaci do 18 let. Turnaje této kategorie jsou uzavřené, další ročníky přidáme.",
    path: "/souteze/ceska-reprezentace/u18",
  },
  ms2027: {
    title: "MS 2027 — česká reprezentace",
    description:
      "Mistrovství světa v ledním hokeji 2027 v Německu. Soutěže a editor nominace připravujeme.",
    path: "/souteze/ms-2027",
  },
  forum: {
    title: "Fórum hokejových fanoušků",
    description:
      "Komunita Lineup: sdílené sestavy, diskuze k nominaci a extralize, komentáře a reakce fanoušků.",
    path: "/forum",
  },
  pravidla: {
    title: "Pravidla soutěže",
    description:
      "Pravidla nominační soutěže Lineup: bezplatná účast, bodování, časový bonus, ceny a vyhodnocení.",
    path: "/pravidla-souteze",
  },
  zebricek: {
    title: "Žebříček soutěží",
    description:
      "Pořadí a body v soutěžích Lineup — nominace české reprezentace, Fantasy a další žebříčky fanoušků.",
    path: "/zebricek",
  },
  bracket: {
    title: "Pick’em pavouk MS",
    description:
      "Bracket Pick’em mistrovství světa v hokeji. Vyplň tipy play-off a porovnej je s ostatními.",
    path: "/bracket",
  },
  kdoJsem: {
    title: "Kdo jsem",
    description:
      "Tvůrce projektu Lineup — nezávislý fanouškovský editor hokejové sestavy, nominace a fantasy.",
    path: "/kdo-jsem",
  },
  gdpr: {
    title: "Zásady ochrany osobních údajů",
    description:
      "Zásady ochrany osobních údajů hokejlineup.cz: Google přihlášení, účet, nominace, soutěže, cookies a GDPR.",
    path: "/ochrana-udaju",
  },
  novinky: {
    title: "Novinky na platformě",
    description: "Co je nového v Lineupu — design, editor sestavy, soutěže a změny v aplikaci.",
    path: "/novinky",
  },
  dailyNews: {
    title: "Hokejové zprávy",
    description:
      "Přehled hokejových zpráv se zaměřením na extraligu a české hráče. Agregace ze Sport.cz, Livesport, ČT Sport a NHL.com/cs.",
    path: "/daily-news",
  },
  hraci: {
    title: "Hráči české reprezentace",
    description:
      "Pool hráčů pro editor nominace — stejný seznam jako v sestavě české reprezentace na Lineupu.",
    path: "/hraci",
  },
} as const;
