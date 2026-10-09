import type { Doctor } from "@/types";
import type { Database } from "@/types/database.types";
import { getPublicSupabaseClient } from "./supabaseClient";

const EVENT_NAME = "charak_doctors_updated";

let runtimeDoctorsCache: AdminDoctor[] = [];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function notifySubscribers(): void {
  if (isBrowser()) {
    window.dispatchEvent(new Event(EVENT_NAME));
  }
}

export interface DoctorAvailabilityItem {
  id: string;
  doctorId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  slotDuration: number;
  active: boolean;
}

export interface AdminDoctor extends Doctor {
  specialization?: string;
  bio?: string;
  detailedBio?: string;
  active?: boolean;
}

function mapDbDoctorToDoctor(
  row: Database["public"]["Tables"]["doctors"]["Row"]
): AdminDoctor {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug || row.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    title: row.designation || row.specialization,
    designation: row.designation || row.specialization,
    specialization: row.specialization,
    qualifications: row.qualification,
    experience: row.experience,
    bio: row.bio || "",
    detailedBio: row.detailed_bio || row.bio || "",
    location: "Vidyavihar, Pilani",
    image: row.image,
    storagePath: row.storage_path || undefined,
    consultationFee: Number(row.consultation_fee) || 1200,
    displayOrder: row.display_order ?? 0,
    active: row.active,
    availableTimes: {},
  };
}

/**
 * Public asynchronous fetch from Supabase for active doctors.
 */
export async function fetchDoctors(): Promise<Doctor[]> {
  try {
    const supabase = getPublicSupabaseClient();
    if (!supabase) {
      return runtimeDoctorsCache;
    }

    const { data, error } = await supabase
      .from("doctors")
      .select("*")
      .eq("active", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error || !data) {
      return runtimeDoctorsCache;
    }

    const mapped = data.map(mapDbDoctorToDoctor);
    runtimeDoctorsCache = mapped;
    return mapped;
  } catch {
    return runtimeDoctorsCache;
  }
}

export async function fetchDoctorById(id: string): Promise<Doctor | null> {
  try {
    const supabase = getPublicSupabaseClient();
    if (!supabase) {
      return runtimeDoctorsCache.find((d) => d.id === id) || null;
    }

    const { data, error } = await supabase
      .from("doctors")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapDbDoctorToDoctor(data);
  } catch {
    return null;
  }
}

export async function fetchDoctorBySlug(slug: string): Promise<Doctor | null> {
  try {
    const supabase = getPublicSupabaseClient();
    if (!supabase) {
      return runtimeDoctorsCache.find((d) => d.slug === slug || d.id === slug) || null;
    }

    const { data, error } = await supabase
      .from("doctors")
      .select("*")
      .or(`slug.eq.${slug},id.eq.${slug}`)
      .eq("active", true)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapDbDoctorToDoctor(data);
  } catch {
    return null;
  }
}

// ----------------------------------------------------------------------------
// Admin CRUD Operations for Doctors & Schedules
// ----------------------------------------------------------------------------

export async function fetchAdminDoctors(): Promise<AdminDoctor[]> {
  if (!isBrowser()) return runtimeDoctorsCache;
  try {
    const res = await fetch("/api/admin/doctors");
    const json = await res.json().catch(() => ({}));
    if (json.ok && json.data && Array.isArray(json.data.doctors)) {
      const mapped = json.data.doctors.map(mapDbDoctorToDoctor);
      runtimeDoctorsCache = mapped;
      return mapped;
    }
    return [];
  } catch (err) {
    console.error("[Admin Doctors API] fetch failed:", err);
    return [];
  }
}

export async function adminCreateDoctor(input: {
  name: string;
  slug?: string;
  designation?: string;
  specialization: string;
  qualification: string;
  experience: string;
  bio?: string;
  detailedBio?: string;
  image?: string;
  storagePath?: string;
  consultationFee?: number;
  displayOrder?: number;
  active?: boolean;
}): Promise<AdminDoctor> {
  const res = await fetch("/api/admin/doctors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  if (!res.ok || !json.ok || !json.data) {
    throw new Error(json.error || "Failed to create doctor in database");
  }

  const created = mapDbDoctorToDoctor(json.data);
  runtimeDoctorsCache = [created, ...runtimeDoctorsCache.filter((d) => d.id !== created.id)];
  notifySubscribers();
  return created;
}

export async function adminUpdateDoctor(
  id: string,
  changes: Partial<AdminDoctor> & {
    qualification?: string;
    detailedBio?: string;
    storagePath?: string;
  }
): Promise<AdminDoctor> {
  const payload: Record<string, unknown> = { id, ...changes };
  if (changes.title) payload.specialization = changes.title;
  if (changes.qualifications) payload.qualification = changes.qualifications;

  const res = await fetch("/api/admin/doctors", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || !json.ok || !json.data) {
    throw new Error(json.error || "Failed to update doctor in database");
  }

  const updated = mapDbDoctorToDoctor(json.data);
  runtimeDoctorsCache = runtimeDoctorsCache.map((d) => (d.id === id ? updated : d));
  notifySubscribers();
  return updated;
}

export async function adminDeleteDoctor(id: string): Promise<void> {
  const res = await fetch(`/api/admin/doctors?id=${encodeURIComponent(id)}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok || !json.ok) {
    throw new Error(json.error || "Failed to delete doctor in database");
  }

  runtimeDoctorsCache = runtimeDoctorsCache.filter((d) => d.id !== id);
  notifySubscribers();
}

// ----------------------------------------------------------------------------
// Doctor Availability Methods
// ----------------------------------------------------------------------------

export async function fetchDoctorAvailability(doctorId?: string): Promise<DoctorAvailabilityItem[]> {
  try {
    const url = doctorId
      ? `/api/admin/doctor-availability?doctorId=${encodeURIComponent(doctorId)}`
      : "/api/admin/doctor-availability";
    const res = await fetch(url);
    const json = await res.json();
    if (json.ok && Array.isArray(json.data)) {
      return json.data.map((row: Database["public"]["Tables"]["doctor_availability"]["Row"]) => ({
        id: row.id,
        doctorId: row.doctor_id,
        dayOfWeek: row.day_of_week,
        startTime: row.start_time,
        endTime: row.end_time,
        slotDuration: row.slot_duration,
        active: row.active,
      }));
    }
    return [];
  } catch (err) {
    console.error("[Doctor Availability] fetch failed:", err);
    return [];
  }
}

export async function adminCreateAvailabilitySlot(input: {
  doctorId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  slotDuration?: number;
  active?: boolean;
}): Promise<DoctorAvailabilityItem> {
  const res = await fetch("/api/admin/doctor-availability", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  if (!res.ok || !json.ok || !json.data) {
    throw new Error(json.error || "Failed to save schedule slot");
  }

  return {
    id: json.data.id,
    doctorId: json.data.doctor_id,
    dayOfWeek: json.data.day_of_week,
    startTime: json.data.start_time,
    endTime: json.data.end_time,
    slotDuration: json.data.slot_duration,
    active: json.data.active,
  };
}

export async function adminDeleteAvailabilitySlot(slotId: string): Promise<void> {
  const res = await fetch(`/api/admin/doctor-availability?id=${encodeURIComponent(slotId)}`, {
    method: "DELETE",
  });
  const json = await res.json();
  if (!res.ok || !json.ok) {
    throw new Error(json.error || "Failed to delete schedule slot");
  }
}

export const adminCreateAvailability = adminCreateAvailabilitySlot;
export const adminDeleteAvailability = adminDeleteAvailabilitySlot;

// ----------------------------------------------------------------------------
// Synchronous Cache Access (Backed only by active runtime cache, no mock data)
// ----------------------------------------------------------------------------

export function getDoctors(): AdminDoctor[] {
  return runtimeDoctorsCache;
}

export function getDoctorById(id: string): AdminDoctor | undefined {
  return runtimeDoctorsCache.find((doctor) => doctor.id === id);
}

export function subscribeDoctors(callback: () => void): () => void {
  if (!isBrowser()) return () => {};
  window.addEventListener(EVENT_NAME, callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
  };
}
