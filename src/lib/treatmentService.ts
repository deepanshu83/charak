import type { Treatment } from "@/types";
import type { Database } from "@/types/database.types";
import { getPublicSupabaseClient } from "./supabaseClient";

const EVENT_NAME = "charak_treatments_updated";

let runtimeTreatmentsCache: AdminTreatment[] = [];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function notifySubscribers(): void {
  if (isBrowser()) {
    window.dispatchEvent(new Event(EVENT_NAME));
  }
}

export interface AdminTreatment extends Treatment {
  slug?: string;
  shortDescription?: string;
  image?: string;
  storagePath?: string;
  active?: boolean;
}

function mapDbTreatmentToTreatment(
  row: Database["public"]["Tables"]["treatments"]["Row"]
): AdminTreatment {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    shortDescription: row.short_description || "",
    description: row.description,
    duration: row.duration,
    price: Number(row.price),
    image: row.image || "",
    storagePath: row.storage_path || undefined,
    icon: "Sparkles",
    active: row.active,
  };
}

/**
 * Public asynchronous fetch from Supabase for active treatments.
 */
export async function fetchTreatments(): Promise<Treatment[]> {
  try {
    const supabase = getPublicSupabaseClient();
    if (!supabase) {
      return runtimeTreatmentsCache;
    }

    const { data, error } = await supabase
      .from("treatments")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: true });

    if (error || !data) {
      return runtimeTreatmentsCache;
    }

    const mapped = data.map(mapDbTreatmentToTreatment);
    runtimeTreatmentsCache = mapped;
    return mapped;
  } catch {
    return runtimeTreatmentsCache;
  }
}

export async function fetchTreatmentBySlug(slug: string): Promise<Treatment | null> {
  try {
    const supabase = getPublicSupabaseClient();
    if (!supabase) {
      return runtimeTreatmentsCache.find((t) => t.slug === slug || t.id === slug) || null;
    }

    const { data, error } = await supabase
      .from("treatments")
      .select("*")
      .eq("slug", slug)
      .eq("active", true)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapDbTreatmentToTreatment(data);
  } catch {
    return null;
  }
}

export async function fetchTreatmentById(id: string): Promise<Treatment | null> {
  try {
    const supabase = getPublicSupabaseClient();
    if (!supabase) {
      return runtimeTreatmentsCache.find((t) => t.id === id) || null;
    }

    const { data, error } = await supabase
      .from("treatments")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapDbTreatmentToTreatment(data);
  } catch {
    return null;
  }
}

// ----------------------------------------------------------------------------
// Admin CRUD Operations for Treatments
// ----------------------------------------------------------------------------

export async function fetchAdminTreatments(): Promise<AdminTreatment[]> {
  if (!isBrowser()) return runtimeTreatmentsCache;
  try {
    const res = await fetch("/api/admin/treatments");
    const json = await res.json().catch(() => ({}));
    if (json.ok && Array.isArray(json.data)) {
      const mapped = json.data.map(mapDbTreatmentToTreatment);
      runtimeTreatmentsCache = mapped;
      return mapped;
    }
    return [];
  } catch (err) {
    console.error("[Admin Treatments API] fetch failed:", err);
    return [];
  }
}

export async function adminCreateTreatment(input: {
  name: string;
  slug?: string;
  shortDescription?: string;
  description: string;
  duration: string;
  price: number;
  image?: string;
  storagePath?: string;
  active?: boolean;
}): Promise<AdminTreatment> {
  const res = await fetch("/api/admin/treatments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  if (!res.ok || !json.ok || !json.data) {
    throw new Error(json.error || "Failed to create treatment in database");
  }

  const created = mapDbTreatmentToTreatment(json.data);
  runtimeTreatmentsCache = [created, ...runtimeTreatmentsCache.filter((t) => t.id !== created.id)];
  notifySubscribers();
  return created;
}

export async function adminUpdateTreatment(
  id: string,
  changes: Partial<AdminTreatment>
): Promise<AdminTreatment> {
  const res = await fetch("/api/admin/treatments", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...changes }),
  });
  const json = await res.json();
  if (!res.ok || !json.ok || !json.data) {
    throw new Error(json.error || "Failed to update treatment in database");
  }

  const updated = mapDbTreatmentToTreatment(json.data);
  runtimeTreatmentsCache = runtimeTreatmentsCache.map((t) => (t.id === id ? updated : t));
  notifySubscribers();
  return updated;
}

export async function adminDeleteTreatment(id: string): Promise<void> {
  const res = await fetch(`/api/admin/treatments?id=${encodeURIComponent(id)}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok || !json.ok) {
    throw new Error(json.error || "Failed to delete treatment in database");
  }

  runtimeTreatmentsCache = runtimeTreatmentsCache.filter((t) => t.id !== id);
  notifySubscribers();
}

// ----------------------------------------------------------------------------
// Synchronous Cache Access (Backed only by active runtime cache, no mock data)
// ----------------------------------------------------------------------------

export function getTreatments(): AdminTreatment[] {
  return runtimeTreatmentsCache;
}

export function getTreatmentById(id: string): AdminTreatment | undefined {
  return runtimeTreatmentsCache.find((treatment) => treatment.id === id);
}

export function subscribeTreatments(callback: () => void): () => void {
  if (!isBrowser()) return () => {};
  window.addEventListener(EVENT_NAME, callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
  };
}
