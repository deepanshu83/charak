"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, PackageSearch } from "lucide-react";
import ProductDetail from "@/components/catalog/ProductDetail";
import { fetchProductBySlug, subscribeProducts } from "@/lib/productService";
import type { Product } from "@/types";

export default function ProductDetailWrapper({
  initialProduct,
  slug,
}: {
  initialProduct?: Product | null;
  slug: string;
}) {
  const [product, setProduct] = useState<Product | null>(initialProduct || null);

  useEffect(() => {
    let isMounted = true;
    if (!product) {
      fetchProductBySlug(slug).then((res) => {
        if (isMounted && res) setProduct(res);
      });
    }

    const unsubscribe = subscribeProducts(() => {
      fetchProductBySlug(slug).then((res) => {
        if (isMounted) setProduct(res);
      });
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [slug, product]);

  if (!product) {
    return (
      <section className="mvp-section">
        <div className="wrap">
          <div className="mvp-empty-state">
            <PackageSearch size={48} />
            <h2>Product Not Found</h2>
            <p>We could not find the requested formulation or it may have been removed.</p>
            <Link href="/products" className="btn sm">
              <ArrowLeft size={16} /> Return to Products
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return <ProductDetail product={product} />;
}
