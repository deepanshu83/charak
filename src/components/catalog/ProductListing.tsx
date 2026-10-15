"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Filter, PackageSearch, ShoppingBag, Eye, ShieldCheck, ArrowLeft, Boxes } from "lucide-react";
import ProductCard from "@/components/catalog/ProductCard";
import ProductsComingSoon from "@/components/catalog/ProductsComingSoon";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { fetchProducts, subscribeProducts } from "@/lib/productService";
import { useCart } from "@/lib/cart-store";
import type { Product } from "@/types";

export default function ProductListing() {
  const searchParams = useSearchParams();
  const { itemCount } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [viewMode, setViewMode] = useState<"coming_soon" | "catalog">("coming_soon");

  useEffect(() => {
    // Check if current user is an authenticated administrator
    const checkAdmin = () => {
      const hasCookie =
        typeof document !== "undefined" &&
        (document.cookie.includes("charak_admin_ui=1") ||
          document.cookie.includes("charak_admin_session="));
      const hasPreviewParam = searchParams.get("preview") === "admin" || searchParams.get("preview") === "true";
      const isAdminUser = hasCookie || hasPreviewParam;
      setIsAdmin(isAdminUser);

      // If admin explicitly requested preview via param, default to catalog preview
      if (hasPreviewParam) {
        setViewMode("catalog");
      }
    };
    checkAdmin();
  }, [searchParams]);

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

  // If in coming soon mode (default for public visitors)
  if (viewMode === "coming_soon") {
    return (
      <ProductsComingSoon
        isAdmin={isAdmin}
        productCount={products.length}
        onSwitchToCatalog={() => setViewMode("catalog")}
      />
    );
  }

  // Admin Live Catalog Preview Mode
  return (
    <section className="mvp-section">
      <div className="wrap">
        {/* Admin Preview Top Navigation Bar */}
        {isAdmin && (
          <div
            style={{
              background: "#ffffff",
              border: "1px solid rgba(197, 160, 89, 0.45)",
              borderLeft: "4px solid #c5a059",
              borderRadius: "12px",
              padding: "14px 20px",
              marginBottom: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
              boxShadow: "0 4px 16px rgba(24, 66, 50, 0.05)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#eef7f2",
                  color: "#184232",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: "999px",
                }}
              >
                <ShieldCheck size={14} />
                <span>Admin Catalog Preview</span>
              </span>
              <span style={{ fontSize: "0.86rem", color: "#475569" }}>
                Public visitors see the <strong>Coming Soon</strong> screen. You are previewing live inventory.
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setViewMode("coming_soon")}
                className="btn sm ghost"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <Eye size={14} />
                <span>View Public Coming Soon</span>
              </button>
              <Link
                href="/admin/products"
                className="btn sm"
                style={{
                  background: "#184232",
                  color: "#ffffff",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Boxes size={14} />
                <span>Manage in Admin Console</span>
              </Link>
            </div>
          </div>
        )}

        <div className="mvp-toolbar">
          <div className="mvp-heading-area">
            <span className="tag">Authentic Ayurvedic Herbal Medicine</span>
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
