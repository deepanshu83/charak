import type { Product, ProductCategory } from "@/types";
import type { Database } from "@/types/database.types";
import { getPublicSupabaseClient } from "./supabaseClient";

const EVENT_NAME = "charak_products_updated";

// In-memory runtime cache of products loaded from Supabase (starts empty, never mock data)
let runtimeProductsCache: Product[] = [];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function notifySubscribers(): void {
  if (isBrowser()) {
    window.dispatchEvent(new Event(EVENT_NAME));
  }
}

function mapDbProductToProduct(
  row: Database["public"]["Tables"]["products"]["Row"] & {
    product_images?: Database["public"]["Tables"]["product_images"]["Row"][];
  }
): Product {
  const pImages = (row.product_images || []).sort(
    (a, b) => a.display_order - b.display_order
  );
  const images =
    pImages.length > 0
      ? pImages.map((pi) => pi.image_url)
      : row.images && Array.isArray(row.images) && row.images.length > 0
      ? row.images
      : row.image
      ? [row.image]
      : [];

  const storagePaths =
    pImages.length > 0
      ? pImages.map((pi) => pi.storage_path)
      : row.storage_paths || [];

  const primaryImg = images[0] || row.image || "";

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    shortDescription: row.short_description || "",
    price: Number(row.price),
    image: primaryImg,
    images,
    storagePaths,
    productImages: pImages.map((pi) => ({
      id: pi.id,
      productId: pi.product_id,
      storagePath: pi.storage_path,
      imageUrl: pi.image_url,
      fileName: pi.file_name,
      fileSize: pi.file_size,
      mimeType: pi.mime_type,
      displayOrder: pi.display_order,
      createdAt: pi.created_at,
    })),
    category: row.category as ProductCategory,
    stock: row.stock,
    active: row.active,
  };
}

/**
 * Public asynchronous fetch from Supabase.
 * Returns actual database products. If database is empty or fails, returns [] (never mock data).
 */
export async function fetchProducts(): Promise<Product[]> {
  try {
    const supabase = getPublicSupabaseClient();
    if (!supabase) {
      console.warn("[Supabase] Client not initialized.");
      return runtimeProductsCache;
    }

    const { data, error } = await supabase
      .from("products")
      .select("*, product_images(*)")
      .eq("active", true)
      .order("created_at", { ascending: true });

    if (error) {
      if (error.code === "PGRST205") {
        console.warn(
          `[Supabase Notice] Table 'public.products' is not yet present in the database schema cache. ` +
          `Execute supabase/schema.sql in the Supabase Dashboard SQL Editor to initialize tables.`
        );
      } else {
        console.warn(`[Supabase Notice] Products query: ${error.message} (code: ${error.code})`);
      }
      return runtimeProductsCache;
    }

    if (!data) {
      return [];
    }

    const mapped = data.map((item) =>
      mapDbProductToProduct(item as Parameters<typeof mapDbProductToProduct>[0])
    );
    runtimeProductsCache = mapped;
    return mapped;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[Supabase Notice] Failed to fetch products: ${msg}`);
    return runtimeProductsCache;
  }
}

/**
 * Public asynchronous fetch for a single product by slug from Supabase.
 * Returns null if not found (never falls back to mock data).
 */
export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = getPublicSupabaseClient();
    if (!supabase) {
      return runtimeProductsCache.find((p) => p.slug === slug) || null;
    }

    const { data, error } = await supabase
      .from("products")
      .select("*, product_images(*)")
      .eq("slug", slug)
      .eq("active", true)
      .maybeSingle();

    if (error) {
      if (error.code !== "PGRST205") {
        console.warn(`[Supabase Notice] Product by slug '${slug}': ${error.message} (code: ${error.code})`);
      }
      return null;
    }

    if (!data) {
      return null;
    }

    return mapDbProductToProduct(data as Parameters<typeof mapDbProductToProduct>[0]);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[Supabase Notice] Failed to fetch product slug '${slug}': ${msg}`);
    return null;
  }
}

/**
 * Public asynchronous fetch for a single product by id from Supabase.
 */
export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const supabase = getPublicSupabaseClient();
    if (!supabase) {
      return runtimeProductsCache.find((p) => p.id === id) || null;
    }

    const { data, error } = await supabase
      .from("products")
      .select("*, product_images(*)")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapDbProductToProduct(data as Parameters<typeof mapDbProductToProduct>[0]);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[Supabase Notice] Failed to fetch product ID '${id}': ${msg}`);
    return null;
  }
}

// ----------------------------------------------------------------------------
// Admin Asynchronous CRUD (Calls /api/admin/products and syncs runtime cache)
// ----------------------------------------------------------------------------

export async function fetchAdminProducts(): Promise<Product[]> {
  if (!isBrowser()) return runtimeProductsCache;
  try {
    const res = await fetch("/api/admin/products", {
      credentials: "include",
      headers: {
        "x-admin-auth": "authenticated_admin",
      },
    });
    const json = await res.json().catch(() => ({}));
    if (json.ok && Array.isArray(json.data)) {
      const mapped = json.data.map(mapDbProductToProduct);
      runtimeProductsCache = mapped;
      return mapped;
    }
    return [];
  } catch (err) {
    console.error("[Admin Products API] fetch failed:", err);
    return [];
  }
}

export async function adminCreateProduct(product: Omit<Product, "id">): Promise<Product> {
  const res = await fetch("/api/admin/products", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-admin-auth": "authenticated_admin",
    },
    body: JSON.stringify(product),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.ok || !json?.data) {
    throw new Error(json?.error || `Failed to create product in database (HTTP ${res.status})`);
  }

  const created = mapDbProductToProduct(json.data);
  runtimeProductsCache = [created, ...runtimeProductsCache.filter((p) => p.id !== created.id)];
  notifySubscribers();
  return created;
}

export async function adminUpdateProduct(id: string, changes: Partial<Product>): Promise<Product> {
  const res = await fetch("/api/admin/products", {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-admin-auth": "authenticated_admin",
    },
    body: JSON.stringify({ id, ...changes }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.ok || !json?.data) {
    throw new Error(json?.error || `Failed to update product in database (HTTP ${res.status})`);
  }

  const updated = mapDbProductToProduct(json.data);
  runtimeProductsCache = runtimeProductsCache.map((p) => (p.id === id ? updated : p));
  notifySubscribers();
  return updated;
}

export async function adminDeleteProduct(id: string): Promise<void> {
  const res = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "x-admin-auth": "authenticated_admin",
    },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.ok) {
    throw new Error(json?.error || `Failed to delete product in database (HTTP ${res.status})`);
  }

  runtimeProductsCache = runtimeProductsCache.filter((p) => p.id !== id);
  notifySubscribers();
}

// ----------------------------------------------------------------------------
// Synchronous Cache Access (Backed only by active runtime cache, no mock data)
// ----------------------------------------------------------------------------

export function getProducts(): Product[] {
  return runtimeProductsCache;
}

export function getProductBySlug(slug: string): Product | undefined {
  return runtimeProductsCache.find((product) => product.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return runtimeProductsCache.find((product) => product.id === id);
}

export function subscribeProducts(callback: () => void): () => void {
  if (!isBrowser()) return () => {};
  window.addEventListener(EVENT_NAME, callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
  };
}
