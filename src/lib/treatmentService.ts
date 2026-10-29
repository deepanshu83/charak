import type { Treatment } from "@/types";
import type { Database } from "@/types/database.types";
import { getPublicSupabaseClient } from "./supabaseClient";

const EVENT_NAME = "charak_treatments_updated";

export const DEFAULT_TREATMENTS: AdminTreatment[] = [
  {
    id: "70000000-0000-4000-a000-000000000001",
    name: "Therapies & Panchakarma",
    slug: "therapies-panchakarma",
    shortDescription: "Panchakarma & Ayurvedic retreat (5 day / 7 day)",
    description: "Classical Panchakarma detoxification and intensive 5-day / 7-day Ayurvedic residential retreats to cleanse accumulated Ama, rejuvenate tissues, and restore lifelong vitality.",
    duration: "60–90 min",
    price: 500,
    image: "/images/panchkaram.jpeg",
    icon: "Sparkles",
    active: true,
  },
  {
    id: "70000000-0000-4000-a000-000000000002",
    name: "Body Pain & Spine Care",
    slug: "body-pain-spine-care",
    shortDescription: "Back pain, Sciatica, Knee pain, Cervical spondylitis & Slip disc",
    description: "Targeted Ayurvedic treatments for back pain, sciatica, knee pain, neck & shoulder pain, cervical spondylitis, slip disc, frozen shoulder, and joint arthritis using authentic Basti and herbal oils.",
    duration: "45 min",
    price: 500,
    image: "/images/joint.png",
    icon: "Sparkles",
    active: true,
  },
  {
    id: "70000000-0000-4000-a000-000000000003",
    name: "Skin & Hair Care",
    slug: "skin-hair-care",
    shortDescription: "Psoriasis, Eczema, Skin allergy, Acne, Hair fall & Vitiligo",
    description: "Root-cause Ayurvedic healing for psoriasis, eczema, skin allergies, acne & scars, fungal infections, hair fall, dandruff, and vitiligo via internal blood purification and herbal Lepa.",
    duration: "45 min",
    price: 500,
    image: "/images/skincare.jpeg",
    icon: "Sparkles",
    active: true,
  },
  {
    id: "70000000-0000-4000-a000-000000000004",
    name: "Women's Health & Fertility",
    slug: "womens-health-fertility",
    shortDescription: "PCOS, PCOD, Irregular & Painful periods, Infertility, Tubal block",
    description: "Holistic Ayurvedic care for PCOS, PCOD, irregular and painful menstrual cycles, natural fertility enhancement, and tubal blockages using specialized Uttar Basti and balancing rasayanas.",
    duration: "45 min",
    price: 500,
    image: "/images/infertility.png",
    icon: "Sparkles",
    active: true,
  },
  {
    id: "70000000-0000-4000-a000-000000000005",
    name: "Stomach & Digestion",
    slug: "stomach-digestion",
    shortDescription: "Acidity, Gas, Constipation, IBS, Bloating, Piles & Fatty liver",
    description: "Re-igniting the digestive fire (Jatharagni) to effectively resolve acidity, gas, constipation, IBS, bloating, indigestion, piles, fissure, fistula, and fatty liver.",
    duration: "45 min",
    price: 500,
    image: "/images/g5.jpg",
    icon: "Sparkles",
    active: true,
  },
  {
    id: "70000000-0000-4000-a000-000000000006",
    name: "Stress & Lifestyle Management",
    slug: "stress-lifestyle-management",
    shortDescription: "Insomnia, Stress & anxiety, Migraine, Obesity, Thyroid, Diabetes",
    description: "Comprehensive therapeutic protocols for insomnia, chronic stress, anxiety, migraine, obesity, thyroid dysfunction, and diabetes through Shirodhara, herbal Rasayanas, and Dinacharya.",
    duration: "45 min",
    price: 500,
    image: "/images/g4.jpg",
    icon: "Sparkles",
    active: true,
  },
];

let runtimeTreatmentsCache: AdminTreatment[] = [...DEFAULT_TREATMENTS];

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

    if (error || !data || data.length === 0) {
      return runtimeTreatmentsCache.length > 0 ? runtimeTreatmentsCache : DEFAULT_TREATMENTS;
    }

    const mapped = data.map(mapDbTreatmentToTreatment);
    runtimeTreatmentsCache = mapped;
    return mapped;
  } catch {
    return runtimeTreatmentsCache.length > 0 ? runtimeTreatmentsCache : DEFAULT_TREATMENTS;
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
    const res = await fetch("/api/admin/treatments", {
      credentials: "include",
      headers: {
        "x-admin-auth": "authenticated_admin",
      },
    });
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
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-admin-auth": "authenticated_admin",
    },
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
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-admin-auth": "authenticated_admin",
    },
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
  const res = await fetch(`/api/admin/treatments?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "x-admin-auth": "authenticated_admin",
    },
  });
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
