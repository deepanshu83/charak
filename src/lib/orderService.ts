import type { CreateOrderInput, Order, OrderStatus, PaymentStatus } from "@/types";

const EVENT_NAME = "charak_orders_updated";

let runtimeOrdersCache: Order[] = [];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function notifySubscribers(): void {
  if (isBrowser()) {
    window.dispatchEvent(new Event(EVENT_NAME));
  }
}

// ----------------------------------------------------------------------------
// Client -> Server Order Creation (Database Driven)
// ----------------------------------------------------------------------------

export async function placeOrder(input: CreateOrderInput): Promise<Order> {
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customerName: input.customerName,
      phone: input.phone,
      email: input.email,
      address: input.address,
      city: input.city,
      state: input.state,
      pincode: input.pincode,
      items: input.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
    }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.ok || !json.data) {
    throw new Error(json.error || "Failed to place order. Please try again.");
  }

  const created = json.data as Order;
  runtimeOrdersCache = [created, ...runtimeOrdersCache.filter((o) => o.id !== created.id)];
  notifySubscribers();

  return created;
}

export async function fetchOrderById(id: string): Promise<Order | null> {
  if (isBrowser()) {
    try {
      const res = await fetch(`/api/orders?id=${encodeURIComponent(id)}`);
      const json = await res.json().catch(() => ({}));
      if (json.ok && json.data) {
        return json.data as Order;
      }
    } catch (err) {
      console.warn("[Orders] fetchOrderById failed:", err);
    }
  }

  return runtimeOrdersCache.find((o) => o.id === id) || null;
}

// ----------------------------------------------------------------------------
// Admin Operations
// ----------------------------------------------------------------------------

export async function fetchAdminOrders(): Promise<Order[]> {
  if (!isBrowser()) return runtimeOrdersCache;
  try {
    const res = await fetch("/api/admin/orders");
    const json = await res.json().catch(() => ({}));
    if (json.ok && Array.isArray(json.data)) {
      runtimeOrdersCache = json.data;
      return json.data;
    }
    return [];
  } catch (err) {
    console.error("[Admin Orders API] fetch failed:", err);
    return [];
  }
}

export async function adminUpdateOrderStatus(
  id: string,
  orderStatus: OrderStatus,
  paymentStatus?: PaymentStatus
): Promise<Order> {
  const res = await fetch("/api/admin/orders", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, orderStatus, paymentStatus }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.ok) {
    throw new Error(json.error || "Failed to update order status in database");
  }

  runtimeOrdersCache = runtimeOrdersCache.map((o) =>
    o.id === id
      ? { ...o, status: orderStatus, paymentStatus: paymentStatus || o.paymentStatus }
      : o
  );
  notifySubscribers();

  const found = runtimeOrdersCache.find((o) => o.id === id);
  if (found) return found;

  return {
    id,
    customerName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    items: [],
    subtotal: 0,
    total: 0,
    paymentStatus: paymentStatus || "PENDING",
    status: orderStatus,
    createdAt: new Date().toISOString(),
  };
}

// ----------------------------------------------------------------------------
// Synchronous Cache Access (Backed only by active database results, no mock data)
// ----------------------------------------------------------------------------

export function getOrders(): Order[] {
  return runtimeOrdersCache;
}

export function getOrderById(id: string): Order | undefined {
  return runtimeOrdersCache.find((order) => order.id === id);
}

export function subscribeOrders(callback: () => void): () => void {
  if (!isBrowser()) return () => {};
  window.addEventListener(EVENT_NAME, callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
  };
}
