import type { Metadata } from "next";
import BrandHeader from "@/components/ui/BrandHeader";
import ProductDetailWrapper from "@/components/catalog/ProductDetailWrapper";
import { fetchProductBySlug, fetchProducts } from "@/lib/productService";

export const dynamicParams = true;

export async function generateStaticParams() {
  const products = await fetchProducts().catch(() => []);
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | Charak Ayurveda Pilani",
      description: "The requested Ayurvedic formulation could not be found.",
    };
  }

  const title = `${product.name} | Charak Ayurveda Pilani`;
  const description =
    product.shortDescription ||
    product.description.slice(0, 160) ||
    "Authentic Ayurvedic formulation from Charak Ayurveda Pilani.";

  return {
    title,
    description,
    alternates: {
      canonical: `https://charakayurvedapilani.com/products/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://charakayurvedapilani.com/products/${slug}`,
      images: [
        {
          url: product.image || product.images?.[0] || "/images/g3.jpg",
          alt: product.name,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.image || product.images?.[0] || "/images/g3.jpg"],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const initialProduct = await fetchProductBySlug(slug);

  const productJsonLd = initialProduct
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: initialProduct.name,
        image: `https://charakayurvedapilani.com${initialProduct.image || "/images/g3.jpg"}`,
        description: initialProduct.description || initialProduct.shortDescription,
        category: initialProduct.category,
        offers: {
          "@type": "Offer",
          priceCurrency: "INR",
          price: initialProduct.price,
          availability:
            initialProduct.stock > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          url: `https://charakayurvedapilani.com/products/${slug}`,
        },
      }
    : null;

  return (
    <BrandHeader>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      <ProductDetailWrapper initialProduct={initialProduct} slug={slug} />
    </BrandHeader>
  );
}
