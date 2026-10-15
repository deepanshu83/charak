import type { GalleryItem } from "@/types";
import type { Database } from "@/types/database.types";
import { getPublicSupabaseClient } from "./supabaseClient";

const EVENT_NAME = "charak_gallery_updated";

let runtimeGalleryCache: AdminGalleryItem[] = [];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function notifySubscribers(): void {
  if (isBrowser()) {
    window.dispatchEvent(new Event(EVENT_NAME));
  }
}

export interface AdminGalleryItem extends GalleryItem {
  published?: boolean;
}

function mapDbGalleryToGalleryItem(
  row: Database["public"]["Tables"]["gallery"]["Row"]
): AdminGalleryItem {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    caption: row.caption || row.title,
    image: row.image,
    storagePath: row.storage_path || undefined,
    fileSize: row.file_size || undefined,
    displayOrder: row.display_order,
    published: row.published,
  };
}

/**
 * Public asynchronous fetch from Supabase for published gallery items.
 */
export async function fetchGalleryItems(): Promise<GalleryItem[]> {
  try {
    const supabase = getPublicSupabaseClient();
    if (!supabase) {
      return runtimeGalleryCache.filter((g) => g.published !== false);
    }

    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .eq("published", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data) {
      return runtimeGalleryCache.filter((g) => g.published !== false);
    }

    const mapped = data.map(mapDbGalleryToGalleryItem);
    runtimeGalleryCache = mapped;
    return mapped;
  } catch {
    return runtimeGalleryCache.filter((g) => g.published !== false);
  }
}

// ----------------------------------------------------------------------------
// Admin CRUD Operations for Gallery
// ----------------------------------------------------------------------------

export async function fetchAdminGallery(): Promise<AdminGalleryItem[]> {
  if (!isBrowser()) return runtimeGalleryCache;
  try {
    const res = await fetch("/api/admin/gallery", {
      credentials: "include",
      headers: {
        "x-admin-auth": "authenticated_admin",
      },
    });
    const json = await res.json().catch(() => ({}));
    if (json.ok && Array.isArray(json.data)) {
      const mapped = json.data.map(mapDbGalleryToGalleryItem);
      runtimeGalleryCache = mapped;
      return mapped;
    }
    return [];
  } catch (err) {
    console.error("[Admin Gallery API] fetch failed:", err);
    return [];
  }
}

export async function adminCreateGallery(input: {
  title: string;
  image: string;
  category: "therapy" | "clinic" | "herbs" | string;
  caption?: string;
  storagePath?: string;
  fileSize?: number;
  displayOrder?: number;
  published?: boolean;
}): Promise<AdminGalleryItem> {
  const res = await fetch("/api/admin/gallery", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-admin-auth": "authenticated_admin",
    },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  if (!res.ok || !json.ok || !json.data) {
    throw new Error(json.error || "Failed to create gallery item in database");
  }

  const created = mapDbGalleryToGalleryItem(json.data);
  runtimeGalleryCache = [created, ...runtimeGalleryCache.filter((g) => g.id !== created.id)];
  notifySubscribers();
  return created;
}

export async function adminUpdateGallery(
  id: string,
  changes: Partial<AdminGalleryItem>
): Promise<AdminGalleryItem> {
  const res = await fetch("/api/admin/gallery", {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-admin-auth": "authenticated_admin",
    },
    body: JSON.stringify({ id, ...changes }),
  });
  const json = await res.json();
  if (!res.ok || !json.ok || !json.data) {
    throw new Error(json.error || "Failed to update gallery item in database");
  }

  const updated = mapDbGalleryToGalleryItem(json.data);
  runtimeGalleryCache = runtimeGalleryCache.map((g) => (g.id === id ? updated : g));
  notifySubscribers();
  return updated;
}

export async function adminDeleteGallery(id: string): Promise<void> {
  // First locate item to check if it has a storagePath to delete
  const item = runtimeGalleryCache.find((g) => g.id === id);
  if (item?.storagePath) {
    try {
      await fetch("/api/admin/media/delete", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-admin-auth": "authenticated_admin",
        },
        body: JSON.stringify({ storagePath: item.storagePath, bucket: "hospital-images" }),
      });
    } catch (err) {
      console.warn("[Gallery Delete] Notice deleting from storage:", err);
    }
  }

  const res = await fetch(`/api/admin/gallery?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "x-admin-auth": "authenticated_admin",
    },
  });
  const json = await res.json();
  if (!res.ok || !json.ok) {
    throw new Error(json.error || "Failed to delete gallery item in database");
  }

  runtimeGalleryCache = runtimeGalleryCache.filter((g) => g.id !== id);
  notifySubscribers();
}

// ----------------------------------------------------------------------------
// Synchronous Cache Access (Backed only by active runtime cache, no mock data)
// ----------------------------------------------------------------------------

export function getGalleryItems(): AdminGalleryItem[] {
  return runtimeGalleryCache;
}

export function subscribeGallery(callback: () => void): () => void {
  if (!isBrowser()) return () => {};
  window.addEventListener(EVENT_NAME, callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
  };
}
