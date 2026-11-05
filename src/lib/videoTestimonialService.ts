import type { VideoTestimonial } from "@/types";
import type { Database } from "@/types/database.types";
import { getPublicSupabaseClient } from "./supabaseClient";

const EVENT_NAME = "charak_video_testimonials_updated";

export const DEFAULT_VIDEO_TESTIMONIALS: VideoTestimonial[] = [
  {
    id: "vid-panchakarma-1",
    title: "14-Day Janu Basti & Knee Joint Recovery",
    patientName: "Kamla Devi, 62 yrs (Pilani)",
    description: "Complete relief from severe chronic knee osteoarthritis, swelling, and morning stiffness through authentic Janu Basti and classical Panchakarma therapies.",
    videoUrl: "https://www.youtube.com/watch?v=M7lc1UVf-VE",
    thumbnailUrl: "https://img.youtube.com/vi/M7lc1UVf-VE/mqdefault.jpg",
    published: true,
    displayOrder: 1,
    createdAt: "2026-03-01T10:00:00Z",
    updatedAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "vid-skin-psoriasis-2",
    title: "Chronic Skin Psoriasis Clearance Journey",
    patientName: "Rajesh Sharma, 41 yrs (Jhunjhunu)",
    description: "Remarkable clearance of persistent plaques and chronic skin itching via classical Vamana, Virechana detox and specialized herbal Lepam therapies.",
    videoUrl: "https://www.youtube.com/watch?v=LXb3EKWsInQ",
    thumbnailUrl: "https://img.youtube.com/vi/LXb3EKWsInQ/mqdefault.jpg",
    published: true,
    displayOrder: 2,
    createdAt: "2026-03-05T10:00:00Z",
    updatedAt: "2026-03-05T10:00:00Z",
  },
  {
    id: "vid-infertility-uttarbasti-3",
    title: "Holistic Infertility & Uttar Basti Success Story",
    patientName: "Priya & Vikram Singh (Churu)",
    description: "Natural conception achieved after 5 years of struggle through individualized Nadi Pariksha, Uttar Basti therapies, and holistic Ayurvedic Rasayana roadmap.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
    published: true,
    displayOrder: 3,
    createdAt: "2026-03-10T10:00:00Z",
    updatedAt: "2026-03-10T10:00:00Z",
  },
];

let runtimeVideoCache: VideoTestimonial[] = DEFAULT_VIDEO_TESTIMONIALS;

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

    if (error || !data || data.length === 0) {
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
