import { NextResponse } from "next/server";
import { getAdminSupabaseClient } from "@/lib/supabaseServer";
import type { Database } from "@/types/database.types";

type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];
type OrderItemInsert = Database["public"]["Tables"]["order_items"]["Insert"];

function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

// Maps legacy demo string IDs to standard database UUIDs if passed by legacy client state
const PRODUCT_ID_MAP: Record<string, string> = {
  "prod-1": "e0000000-0000-4000-a000-000000000001",
  "prod-2": "e0000000-0000-4000-a000-000000000002",
  "prod-3": "e0000000-0000-4000-a000-000000000003",
  "prod-4": "e0000000-0000-4000-a000-000000000004",
  "prod-5": "e0000000-0000-4000-a000-000000000005",
  "prod-6": "e0000000-0000-4000-a000-000000000006",
  "prod-7": "e0000000-0000-4000-a000-000000000007",
  "prod-8": "e0000000-0000-4000-a000-000000000008",
};

interface IncomingOrderItem {
  productId: string;
  quantity: number;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      customerName,
      phone,
      email,
      address,
      city,
      state,
      pincode,
      items,
    } = body;

    // 1. CUSTOMER INPUT VALIDATION
    if (!customerName || typeof customerName !== "string" || !customerName.trim()) {
      return NextResponse.json(
        { ok: false, error: "Full customer name is required.", code: "NAME_REQUIRED" },
        { status: 400 }
      );
    }
    const cleanName = customerName.trim();
    if (cleanName.length < 2 || cleanName.length > 100) {
      return NextResponse.json(
        { ok: false, error: "Customer name must be between 2 and 100 characters.", code: "INVALID_NAME" },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== "string" || !phone.trim()) {
      return NextResponse.json(
        { ok: false, error: "Phone number is required.", code: "PHONE_REQUIRED" },
        { status: 400 }
      );
    }
    const cleanPhone = phone.trim();
    if (!/^[0-9+\s\-()]{7,20}$/.test(cleanPhone)) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid phone number (7 to 15 digits).", code: "INVALID_PHONE" },
        { status: 400 }
      );
    }

    let cleanEmail: string | null = null;
    if (email && typeof email === "string" && email.trim()) {
      cleanEmail = email.trim();
      if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
        return NextResponse.json(
          { ok: false, error: "Please enter a valid email address.", code: "INVALID_EMAIL" },
          { status: 400 }
        );
      }
    }

    if (!address || typeof address !== "string" || !address.trim() || address.trim().length < 3) {
      return NextResponse.json(
        { ok: false, error: "Street delivery address is required.", code: "ADDRESS_REQUIRED" },
        { status: 400 }
      );
    }
    const cleanAddress = address.trim();

    if (!city || typeof city !== "string" || !city.trim()) {
      return NextResponse.json(
        { ok: false, error: "City is required.", code: "CITY_REQUIRED" },
        { status: 400 }
      );
    }
    const cleanCity = city.trim();

    if (!state || typeof state !== "string" || !state.trim()) {
      return NextResponse.json(
        { ok: false, error: "State is required.", code: "STATE_REQUIRED" },
        { status: 400 }
      );
    }
    const cleanState = state.trim();

    if (!pincode || typeof pincode !== "string" || !/^\d{6}$/.test(pincode.trim())) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid 6-digit postal PIN code.", code: "PINCODE_REQUIRED" },
        { status: 400 }
      );
    }
    const cleanPincode = pincode.trim();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Order must contain at least one item.", code: "ITEMS_REQUIRED" },
        { status: 400 }
      );
    }

    // 2. SERVER-SIDE DATABASE VERIFICATION
    const supabase = getAdminSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { ok: false, error: "Database service unavailable. Please try again later.", code: "DB_UNAVAILABLE" },
        { status: 503 }
      );
    }

    const verifiedOrderItems: Array<{
      productId: string;
      dbProductId: string;
      name: string;
      quantity: number;
      price: number;
    }> = [];

    let calculatedSubtotal = 0;

    for (const rawItem of items as IncomingOrderItem[]) {
      if (!rawItem.productId || typeof rawItem.productId !== "string") {
        return NextResponse.json(
          { ok: false, error: "Invalid product specified.", code: "INVALID_PRODUCT" },
          { status: 400 }
        );
      }
      const rawProductId = rawItem.productId.trim();
      const quantity = Math.floor(Number(rawItem.quantity));

      if (isNaN(quantity) || quantity <= 0) {
        return NextResponse.json(
          { ok: false, error: "Item quantity must be a positive integer.", code: "INVALID_QUANTITY" },
          { status: 400 }
        );
      }

      const productUuid = isUUID(rawProductId) ? rawProductId : (PRODUCT_ID_MAP[rawProductId] || null);

      if (!productUuid) {
        return NextResponse.json(
          { ok: false, error: `Invalid product identifier: ${rawProductId}`, code: "INVALID_PRODUCT_ID" },
          { status: 400 }
        );
      }

      // Query database for authoritative price, stock, and active status
      const { data: dbProduct, error: prodErr } = await supabase
        .from("products")
        .select("id, name, price, stock, active")
        .eq("id", productUuid)
        .maybeSingle();

      if (prodErr || !dbProduct) {
        return NextResponse.json(
          { ok: false, error: `Product not found in hospital inventory (${rawProductId}).`, code: "PRODUCT_NOT_FOUND" },
          { status: 404 }
        );
      }

      if (!dbProduct.active) {
        return NextResponse.json(
          {
            ok: false,
            error: `The herbal formulation "${dbProduct.name}" is currently inactive and unavailable for purchase.`,
            code: "PRODUCT_INACTIVE",
          },
          { status: 400 }
        );
      }

      if (dbProduct.stock < quantity) {
        return NextResponse.json(
          {
            ok: false,
            error: `Insufficient stock for "${dbProduct.name}". Only ${dbProduct.stock} unit(s) available in dispensary.`,
            code: "INSUFFICIENT_STOCK",
            availableStock: dbProduct.stock,
          },
          { status: 409 }
        );
      }

      const itemPrice = Number(dbProduct.price);
      calculatedSubtotal += itemPrice * quantity;

      verifiedOrderItems.push({
        productId: rawProductId,
        dbProductId: dbProduct.id,
        name: dbProduct.name,
        quantity,
        price: itemPrice,
      });
    }

    const calculatedTotal = calculatedSubtotal;

    // 3. PERSIST ORDER RECORD TO SUPABASE
    const orderRow: OrderInsert = {
      customer_name: cleanName,
      phone: cleanPhone,
      email: cleanEmail || "guest@charak.in",
      address: cleanAddress,
      city: cleanCity,
      state: cleanState,
      pincode: cleanPincode,
      subtotal: calculatedSubtotal,
      total: calculatedTotal,
      payment_status: "PENDING",
      order_status: "PENDING",
    };

    const { data: createdOrder, error: orderErr } = await supabase
      .from("orders")
      .insert(orderRow)
      .select()
      .single();

    if (orderErr || !createdOrder) {
      return NextResponse.json(
        {
          ok: false,
          error: `Failed to create order: ${orderErr?.message || "Database insert error"}`,
          code: "ORDER_CREATION_FAILED",
        },
        { status: 500 }
      );
    }

    // 4. INSERT ORDER ITEMS
    const itemRows: OrderItemInsert[] = verifiedOrderItems.map((i) => ({
      order_id: createdOrder.id,
      product_id: i.dbProductId,
      quantity: i.quantity,
      price_at_purchase: i.price,
    }));

    const { error: itemsErr } = await supabase
      .from("order_items")
      .insert(itemRows);

    if (itemsErr) {
      console.error("[Orders API] Error inserting order items:", itemsErr.message);
    }

    // 5. ATOMIC STOCK DEDUCTION IN SUPABASE
    for (const item of verifiedOrderItems) {
      try {
        const { data: currentP } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.dbProductId)
          .single();

        if (currentP) {
          const newStock = Math.max(0, currentP.stock - item.quantity);
          await supabase
            .from("products")
            .update({ stock: newStock })
            .eq("id", item.dbProductId);
        }
      } catch (stockErr) {
        console.warn("[Orders API] Stock decrement exception:", stockErr);
      }
    }

    return NextResponse.json(
      {
        ok: true,
        data: {
          id: createdOrder.id,
          customerName: cleanName,
          phone: cleanPhone,
          email: cleanEmail,
          address: cleanAddress,
          city: cleanCity,
          state: cleanState,
          pincode: cleanPincode,
          items: verifiedOrderItems.map((i) => ({
            productId: i.productId,
            name: i.name,
            quantity: i.quantity,
            price: i.price,
          })),
          subtotal: calculatedSubtotal,
          total: calculatedTotal,
          paymentStatus: "PENDING",
          status: "PENDING",
          createdAt: createdOrder.created_at,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Order ID is required." },
        { status: 400 }
      );
    }

    const supabase = getAdminSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { ok: false, error: "Database client not configured." },
        { status: 500 }
      );
    }

    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !order) {
      return NextResponse.json(
        { ok: false, error: "Order not found in database." },
        { status: 404 }
      );
    }

    const { data: items } = await supabase
      .from("order_items")
      .select("*, products(name)")
      .eq("order_id", id);

    const formattedItems = (items || []).map((i) => {
      let prodName = "Ayurvedic Product";
      if (i.products) {
        if (Array.isArray(i.products) && i.products.length > 0) {
          prodName = (i.products[0] as { name?: string })?.name || prodName;
        } else if (typeof i.products === "object") {
          prodName = (i.products as { name?: string })?.name || prodName;
        }
      }
      return {
        productId: i.product_id,
        name: prodName,
        quantity: i.quantity,
        price: Number(i.price_at_purchase),
      };
    });

    return NextResponse.json({
      ok: true,
      data: {
        id: order.id,
        customerName: order.customer_name,
        phone: order.phone,
        email: order.email,
        address: order.address,
        city: order.city,
        state: order.state,
        pincode: order.pincode,
        items: formattedItems,
        subtotal: Number(order.subtotal),
        total: Number(order.total),
        paymentStatus: order.payment_status,
        status: order.order_status,
        createdAt: order.created_at,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
