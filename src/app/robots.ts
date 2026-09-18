import type { MetadataRoute } from "next";

const site = "https://hokejlineup.cz";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/auth/",
          "/ucet/",
          "/fantasy",
          "/design/",
          "/promo/",
          "/cover",
          "/jersey-preview",
          "/l/",
          "/m/",
          "/h/",
          "/p/",
          "/v/",
          "/share",
        ],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
  };
}
