"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  XCircle,
} from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { useToast } from "@/components/ui/ToastContext";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

export default function CartPage() {
  const {
    items,
    itemCount,
    subtotal,
    updateQuantity,
    removeFromCart,
    removeUnavailableItems,
    clearCart,
    getProduct,
  } = useCart();
  const { info, warning } = useToast();

  const hasOutOfStockItems = items.some((item) => {
    const product = getProduct(item.productId);
    return !product || product.stock <= 0 || product.active === false;
  });

  const handleRemove = (productId: string) => {
    const product = getProduct(productId);
    removeFromCart(productId);
    info(
      `${product?.name || "Item"} removed from cart.`,
      "Cart Updated"
    );
  };

  const handleClear = () => {
    clearCart();
    info("All formulations removed from cart.", "Cart Cleared");
  };

  const handleQtyChange = (productId: string, nextQty: number) => {
    const product = getProduct(productId);
    if (!product) return;

    if (nextQty > product.stock) {
      warning(
        `Only ${product.stock} units are in stock for ${product.name}.`,
        "Stock Limit"
      );
      return;
    }

    updateQuantity(productId, nextQty);
  };

  return (
    <section className="mvp-section">
      <div className="wrap">
        <div className="mvp-cart-header">
          <div>
            <span className="tag">Ayurvedic Dispensing</span>
            <h1>Your Prescription Cart</h1>
            <p>
              {itemCount} {itemCount === 1 ? "item" : "items"} selected for dispatch
            </p>
          </div>

          {items.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              aria-label="Clear all items from cart"
              icon={<Trash2 size={15} />}
            >
              Clear Cart
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag size={52} className="text-gold" />}
            title="Your prescription cart is empty"
            message="Discover our classical herbal rasayanas, therapeutic medicated oils, and gentle digestive remedies prepared with authentic Vedic care."
            actionText="Explore Formulations"
            actionHref="/products"
          />
        ) : (
          <div className="mvp-cart-layout">
            <div className="mvp-cart-list">
              {hasOutOfStockItems && (
                <div className="mvp-warning-banner" role="alert">
                  <AlertTriangle size={18} />
                  <span>
                    Some items in your cart are currently unavailable. Please remove them before continuing to checkout.
                  </span>
                </div>
              )}

              {items.map((item) => {
                const product = getProduct(item.productId);
                if (!product) {
                  return (
                    <article className="mvp-cart-item" key={item.productId} style={{ opacity: 0.85 }}>
                      <div className="mvp-cart-details" style={{ flex: 1, padding: "12px 16px" }}>
                        <span className="mvp-category">Catalog Update</span>
                        <h3 style={{ color: "var(--ink-muted)", margin: "4px 0" }}>Formulation No Longer Available</h3>
                        <div className="mvp-cart-price-line">
                          <span className="stock-out">
                            <XCircle size={13} /> Removed from dispensary inventory
                          </span>
                        </div>
                      </div>
                      <div className="mvp-cart-actions">
                        <button
                          type="button"
                          className="btn-remove-item"
                          onClick={() => removeFromCart(item.productId)}
                          aria-label="Remove unavailable item"
                          style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--red)" }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </article>
                  );
                }

                const isOutOfStock = product.stock <= 0;
                const isOverStock = item.quantity > product.stock;

                return (
                  <article className="mvp-cart-item" key={item.productId}>
                    <div className="mvp-cart-image">
                      <Image
                        src={product.image || product.images?.[0] || "/images/g3.jpg"}
                        alt={product.name}
                        fill
                        sizes="110px"
                        className="product-image"
                      />
                    </div>

                    <div className="mvp-cart-details">
                      <span className="mvp-category">{product.category}</span>
                      <h3>
                        <Link href={`/products/${product.slug}`}>
                          {product.name}
                        </Link>
                      </h3>
                      <div className="mvp-cart-price-line">
                        <span className="unit-price">
                          ₹{(product.price ?? 0).toLocaleString("en-IN")} each
                        </span>
                        {product.active === false ? (
                          <span className="stock-out">
                            <XCircle size={13} /> Currently Unavailable
                          </span>
                        ) : isOutOfStock ? (
                          <span className="stock-out">
                            <XCircle size={13} /> Out of stock
                          </span>
                        ) : isOverStock ? (
                          <span className="stock-warning">
                            <AlertTriangle size={13} /> Only {product.stock} available
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="mvp-cart-actions">
                      <div className="quantity-control" role="group" aria-label={`Quantity for ${product.name}`}>
                        <button
                          type="button"
                          onClick={() => handleQtyChange(item.productId, item.quantity - 1)}
                          aria-label={`Decrease quantity of ${product.name}`}
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="quantity-value" aria-live="polite">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQtyChange(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= product.stock}
                          aria-label={`Increase quantity of ${product.name}`}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="item-subtotal">
                        ₹{((product.price ?? 0) * item.quantity).toLocaleString("en-IN")}
                      </div>

                      <button
                        type="button"
                        className="mvp-remove"
                        onClick={() => handleRemove(item.productId)}
                        aria-label={`Remove ${product.name} from cart`}
                      >
                        <Trash2 size={15} /> Remove
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="mvp-summary-card">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Items ({itemCount})</span>
                <span>₹{(subtotal ?? 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="summary-row">
                <span>Standard Hospital Shipping</span>
                <span className="free-badge">Complimentary</span>
              </div>
              <div className="summary-row total-row">
                <strong>Estimated Total</strong>
                <strong className="total-amount">
                  ₹{(subtotal ?? 0).toLocaleString("en-IN")}
                </strong>
              </div>

              <div className="summary-note">
                <p>
                  * Orders are verified directly with hospital pharmacy dispatch. Online payment gateway is coming soon.
                </p>
              </div>

              {hasOutOfStockItems ? (
                <Button
                  variant="primary"
                  onClick={() => {
                    removeUnavailableItems();
                    info("Unavailable formulations removed from your cart.", "Cart Updated");
                  }}
                  title="Remove unavailable items before checkout"
                >
                  Remove Unavailable Items
                </Button>
              ) : (
                <Button
                  href="/checkout"
                  id="checkout-cta-btn"
                  icon={<ArrowRight size={17} />}
                >
                  Proceed to Checkout
                </Button>
              )}

              <div className="continue-shopping">
                <Link href="/products">← Continue Shopping</Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
