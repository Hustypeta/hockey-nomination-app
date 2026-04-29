import type { MetadataRoute } from "next";

const site = "https://hokejlineup.cz";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          // Technické / neveřejné
          "/api/",
          "/admin/",
          // Přihlašovací a účetní obrazovky (nechceme ve výsledcích)
          "/auth/",
          "/ucet/",
          // Krátké/hostované sdílení je pro lidi, ne pro index (duplicitní obsah)
          "/l/",
          "/share",
        ],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}

