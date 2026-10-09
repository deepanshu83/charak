import { NextResponse } from "next/server";
import { getAdminSupabaseClient, hasServiceRoleKey } from "@/lib/supabaseServer";
import { verifyAdminRequest } from "@/lib/adminAuthServer";
import type { Database } from "@/types/database.types";
import type { OrderStatus, PaymentStatus } from "@/types";

type OrderUpdate = Database["public"]["Tables"]["orders"]["Update"];

export async function GET(req: Request) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const supabase = getAdminSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { ok: false, error: "Database client not configured. SUPABASE_SERVICE_ROLE_KEY is required in .env.local." },
        { status: 500 }
      );
    }

    const { data: orders, error: ordersErr } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (ordersErr) {
      if (ordersErr.code === "PGRST205") {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Database table 'public.orders' is not yet present in the Supabase schema cache. Please execute supabase/schema.sql in the Supabase Dashboard SQL Editor.",
          },
          { status: 500 }
        );
      }
      return NextResponse.json({ ok: false, error: ordersErr.message }, { status: 400 });
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({ ok: true, data: [] });
    }

    const orderIds = orders.map((o) => o.id);
    const { data: items, error: itemsErr } = await supabase
      .from("order_items")
      .select("*, products(name)")
      .in("order_id", orderIds)
      .order("created_at", { ascending: true });

    if (itemsErr) {
      console.warn("[Orders API] Failed to fetch order items:", itemsErr.message);
    }

    const itemsByOrder = new Map<
      string,
      Array<{
        productId: string;
        name: string;
        quantity: number;
        price: number;
      }>
    >();

    for (const item of items || []) {
      const list = itemsByOrder.get(item.order_id) || [];
      let prodName = "Ayurvedic Product";
      if (item.products) {
        if (Array.isArray(item.products) && item.products.length > 0) {
          prodName = (item.products[0] as { name?: string })?.name || prodName;
        } else if (typeof item.products === "object") {
          prodName = (item.products as { name?: string })?.name || prodName;
        }
      }
      list.push({
        productId: item.product_id,
        name: prodName,
        quantity: item.quantity,
        price: Number(item.price_at_purchase),
      });
      itemsByOrder.set(item.order_id, list);
    }

    const unifiedOrders = orders.map((o) => ({
      id: o.id,
      customerName: o.customer_name,
      phone: o.phone,
      email: o.email,
      address: o.address,
      city: o.city,
      state: o.state,
      pincode: o.pincode,
      items: itemsByOrder.get(o.id) || [],
      subtotal: Number(o.subtotal),
      total: Number(o.total),
      paymentStatus: o.payment_status as PaymentStatus,
      status: o.order_status as OrderStatus,
      createdAt: o.created_at,
    }));

    return NextResponse.json({ ok: true, data: unifiedOrders });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    if (!hasServiceRoleKey()) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Server Configuration Error: SUPABASE_SERVICE_ROLE_KEY is required in .env.local for administrative write operations. Please configure SUPABASE_SERVICE_ROLE_KEY in .env.local.",
        },
        { status: 500 }
      );
    }

    const supabase = getAdminSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { ok: false, error: "Database client not configured" },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "Invalid JSON request body" }, { status: 400 });
    }
    const { id, orderStatus, paymentStatus } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: "Order ID is required" }, { status: 400 });
    }

    const validStatuses: OrderStatus[] = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (orderStatus !== undefined && !validStatuses.includes(orderStatus)) {
      return NextResponse.json({ ok: false, error: "Invalid order status" }, { status: 400 });
    }

    const validPaymentStatuses: PaymentStatus[] = ["PENDING", "MOCK_PAID", "PAID", "CANCELLED", "FAILED", "REFUNDED"];
    if (paymentStatus !== undefined && !validPaymentStatuses.includes(paymentStatus)) {
      return NextResponse.json({ ok: false, error: "Invalid payment status" }, { status: 400 });
    }

    const updates: OrderUpdate = {};
    if (orderStatus) updates.order_status = orderStatus;
    if (paymentStatus) updates.payment_status = paymentStatus;

    const { data, error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST205") {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Database table 'public.orders' is not yet present in the Supabase schema cache. Please execute supabase/schema.sql in the Supabase Dashboard SQL Editor.",
          },
          { status: 500 }
        );
      }
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
