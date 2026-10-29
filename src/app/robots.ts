import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://charakayurvedapilani.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/api/",
          "/api/admin",
          "/api/admin/*",
          "/test-payment",
          "/todos",
          "/cart",
          "/checkout",
          "/order-success",
          "/products/cart",
          "/products/checkout",
          "/appointment-confirmation",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
