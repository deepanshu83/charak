"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, CheckCircle2, ShoppingBag, XCircle } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { useToast } from "@/components/ui/ToastContext";
import type { Product } from "@/types";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { success, warning } = useToast();
  const [added, setAdded] = useState(false);
  const isOutOfStock = product.stock <= 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;
    const res = addToCart(product.id, 1);
    if (res.success) {
      setAdded(true);
      success(`${product.name} added to prescription cart.`, "Prescription Updated");
      setTimeout(() => setAdded(false), 1400);
    } else {
      warning(res.message || "Could not add item to cart.", "Stock Limit");
    }
  };

  return (
    <article className="mvp-product-card">
      <Link href={`/products/${product.slug}`} className="mvp-product-image" aria-label={`View ${product.name}`}>
        <Image
          src={product.image || product.images?.[0] || "/images/g3.jpg"}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="product-image"
        />
        {isOutOfStock && (
          <div className="product-badge out-of-stock-badge">Out of Stock</div>
        )}
      </Link>

      <div className="mvp-product-body">
        <div className="mvp-card-top">
          <span className="mvp-category">{product.category}</span>
          <span className={isOutOfStock ? "stock-out" : "stock-in"}>
            {isOutOfStock ? (
              <>
                <XCircle size={13} /> Unavailable
              </>
            ) : (
              <>
                <CheckCircle2 size={13} /> {product.stock} in stock
              </>
            )}
          </span>
        </div>

        <h3>
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h3>

        <p className="mvp-card-desc">{product.shortDescription}</p>

        <div className="mvp-product-meta">
          <div className="mvp-price-wrap">
            <span className="mvp-price-curr">₹</span>
            <strong className="mvp-price-val">
              {product.price.toLocaleString("en-IN")}
            </strong>
          </div>

          <div className="mvp-card-actions">
            <Link
              href={`/products/${product.slug}`}
              className="mvp-details-link"
              title={`View ${product.name} details`}
            >
              Details
            </Link>
            <button
              type="button"
              className={`btn sm ${added ? "added" : ""}`}
              disabled={isOutOfStock}
              onClick={handleAdd}
              aria-label={`Add ${product.name} to cart`}
            >
              {added ? (
                <>
                  <Check size={15} /> Added
                </>
              ) : (
                <>
                  <ShoppingBag size={15} /> Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
