"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  LockKeyhole,
  ShieldCheck,
  ShoppingBag,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { placeOrder } from "@/lib/orderService";
import { launchRazorpayCheckout } from "@/lib/razorpayClient";
import { useToast } from "@/components/ui/ToastContext";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import type { OrderItem } from "@/types";

interface FormState {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

const initialForm: FormState = {
  fullName: "",
  phone: "",
  email: "",
  address: "",
  city: "Pilani",
  state: "Rajasthan",
  pincode: "333031",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, getProduct, clearCart } = useCart();
  const { success, error: toastError } = useToast();
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required";
    if (!form.phone.trim()) {
      errs.phone = "Phone number is required";
    } else if (!/^[0-9+ -]{7,15}$/.test(form.phone.trim())) {
      errs.phone = "Enter a valid phone number";
    }
    if (!form.email.trim()) {
      errs.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = "Enter a valid email address";
    }
    if (!form.address.trim()) errs.address = "Street address is required";
    if (!form.city.trim()) errs.city = "City is required";
    if (!form.state.trim()) errs.state = "State is required";
    if (!form.pincode.trim()) {
      errs.pincode = "Pincode is required";
    } else if (!/^[0-9]{6}$/.test(form.pincode.trim())) {
      errs.pincode = "Enter a 6-digit PIN code";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFinishOrder = async (paymentStatus: "PAID" | "PENDING", razorpayPaymentId?: string) => {
    const orderItems: OrderItem[] = items.map((item) => {
      const product = getProduct(item.productId);
      return {
        productId: item.productId,
        name: product?.name || "Herbal Product",
        quantity: item.quantity,
        price: product?.price || 0,
      };
    });

    const createdOrder = await placeOrder({
      customerName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
      items: orderItems,
      paymentStatus,
      razorpayPaymentId,
    });

    clearCart();
    try {
      localStorage.setItem("charak-last-order", JSON.stringify(createdOrder));
    } catch {
      // Ignore
    }
    success(
      paymentStatus === "PAID"
        ? `Order ${createdOrder.id} confirmed and paid via Razorpay!`
        : `Order ${createdOrder.id} placed successfully.`,
      paymentStatus === "PAID" ? "Payment Successful" : "Order Placed"
    );

    router.push(`/order-success/${createdOrder.id}`);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) {
      toastError("Please complete all required delivery fields.", "Validation");
      return;
    }
    if (items.length === 0) return;

    for (const item of items) {
      const product = getProduct(item.productId);
      if (!product) {
        toastError("An item in your cart is no longer available. Please review your cart.", "Cart Update");
        return;
      }
      if (product.active === false) {
        toastError(`"${product.name}" is currently inactive. Please remove it from your cart before checkout.`, "Item Unavailable");
        return;
      }
      if (item.quantity > product.stock) {
        toastError(`"${product.name}" only has ${product.stock} units available. Please adjust your cart quantity.`, "Stock Limit");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (paymentMethod === "razorpay") {
        const amountPaise = Math.max(100, Math.round(subtotal * 100));
        await launchRazorpayCheckout({
          amountPaise,
          currency: "INR",
          description: "Charak Ayurveda Pharmacy Dispensary Order",
          prefill: {
            name: form.fullName.trim(),
            email: form.email.trim(),
            contact: form.phone.trim(),
          },
          notes: {
            orderType: "pharmacy_cart",
            customerName: form.fullName.trim(),
          },
          onSuccess: async (_verifyResult, raw) => {
            try {
              await handleFinishOrder("PAID", raw.razorpay_payment_id);
            } catch (err) {
              const msg = err instanceof Error ? err.message : "Error saving confirmed order.";
              toastError(msg, "Order Error");
            } finally {
              setIsSubmitting(false);
            }
          },
          onError: (errMsg) => {
            setIsSubmitting(false);
            toastError(errMsg, "Payment Error");
          },
          onDismiss: () => {
            setIsSubmitting(false);
            toastError("Payment window was closed. You can retry or choose Pay on Delivery.", "Checkout Dismissed");
          },
        });
      } else {
        await handleFinishOrder("PENDING");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to place order. Please try again.";
      toastError(msg, "Checkout Error");
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mvp-section">
      <div className="wrap">
        <div className="mvp-back-link">
          <Link href="/cart">
            <ArrowLeft size={16} /> Back to Cart
          </Link>
        </div>

        <div className="mvp-page-heading">
          <span className="tag">Ayurvedic Pharmacy Dispatch</span>
          <h1>Dispatch &amp; Delivery Details</h1>
          <p>
            Complete your delivery information below. Payment processing will be settled directly via our dispatch team or cash on delivery.
          </p>
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag size={52} className="text-gold" />}
            title="Your cart is empty"
            message="Add products to your cart before proceeding to checkout."
            actionText="Browse Formulations"
            actionHref="/products"
          />
        ) : (
          <form className="mvp-checkout-layout" onSubmit={handleSubmit} noValidate>
            <div className="mvp-form-card">
              <h2>1. Delivery Address</h2>

              <div className="mvp-form-grid">
                <Input
                  label="Full Name"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="e.g. Ramesh Patel"
                  error={errors.fullName}
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  error={errors.phone}
                />

                <div className="mvp-full">
                  <Input
                    label="Email Address"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="ramesh@gmail.com"
                    error={errors.email}
                  />
                </div>

                <div className="mvp-full">
                  <Textarea
                    label="Postal Address"
                    required
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="House / Flat No., Colony or Sector, Landmark"
                    rows={2}
                    error={errors.address}
                  />
                </div>

                <Input
                  label="City"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="City"
                  error={errors.city}
                />

                <Input
                  label="State"
                  required
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  placeholder="State"
                  error={errors.state}
                />

                <Input
                  label="PIN Code"
                  required
                  maxLength={6}
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                  placeholder="333031"
                  error={errors.pincode}
                />
              </div>

              <div className="mvp-payment-section">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                  <h2 style={{ margin: 0 }}>2. Select Payment Method</h2>
                  <span style={{ fontSize: "0.8rem", color: "var(--ink-muted, #666)", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Lock size={13} style={{ color: "var(--green, #184232)" }} /> 256-Bit SSL Encrypted
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px", marginBottom: "20px" }}>
                  {/* Option 1: Razorpay Online Payment */}
                  <div
                    onClick={() => setPaymentMethod("razorpay")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setPaymentMethod("razorpay");
                    }}
                    style={{
                      border: paymentMethod === "razorpay" ? "2px solid #184232" : "1px solid #e5dfd5",
                      background: paymentMethod === "razorpay" ? "rgba(24, 66, 50, 0.04)" : "#ffffff",
                      borderRadius: "14px",
                      padding: "18px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow: paymentMethod === "razorpay" ? "0 4px 14px rgba(24, 66, 50, 0.08)" : "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(24, 66, 50, 0.1)", display: "grid", placeItems: "center" }}>
                          <CreditCard size={18} style={{ color: "#184232" }} />
                        </div>
                        <strong style={{ fontSize: "0.98rem", color: "#184232" }}>Pay Online (Razorpay)</strong>
                      </div>
                      <span style={{ fontSize: "0.7rem", background: "#c59b27", color: "#ffffff", padding: "2px 8px", borderRadius: "10px", fontWeight: 700 }}>
                        RECOMMENDED
                      </span>
                    </div>
                    <p style={{ fontSize: "0.82rem", color: "#555", margin: "0 0 10px", lineHeight: 1.45 }}>
                      Instant confirmation via UPI (Google Pay, PhonePe, Paytm), Debit/Credit Cards &amp; NetBanking.
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "#184232", fontWeight: 600 }}>
                      <ShieldCheck size={14} /> Official Razorpay Checkout
                    </div>
                  </div>

                  {/* Option 2: Pay on Delivery / Dispensary Collection */}
                  <div
                    onClick={() => setPaymentMethod("cod")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setPaymentMethod("cod");
                    }}
                    style={{
                      border: paymentMethod === "cod" ? "2px solid #184232" : "1px solid #e5dfd5",
                      background: paymentMethod === "cod" ? "rgba(24, 66, 50, 0.04)" : "#ffffff",
                      borderRadius: "14px",
                      padding: "18px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow: paymentMethod === "cod" ? "0 4px 14px rgba(24, 66, 50, 0.08)" : "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(197, 155, 39, 0.12)", display: "grid", placeItems: "center" }}>
                          <CheckCircle2 size={18} style={{ color: "#c59b27" }} />
                        </div>
                        <strong style={{ fontSize: "0.98rem", color: "#184232" }}>Pay on Delivery</strong>
                      </div>
                      <span style={{ fontSize: "0.7rem", background: "#f3f4f6", color: "#4b5563", padding: "2px 8px", borderRadius: "10px", fontWeight: 600 }}>
                        DISPENSARY
                      </span>
                    </div>
                    <p style={{ fontSize: "0.82rem", color: "#555", margin: "0 0 10px", lineHeight: 1.45 }}>
                      Pay via cash or UPI upon package dispatch / collection at our hospital pharmacy.
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "#666", fontWeight: 500 }}>
                      Pharmacy Verification on Dispatch
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="btn-payment-action"
                isLoading={isSubmitting}
                disabled={isSubmitting || items.length === 0}
                id="submit-checkout-btn"
                icon={<LockKeyhole size={18} />}
              >
                {isSubmitting
                  ? "Processing..."
                  : paymentMethod === "razorpay"
                  ? `Pay ₹${(subtotal ?? 0).toLocaleString("en-IN")} via Razorpay`
                  : "Confirm & Place Order (Pay on Delivery)"}
              </Button>
            </div>

            <aside className="mvp-summary-card">
              <h2>Order Review</h2>
              <div className="checkout-items-list">
                {items.map((item) => {
                  const product = getProduct(item.productId);
                  if (!product) return null;
                  return (
                    <div key={item.productId} className="checkout-item-row">
                      <div className="checkout-item-thumb">
                        <Image
                          src={product.image || product.images?.[0] || "/images/g3.jpg"}
                          alt={product.name}
                          width={44}
                          height={44}
                          className="thumb-img"
                        />
                      </div>
                      <div className="checkout-item-info">
                        <strong>{product.name}</strong>
                        <span>Qty: {item.quantity}</span>
                      </div>
                      <span className="checkout-item-price">
                        ₹{((product.price ?? 0) * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="summary-breakdown">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{(subtotal ?? 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="summary-row">
                  <span>Prescription Packaging</span>
                  <span className="free-badge">Included</span>
                </div>
                <div className="summary-row total-row">
                  <strong>Total Amount</strong>
                  <strong className="total-amount">
                    ₹{(subtotal ?? 0).toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>

              <div className="security-notice">
                <ShieldCheck size={16} />
                <span>Charak Ayurveda Pharmacy Quality Guaranteed</span>
              </div>
            </aside>
          </form>
        )}
      </div>
    </section>
  );
}
