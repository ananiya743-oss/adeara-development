import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || "https://adeara-development-41zb.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/admin", "/setup", "/debug"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
