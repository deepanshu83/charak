"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Filter, Sparkles, PackageSearch, ShoppingBag } from "lucide-react";
import ProductCard from "@/components/catalog/ProductCard";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { fetchProducts, subscribeProducts } from "@/lib/productService";
import { useCart } from "@/lib/cart-store";
import type { Product } from "@/types";

export default function ProductListing() {
  const { itemCount } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const remote = await fetchProducts();
        if (isMounted) {
          setProducts(remote || []);
        }
      } catch (err) {
        console.warn("[Products Page] Notice fetching from database:", err);
        if (isMounted) setProducts([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();

    const unsubscribe = subscribeProducts(() => {
      fetchProducts().then((remote) => {
        if (isMounted) setProducts(remote || []);
      });
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const categories = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.category)));
    return ["All", ...list];
  }, [products]);

  const filtered = useMemo(() => {
    // Only show active products to public visitors
    const activeList = products.filter((p) => p.active !== false);
    if (category === "All") return activeList;
    return activeList.filter((p) => p.category === category);
  }, [category, products]);

  return (
    <section className="mvp-section">
      <div className="wrap">
        <div className="mvp-toolbar">
          <div className="mvp-heading-area">
            <div className="tag-badge">
              <Sparkles size={14} />
              <span>Authentic Ayurvedic Herbal Medicine</span>
            </div>
            <h1>Medicinal Formulations &amp; Wellness</h1>
            <p>
              Classical herbs, medicated oils, and revitalizing supplements prepared with strict adherence to authentic Ayurvedic principles at Charak Ayurveda.
            </p>
          </div>

          <div className="mvp-filter-wrapper">
            <span className="mvp-filter-label">
              <Filter size={15} /> Filter Category:
            </span>
            <div className="mvp-filter-group" aria-label="Filter products by category">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={category === item ? "active" : ""}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <div style={{ marginLeft: "auto" }}>
              <Link
                href="/cart"
                className="btn sm"
                id="listing-view-cart-btn"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                <ShoppingBag size={16} />
                <span>View Cart ({itemCount})</span>
              </Link>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="mvp-product-grid" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="mvp-product-card p-4">
                <Skeleton variant="card" height={220} />
                <div style={{ padding: "16px 0 0" }}>
                  <Skeleton variant="text" width="40%" height={14} style={{ marginBottom: 8 }} />
                  <Skeleton variant="text" width="80%" height={22} style={{ marginBottom: 12 }} />
                  <Skeleton variant="text" width="100%" height={16} style={{ marginBottom: 6 }} />
                  <Skeleton variant="text" width="60%" height={16} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<PackageSearch size={48} className="text-gold" />}
            title="No formulations found"
            message={`There are currently no active products in the category "${category}".`}
            actionText="View All Formulations"
            onAction={() => setCategory("All")}
          />
        ) : (
          <div className="mvp-product-grid">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {itemCount > 0 && (
          <Link
            href="/cart"
            className="products-floating-cart"
            id="floating-cart-pill"
          >
            <ShoppingBag size={18} />
            <span>Prescription Cart ({itemCount}) &rarr;</span>
          </Link>
        )}
      </div>
    </section>
  );
}
