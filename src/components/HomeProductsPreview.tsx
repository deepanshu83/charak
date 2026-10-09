"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Sparkles } from "lucide-react";
import ProductCard from "@/components/catalog/ProductCard";
import { fetchProducts, subscribeProducts } from "@/lib/productService";
import type { Product } from "@/types";

export default function HomeProductsPreview() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const remote = await fetchProducts();
        if (isMounted) {
          setProducts((remote || []).filter((p) => p.active !== false).slice(0, 4));
        }
      } catch (err) {
        console.warn("[HomeProductsPreview] Notice fetching products:", err);
        if (isMounted) setProducts([]);
      }
    }
    load();

    const unsub = subscribeProducts(() => {
      fetchProducts().then((remote) => {
        if (isMounted) {
          setProducts((remote || []).filter((p) => p.active !== false).slice(0, 4));
        }
      });
    });
    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  if (products.length === 0) return null;

  return (
    <section id="pharmacy" style={{ padding: "80px 0", background: "rgba(24, 66, 50, 0.02)" }}>
      <div className="wrap">
        <div className="sec-head">
          <span className="tag-badge">
            <Sparkles size={14} />
            <span>Ayurvedic Pharmacy &amp; Formulations</span>
          </span>
          <h2>Classical Herbal Medicines &amp; Therapeutic Oils</h2>
          <p>
            Authentic herbal rasayanas, medicated tailas, and digestive preparations formulated according to classical Ayurvedic treatises.
          </p>
        </div>

        <div className="mvp-product-grid" style={{ marginBottom: "36px" }}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap" }}>
          <Link href="/products" className="btn" id="home-view-all-products-btn">
            <ShoppingBag size={18} />
            <span>Explore All Ayurvedic Products</span>
          </Link>
          <Link href="/cart" className="btn ghost" id="home-view-cart-btn">
            <span>View Prescription Cart</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
