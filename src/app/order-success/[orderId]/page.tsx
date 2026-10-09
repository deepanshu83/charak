import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import BrandHeader from "@/components/ui/BrandHeader";
import { getAdminSupabaseClient } from "@/lib/supabaseServer";
import type { Order } from "@/types";

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  let order: Order | null = null;

  const supabase = getAdminSupabaseClient();
  if (supabase) {
    try {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .maybeSingle();

      if (data) {
        const { data: items } = await supabase
          .from("order_items")
          .select("*, products(name)")
          .eq("order_id", orderId);

        order = {
          id: data.id,
          customerName: data.customer_name,
          phone: data.phone,
          email: data.email,
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          items: (items || []).map((i) => ({
            productId: i.product_id,
            name: (i.products as { name?: string } | null)?.name || "Herbal Formulation",
            quantity: i.quantity,
            price: Number(i.price_at_purchase),
          })),
          subtotal: Number(data.subtotal),
          total: Number(data.total),
          paymentStatus: data.payment_status as Order["paymentStatus"],
          status: data.order_status as Order["status"],
          createdAt: data.created_at,
        };
      }
    } catch (err) {
      console.warn("[OrderSuccess] Error fetching order from database:", err);
    }
  }

  return (
    <BrandHeader>
      <section className="mvp-section">
        <div className="wrap">
          <div className="mvp-success-wrapper">
            <div className="mvp-success-card">
              <div className="success-icon-wrap">
                <CheckCircle2 size={56} className="text-gold" />
              </div>

              <div className="tag-badge">
                <ShieldCheck size={14} />
                <span>Order Placed &amp; Registered</span>
              </div>

              <h1>Order Placed Successfully</h1>

              <p className="success-subtext">
                Your order has been recorded in our dispensary schedule. Payment will be completed once online payment is enabled. Our Ayurvedic pharmacy team will prepare your formulations for dispatch.
              </p>

              <div className="order-id-badge">
                <span>Order Reference ID:</span>
                <strong>{orderId}</strong>
              </div>

              {order && (
                <div className="order-summary-box">
                  <h3>Order Details</h3>
                  <div className="order-details-grid">
                    <div>
                      <span>Customer:</span>
                      <strong>{order.customerName}</strong>
                    </div>
                    <div>
                      <span>Phone:</span>
                      <strong>{order.phone}</strong>
                    </div>
                    <div>
                      <span>Delivery City:</span>
                      <strong>{order.city}, {order.state}</strong>
                    </div>
                    <div>
                      <span>Total Amount:</span>
                      <strong>₹{order.total.toLocaleString("en-IN")}</strong>
                    </div>
                  </div>

                  <div className="order-items-compact">
                    <h4>Dispensing Items ({order.items.length})</h4>
                    <ul>
                      {order.items.map((item, idx) => (
                        <li key={idx}>
                          <span>
                            {item.quantity} × {item.name}
                          </span>
                          <span>
                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="prototype-status-note">
                <Clock size={16} />
                <span>
                  Current Order Status: <strong>{order?.status || "PENDING"}</strong> &bull; Payment: <strong>{order?.paymentStatus || "PENDING"}</strong>
                </span>
              </div>

              <div className="success-actions">
                <Link href="/products" className="btn">
                  <ShoppingBag size={16} /> Continue Shopping
                </Link>
                <Link href="/" className="btn ghost">
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </BrandHeader>
  );
}
