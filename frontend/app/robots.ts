import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/product-info";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: [
          "*",
          "Googlebot",
          "bingbot",
          "OAI-SearchBot",
          "PerplexityBot",
        ],
        allow: "/",
        disallow: ["/dashboard", "/images/generated/", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
