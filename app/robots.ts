import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://homestore.com"

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/products", "/categories", "/search"],
        disallow: ["/api/", "/account/", "/checkout/", "/cart/", "/order/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
