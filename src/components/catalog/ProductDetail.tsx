"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  XCircle,
  Zap,
} from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { useToast } from "@/components/ui/ToastContext";
import Button from "@/components/ui/Button";
import type { Product } from "@/types";

export default function ProductDetail({ product }: { product: Product }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { success, warning } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const productImages = useMemo(() => {
    if (product.images && product.images.length > 0) {
      return product.images;
    }
    return product.image ? [product.image] : ["/images/g3.jpg"];
  }, [product.images, product.image]);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 40 && productImages.length > 1) {
      if (diff > 0) {
        // Swipe left -> next image
        setSelectedImageIndex((prev) => (prev + 1) % productImages.length);
      } else {
        // Swipe right -> prev image
        setSelectedImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
      }
    }
    setTouchStartX(null);
  };

  const isInactive = product.active === false;
  const isOutOfStock = product.stock <= 0;

  const handleAdd = () => {
    if (isInactive || isOutOfStock) return;
    const res = addToCart(product.id, quantity);
    if (res.success) {
      setAdded(true);
      success(
        `${quantity} × ${product.name} added to your cart.`,
        "Item Added"
      );
      setTimeout(() => setAdded(false), 2000);
    } else {
      warning(res.message || "Could not add requested quantity.", "Stock Warning");
    }
  };

  const handleBuyNow = () => {
    if (isInactive || isOutOfStock) return;
    addToCart(product.id, quantity);
    success(`Proceeding to checkout with ${product.name}...`, "Direct Checkout");
    router.push("/checkout");
  };

  const handleDecreaseQty = () => {
    setQuantity((q) => Math.max(1, q - 1));
  };

  const handleIncreaseQty = () => {
    if (quantity >= product.stock) {
      warning(`Only ${product.stock} units are currently in stock.`, "Stock Limit");
      return;
    }
    setQuantity((q) => q + 1);
  };

  return (
    <section className="mvp-section">
      <div className="wrap">
        <div className="mvp-back-link">
          <Link href="/products">
            <ArrowLeft size={16} /> Back to Products
          </Link>
        </div>

        <div className="mvp-product-detail">
          <div className="mvp-detail-image-box">
            <div
              className="mvp-detail-image"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <Image
                src={productImages[selectedImageIndex] || product.image || "/images/g3.jpg"}
                alt={`${product.name} - View ${selectedImageIndex + 1}`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="product-image"
              />

              {productImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length)
                    }
                    className="product-gallery-arrow product-gallery-prev"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedImageIndex((prev) => (prev + 1) % productImages.length)
                    }
                    className="product-gallery-arrow product-gallery-next"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Gallery Row */}
            {productImages.length > 1 && (
              <div className="product-thumbnail-gallery" role="tablist" aria-label="Product thumbnails">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`product-thumbnail-btn ${selectedImageIndex === idx ? "active" : ""}`}
                    aria-label={`Show product image ${idx + 1}`}
                    role="tab"
                    aria-selected={selectedImageIndex === idx}
                  >
                    <Image
                      src={img}
                      alt=""
                      fill
                      sizes="80px"
                      style={{ objectFit: "cover" }}
                    />
                  </button>
                ))}
              </div>
            )}

            {isOutOfStock && (
              <div className="product-badge out-of-stock-badge-large">
                Out of Stock
              </div>
            )}
          </div>

          <div className="mvp-detail-copy">
            <div className="mvp-badge-row">
              <span className="tag-badge">{product.category}</span>
              <span className={isInactive || isOutOfStock ? "stock-out" : "stock-in"}>
                {isInactive ? (
                  <>
                    <XCircle size={16} /> Currently Inactive
                  </>
                ) : isOutOfStock ? (
                  <>
                    <XCircle size={16} /> Currently Out of Stock
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} /> {product.stock} units available
                  </>
                )}
              </span>
            </div>

            <h1 className="mvp-detail-title">{product.name}</h1>
            <p className="mvp-detail-short">{product.shortDescription}</p>

            <div className="mvp-detail-price-box">
              <span className="mvp-price-curr">₹</span>
              <strong className="mvp-price-num">
                {product.price.toLocaleString("en-IN")}
              </strong>
              <span className="mvp-tax-note">(Inclusive of all taxes)</span>
            </div>

            <div className="mvp-detail-desc">
              <h4>Description &amp; Traditional Usage</h4>
              <p>{product.description}</p>
            </div>

            {isInactive ? (
              <div className="mvp-out-of-stock-box">
                <p>
                  This formulation is currently inactive in dispensary records and not available for online purchase. Please explore active formulations or consult our clinic physician.
                </p>
                <Link href="/products" className="btn ghost">
                  Browse Active Formulations
                </Link>
              </div>
            ) : !isOutOfStock ? (
              <div className="mvp-purchase-block">
                <div className="mvp-qty-row">
                  <span className="mvp-qty-label">Quantity:</span>
                  <div className="quantity-control" role="group" aria-label="Product quantity controls">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={handleDecreaseQty}
                      disabled={quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="quantity-value" aria-live="polite">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={handleIncreaseQty}
                      disabled={quantity >= product.stock}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="mvp-cta-buttons">
                  <Button
                    type="button"
                    className={added ? "added" : ""}
                    onClick={handleAdd}
                    id="add-to-cart-btn"
                    icon={added ? <Check size={18} /> : <ShoppingBag size={18} />}
                  >
                    {added ? "Added to Cart" : "Add to Cart"}
                  </Button>

                  <Button
                    type="button"
                    variant="gold"
                    onClick={handleBuyNow}
                    id="buy-now-btn"
                    icon={<Zap size={18} />}
                  >
                    Buy Now
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mvp-out-of-stock-box">
                <p>
                  This formulation is currently unavailable. Please check back soon or consult our clinic physician for herbal alternatives.
                </p>
                <Link href="/appointment" className="btn ghost">
                  Consult Physician
                </Link>
              </div>
            )}

            <div className="mvp-trust-badges">
              <div>
                <ShieldCheck size={20} />
                <span>Authentic Classical Preparation</span>
              </div>
              <div>
                <Sparkles size={20} />
                <span>Doctor Recommended Formulations</span>
              </div>
              <div>
                <Truck size={20} />
                <span>Direct Dispensing at Vidyavihar, Pilani</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
