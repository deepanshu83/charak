import type { PatientStory } from "@/types";
import type { Database } from "@/types/database.types";
import { getPublicSupabaseClient } from "./supabaseClient";

const EVENT_NAME = "charak_stories_updated";

let runtimeStoriesCache: AdminPatientStory[] = [];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function notifySubscribers(): void {
  if (isBrowser()) {
    window.dispatchEvent(new Event(EVENT_NAME));
  }
}

export interface AdminPatientStory extends PatientStory {
  image?: string;
  storagePath?: string;
  displayOrder?: number;
  published?: boolean;
}

function mapDbStoryToStory(
  row: Database["public"]["Tables"]["patient_stories"]["Row"]
): AdminPatientStory {
  return {
    id: row.id,
    name: row.patient_name,
    location: row.location || "Pilani",
    treatment: row.treatment,
    quote: row.story,
    rating: row.rating,
    image: row.image || undefined,
    storagePath: row.storage_path || undefined,
    displayOrder: row.display_order,
    published: row.published,
  };
}

/**
 * Public asynchronous fetch from Supabase for published patient stories.
 */
export async function fetchPatientStories(): Promise<PatientStory[]> {
  try {
    const supabase = getPublicSupabaseClient();
    if (!supabase) {
      return runtimeStoriesCache.filter((s) => s.published !== false);
    }

    const { data, error } = await supabase
      .from("patient_stories")
      .select("*")
      .eq("published", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data) {
      return runtimeStoriesCache.filter((s) => s.published !== false);
    }

    const mapped = data.map(mapDbStoryToStory);
    runtimeStoriesCache = mapped;
    return mapped;
  } catch {
    return runtimeStoriesCache.filter((s) => s.published !== false);
  }
}

// ----------------------------------------------------------------------------
// Admin CRUD Operations for Patient Stories
// ----------------------------------------------------------------------------

export async function fetchAdminStories(): Promise<AdminPatientStory[]> {
  if (!isBrowser()) return runtimeStoriesCache;
  try {
    const res = await fetch("/api/admin/patient-stories");
    const json = await res.json().catch(() => ({}));
    if (json.ok && Array.isArray(json.data)) {
      const mapped = json.data.map(mapDbStoryToStory);
      runtimeStoriesCache = mapped;
      return mapped;
    }
    return [];
  } catch (err) {
    console.error("[Admin Stories API] fetch failed:", err);
    return [];
  }
}

export async function adminCreateStory(input: {
  name: string;
  location?: string;
  treatment: string;
  rating: number;
  quote: string;
  image?: string;
  storagePath?: string;
  displayOrder?: number;
  published?: boolean;
}): Promise<AdminPatientStory> {
  const res = await fetch("/api/admin/patient-stories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  if (!res.ok || !json.ok || !json.data) {
    throw new Error(json.error || "Failed to create patient story in database");
  }

  const created = mapDbStoryToStory(json.data);
  runtimeStoriesCache = [created, ...runtimeStoriesCache.filter((s) => s.id !== created.id)];
  notifySubscribers();
  return created;
}

export async function adminUpdateStory(
  id: string,
  changes: Partial<AdminPatientStory>
): Promise<AdminPatientStory> {
  const res = await fetch("/api/admin/patient-stories", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...changes }),
  });
  const json = await res.json();
  if (!res.ok || !json.ok || !json.data) {
    throw new Error(json.error || "Failed to update patient story in database");
  }

  const updated = mapDbStoryToStory(json.data);
  runtimeStoriesCache = runtimeStoriesCache.map((s) => (s.id === id ? updated : s));
  notifySubscribers();
  return updated;
}

export async function adminDeleteStory(id: string): Promise<void> {
  const item = runtimeStoriesCache.find((s) => s.id === id);
  if (item?.storagePath) {
    try {
      await fetch("/api/admin/media/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storagePath: item.storagePath, bucket: "hospital-images" }),
      });
    } catch (err) {
      console.warn("[Story Delete] Notice deleting from storage:", err);
    }
  }

  const res = await fetch(`/api/admin/patient-stories?id=${encodeURIComponent(id)}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok || !json.ok) {
    throw new Error(json.error || "Failed to delete patient story in database");
  }

  runtimeStoriesCache = runtimeStoriesCache.filter((s) => s.id !== id);
  notifySubscribers();
}

// ----------------------------------------------------------------------------
// Synchronous Cache Access (Backed only by active runtime cache, no mock data)
// ----------------------------------------------------------------------------

export function getPatientStories(): AdminPatientStory[] {
  return runtimeStoriesCache;
}

export function subscribeStories(callback: () => void): () => void {
  if (!isBrowser()) return () => {};
  window.addEventListener(EVENT_NAME, callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
  };
}
