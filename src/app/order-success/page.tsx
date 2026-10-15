"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  ShoppingBag,
  Package,
} from "lucide-react";
import BrandHeader from "@/components/ui/BrandHeader";
import { fetchOrderById } from "@/lib/orderService";
import type { Order } from "@/types";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const queryOrderId = searchParams.get("orderId");
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (queryOrderId) {
      fetchOrderById(queryOrderId).then((res) => {
        if (isMounted && res) {
          setOrder(res);
        }
      });
    }

    try {
      const stored = localStorage.getItem("charak-last-order");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!queryOrderId || parsed.id === queryOrderId) {
          setOrder(parsed);
        }
      }
    } catch {
      // Ignore
    }

    return () => {
      isMounted = false;
    };
  }, [queryOrderId]);

  return (
    <div className="order-success-page py-16">
      <div className="wrap max-w-3xl mx-auto px-4">
        <div
          className="rounded-2xl border border-[var(--border)] p-8 sm:p-12 shadow-sm text-center"
          style={{ background: "var(--cream-card)" }}
        >
          <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={36} />
          </div>

          <span className="tag">Order Successfully Recorded</span>

          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[var(--green)] mb-3">
            Thank You for Your Order
          </h1>

          <p className="text-stone-600 max-w-xl mx-auto mb-8">
            Your Ayurvedic herbal order has been placed in our dispensary preparation queue.
            Our pharmacy team will pack your formulations with authentic care.
          </p>

          {order && (
            <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-6 text-left mb-8 max-w-xl mx-auto">
              <div className="flex justify-between items-center border-b border-stone-200 pb-3 mb-4">
                <div>
                  <span className="text-xs text-stone-500 uppercase font-semibold">Reference ID</span>
                  <p className="font-mono text-sm font-bold text-[var(--green)]">{order.id}</p>
                </div>
                <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-md text-xs font-bold">
                  {order.status || "PENDING"}
                </span>
              </div>

              <div className="space-y-2 text-sm text-stone-700">
                <div className="flex justify-between">
                  <span>Customer Name:</span>
                  <strong className="text-stone-900">{order.customerName}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Address:</span>
                  <span className="text-stone-900 text-right">
                    {order.city}, {order.state} - {order.pincode}
                  </span>
                </div>
                <div className="flex justify-between border-t border-stone-200 pt-2 mt-2 font-semibold">
                  <span>Total Amount:</span>
                  <span className="text-[var(--green)] text-base">₹{(order.total ?? 0).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-amber-50/60 border border-amber-200/70 rounded-xl p-4 text-xs text-amber-900 max-w-xl mx-auto mb-8 text-left flex items-start gap-3">
            <Clock size={16} className="shrink-0 mt-0.5 text-amber-700" />
            <div>
              <strong>Payment Status: PENDING (Dispensary Verification)</strong>
              <p className="mt-0.5 text-stone-600">
                Your Ayurvedic herbal order is confirmed in our dispensary preparation queue.
                Our hospital dispatch team will verify formulation batches and confirm delivery.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/products"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--green)] text-white font-medium rounded-lg hover:bg-[#0f3023] transition-colors"
            >
              <ShoppingBag size={18} /> Continue Shopping
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-stone-300 text-stone-700 font-medium rounded-lg hover:bg-stone-50 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <BrandHeader>
      <Suspense
        fallback={
          <div className="py-24 text-center">
            <Package size={32} className="animate-spin text-emerald-800 mx-auto mb-4" />
            <p className="text-stone-600">Loading order details...</p>
          </div>
        }
      >
        <OrderSuccessContent />
      </Suspense>
    </BrandHeader>
  );
}
