import type { VideoTestimonial } from "@/types";
import type { Database } from "@/types/database.types";
import { getPublicSupabaseClient } from "./supabaseClient";

const EVENT_NAME = "charak_video_testimonials_updated";

let runtimeVideoCache: VideoTestimonial[] = [];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function notifySubscribers(): void {
  if (isBrowser()) {
    window.dispatchEvent(new Event(EVENT_NAME));
  }
}

function mapDbRowToVideoTestimonial(
  row: Database["public"]["Tables"]["video_testimonials"]["Row"]
): VideoTestimonial {
  return {
    id: row.id,
    title: row.title,
    patientName: row.patient_name,
    description: row.description || "",
    videoUrl: row.video_url,
    storagePath: row.storage_path || undefined,
    thumbnailUrl: row.thumbnail_url || undefined,
    thumbnailStoragePath: row.thumbnail_storage_path || undefined,
    fileSize: row.file_size || undefined,
    duration: row.duration || undefined,
    published: row.published,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Public asynchronous fetch from Supabase for published video testimonials.
 */
export async function fetchVideoTestimonials(): Promise<VideoTestimonial[]> {
  try {
    const supabase = getPublicSupabaseClient();
    if (!supabase) {
      return runtimeVideoCache.filter((v) => v.published);
    }

    const { data, error } = await supabase
      .from("video_testimonials")
      .select("*")
      .eq("published", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data) {
      return runtimeVideoCache.filter((v) => v.published);
    }

    const mapped = data.map(mapDbRowToVideoTestimonial);
    runtimeVideoCache = mapped;
    return mapped;
  } catch {
    return runtimeVideoCache.filter((v) => v.published);
  }
}

/**
 * Admin fetch of all video testimonials (both published and unpublished).
 */
export async function fetchAdminVideoTestimonials(): Promise<VideoTestimonial[]> {
  if (!isBrowser()) return runtimeVideoCache;
  try {
    const res = await fetch("/api/admin/video-testimonials", {
      credentials: "include",
      headers: {
        "x-admin-auth": "authenticated_admin",
      },
    });
    const json = await res.json().catch(() => ({}));
    if (json.ok && Array.isArray(json.data)) {
      const mapped = json.data.map(mapDbRowToVideoTestimonial);
      runtimeVideoCache = mapped;
      return mapped;
    }
    return [];
  } catch (err) {
    console.error("[Admin Video Testimonials API] fetch failed:", err);
    return [];
  }
}

export async function adminCreateVideoTestimonial(input: {
  title: string;
  patientName: string;
  description?: string;
  videoUrl: string;
  storagePath?: string;
  thumbnailUrl?: string;
  thumbnailStoragePath?: string;
  fileSize?: number;
  duration?: number;
  published?: boolean;
  displayOrder?: number;
}): Promise<VideoTestimonial> {
  const res = await fetch("/api/admin/video-testimonials", {
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
    throw new Error(json.error || "Failed to create video testimonial in database");
  }

  const created = mapDbRowToVideoTestimonial(json.data);
  runtimeVideoCache = [created, ...runtimeVideoCache.filter((v) => v.id !== created.id)];
  notifySubscribers();
  return created;
}

export async function adminUpdateVideoTestimonial(
  id: string,
  changes: Partial<VideoTestimonial>
): Promise<VideoTestimonial> {
  const res = await fetch("/api/admin/video-testimonials", {
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
    throw new Error(json.error || "Failed to update video testimonial in database");
  }

  const updated = mapDbRowToVideoTestimonial(json.data);
  runtimeVideoCache = runtimeVideoCache.map((v) => (v.id === id ? updated : v));
  notifySubscribers();
  return updated;
}

export async function adminDeleteVideoTestimonial(id: string): Promise<void> {
  // First find the item to see if it has storage objects to delete
  const item = runtimeVideoCache.find((v) => v.id === id);

  if (item?.storagePath) {
    try {
      await fetch("/api/admin/media/delete", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-admin-auth": "authenticated_admin",
        },
        body: JSON.stringify({ storagePath: item.storagePath, bucket: "hospital-videos" }),
      });
    } catch (err) {
      console.warn("[Video Delete] Notice deleting video file from storage:", err);
    }
  }

  if (item?.thumbnailStoragePath) {
    try {
      await fetch("/api/admin/media/delete", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-admin-auth": "authenticated_admin",
        },
        body: JSON.stringify({ storagePath: item.thumbnailStoragePath, bucket: "hospital-images" }),
      });
    } catch (err) {
      console.warn("[Video Delete] Notice deleting thumbnail from storage:", err);
    }
  }

  const res = await fetch(`/api/admin/video-testimonials?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "x-admin-auth": "authenticated_admin",
    },
  });
  const json = await res.json();
  if (!res.ok || !json.ok) {
    throw new Error(json.error || "Failed to delete video testimonial in database");
  }

  runtimeVideoCache = runtimeVideoCache.filter((v) => v.id !== id);
  notifySubscribers();
}

export function getVideoTestimonials(): VideoTestimonial[] {
  return runtimeVideoCache;
}

export function subscribeVideoTestimonials(callback: () => void): () => void {
  if (!isBrowser()) return () => {};
  window.addEventListener(EVENT_NAME, callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
  };
}
