import type { Doctor } from "@/types";
import type { Database } from "@/types/database.types";
import { getPublicSupabaseClient } from "./supabaseClient";

const EVENT_NAME = "charak_doctors_updated";

export const CLINIC_TREATMENTS = [
  { id: "70000000-0000-4000-a000-000000000001", name: "Therapies & Panchakarma", slug: "therapies-panchakarma" },
  { id: "70000000-0000-4000-a000-000000000002", name: "Body Pain & Spine Care", slug: "body-pain-spine-care" },
  { id: "70000000-0000-4000-a000-000000000003", name: "Skin & Hair Care", slug: "skin-hair-care" },
  { id: "70000000-0000-4000-a000-000000000004", name: "Women's Health & Fertility", slug: "womens-health-fertility" },
  { id: "70000000-0000-4000-a000-000000000005", name: "Stomach & Digestion", slug: "stomach-digestion" },
  { id: "70000000-0000-4000-a000-000000000006", name: "Stress & Lifestyle Management", slug: "stress-lifestyle-management" },
];

export function extractDoctorMetadata(detailedBio?: string | null): { cleanBio: string; treatmentIds: string[] } {
  if (!detailedBio) return { cleanBio: "", treatmentIds: [] };
  const match = detailedBio.match(/<!--\s*DOCTOR_METADATA:\s*(\{[\s\S]*?\})\s*-->/);
  if (match) {
    try {
      const parsed = JSON.parse(match[1]);
      const clean = detailedBio.replace(match[0], "").trim();
      return { cleanBio: clean, treatmentIds: Array.isArray(parsed.treatmentIds) ? parsed.treatmentIds : [] };
    } catch {
      // fallback
    }
  }
  return { cleanBio: detailedBio, treatmentIds: [] };
}

export function attachDoctorMetadata(cleanBio: string, metadata: { treatmentIds: string[] }): string {
  const clean = cleanBio.replace(/<!--\s*DOCTOR_METADATA:[\s\S]*?-->/g, "").trim();
  return `${clean}\n\n<!-- DOCTOR_METADATA: ${JSON.stringify(metadata)} -->`;
}

export const DEFAULT_DOCTORS: AdminDoctor[] = [
  {
    id: "d0c00000-0000-4000-a000-000000000001",
    name: "Dr. Varij Pandey",
    slug: "dr-varij-pandey",
    title: "Orthopaedic Care Specialist",
    designation: "Orthopaedic Care Specialist",
    specialization: "Orthopaedic Care",
    qualifications: "B.A.M.S., M.D. (Ayurveda)",
    experience: "15 Years",
    availability: "Daily",
    timings: "9:00 AM – 1:00 PM | 4:00 PM – 7:00 PM",
    bio: "Senior Ayurvedic Orthopaedic Specialist with 15 years of clinical expertise in spine and joint disorders, musculoskeletal rehabilitation, and classical bone & joint care.",
    detailedBio: "Dr. Varij Pandey is a senior Ayurvedic physician with 15 years of dedicated practice in orthopaedic care. He specializes in spine and joint disorders, sciatica, cervical spondylitis, slip disc, and chronic arthritis through classical Panchakarma and targeted Ayurvedic therapies.\n\nAvailability: Daily\nTimings: 9:00 AM – 1:00 PM | 4:00 PM – 7:00 PM",
    location: "Vidyavihar, Pilani",
    image: "/images/g1.jpg",
    consultationFee: 500,
    displayOrder: 1,
    active: true,
    availableTimes: {},
    treatmentIds: [
      "70000000-0000-4000-a000-000000000002", // Body Pain & Spine Care
      "70000000-0000-4000-a000-000000000001", // Therapies & Panchakarma
    ],
  },
  {
    id: "d0c00000-0000-4000-a000-000000000002",
    name: "Dr. Anuja Singhai",
    slug: "dr-anuja-singhai",
    title: "Gynaecology & Fertility Specialist",
    designation: "Gynaecology & Fertility Specialist",
    specialization: "Gynaecology & Fertility, PCOS/PCOD",
    qualifications: "B.A.M.S., M.D. (Ayurveda)",
    experience: "15 Years",
    availability: "Daily",
    timings: "9:00 AM – 1:00 PM | 4:00 PM – 7:00 PM",
    bio: "Senior Ayurvedic Gynaecologist with 15 years of clinical excellence in women's health, PCOS/PCOD, irregular and painful cycles, and natural fertility.",
    detailedBio: "Dr. Anuja Singhai brings 15 years of specialized Ayurvedic clinical experience in female reproductive health, hormonal equilibrium, PCOS/PCOD, infertility, and tubal blockages. Her gentle, root-cause methodology combines classical Uttar Basti, rasayanas, and supportive lifestyle guidance.\n\nAvailability: Daily\nTimings: 9:00 AM – 1:00 PM | 4:00 PM – 7:00 PM",
    location: "Vidyavihar, Pilani",
    image: "/images/g2.jpg",
    consultationFee: 500,
    displayOrder: 2,
    active: true,
    availableTimes: {},
    treatmentIds: [
      "70000000-0000-4000-a000-000000000004", // Women's Health & Fertility
      "70000000-0000-4000-a000-000000000003", // Skin & Hair Care
    ],
  },
  {
    id: "d0c00000-0000-4000-a000-000000000003",
    name: "Dr. Ramraj Sharma",
    slug: "dr-ramraj-sharma",
    title: "Panchakarma & Lifestyle Disorders Specialist",
    designation: "Panchakarma & Lifestyle Disorders Specialist",
    specialization: "Panchakarma, Lifestyle Disorders",
    qualifications: "B.A.M.S., PGTDIP",
    experience: "3+ Years",
    availability: "Daily",
    timings: "9:00 AM – 1:00 PM | 4:00 PM – 7:00 PM",
    bio: "Ayurvedic Physician with 3+ years of experience specializing in authentic Panchakarma therapies, holistic detoxification, and metabolic lifestyle disorder management.",
    detailedBio: "Dr. Ramraj Sharma is an accomplished Ayurvedic physician and Panchakarma practitioner. He focuses on comprehensive body cleansing, digestive disorders, insomnia, stress management, and metabolic diseases through classical therapies and patient-centered dinacharya protocols.\n\nAvailability: Daily\nTimings: 9:00 AM – 1:00 PM | 4:00 PM – 7:00 PM",
    location: "Vidyavihar, Pilani",
    image: "/images/g3.jpg",
    consultationFee: 500,
    displayOrder: 3,
    active: true,
    availableTimes: {},
    treatmentIds: [
      "70000000-0000-4000-a000-000000000001", // Therapies & Panchakarma
      "70000000-0000-4000-a000-000000000005", // Stomach & Digestion
      "70000000-0000-4000-a000-000000000006", // Stress & Lifestyle Management
    ],
  },
];

let runtimeDoctorsCache: AdminDoctor[] = [...DEFAULT_DOCTORS];

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
  availability?: string;
  timings?: string;
  active?: boolean;
}

const KNOWN_DOCTOR_SCHEDULES: Record<string, { availability: string; timings: string }> = {
  "dr-varij-pandey": {
    availability: "Sunday",
    timings: "9:00 AM – 1:00 PM | 4:00 PM – 7:00 PM",
  },
  "d0c00000-0000-4000-a000-000000000001": {
    availability: "Sunday",
    timings: "9:00 AM – 1:00 PM | 4:00 PM – 7:00 PM",
  },
  "dr-anuja-singhai": {
    availability: "Daily",
    timings: "4:00 PM – 7:00 PM",
  },
  "d0c00000-0000-4000-a000-000000000002": {
    availability: "Daily",
    timings: "4:00 PM – 7:00 PM",
  },
  "dr-ramraj-sharma": {
    availability: "Daily",
    timings: "9:00 AM – 1:00 PM | 4:00 PM – 7:00 PM",
  },
  "d0c00000-0000-4000-a000-000000000003": {
    availability: "Daily",
    timings: "9:00 AM – 1:00 PM | 4:00 PM – 7:00 PM",
  },
};

function mapDbDoctorToDoctor(
  row: Database["public"]["Tables"]["doctors"]["Row"]
): AdminDoctor {
  const slug = row.slug || row.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const scheduleMeta = KNOWN_DOCTOR_SCHEDULES[slug] || KNOWN_DOCTOR_SCHEDULES[row.id] || {
    availability: "Daily",
    timings: "9:00 AM – 1:00 PM | 4:00 PM – 7:00 PM",
  };

    const meta = extractDoctorMetadata(row.detailed_bio);
    const defaultDoc = DEFAULT_DOCTORS.find((d) => d.id === row.id || d.slug === slug);
    const resolvedTreatmentIds =
      meta.treatmentIds.length > 0
        ? meta.treatmentIds
        : defaultDoc?.treatmentIds || [];

  return {
    id: row.id,
    name: row.name,
    slug,
    title: row.designation || row.specialization,
    designation: row.designation || row.specialization,
    specialization: row.specialization,
    qualifications: row.qualification,
    experience: row.experience,
    availability: scheduleMeta.availability,
    timings: scheduleMeta.timings,
    bio: row.bio || "",
    detailedBio: meta.cleanBio || row.bio || "",
    location: "Vidyavihar, Pilani",
    image: row.image,
    storagePath: row.storage_path || undefined,
    consultationFee: Number(row.consultation_fee) || 500,
    displayOrder: row.display_order ?? 0,
    active: row.active,
    availableTimes: {},
    treatmentIds: resolvedTreatmentIds,
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

    if (error || !data || data.length === 0) {
      return runtimeDoctorsCache.length > 0 ? runtimeDoctorsCache : DEFAULT_DOCTORS;
    }

    const mapped = data.map(mapDbDoctorToDoctor);
    runtimeDoctorsCache = mapped;
    return mapped;
  } catch {
    return runtimeDoctorsCache.length > 0 ? runtimeDoctorsCache : DEFAULT_DOCTORS;
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
    const res = await fetch("/api/admin/doctors", {
      credentials: "include",
      headers: {
        "x-admin-auth": "authenticated_admin",
      },
    });
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
  treatmentIds?: string[];
}): Promise<AdminDoctor> {
  const res = await fetch("/api/admin/doctors", {
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
    treatmentIds?: string[];
  }
): Promise<AdminDoctor> {
  const payload: Record<string, unknown> = { id, ...changes };
  if (changes.title) payload.specialization = changes.title;
  if (changes.qualifications) payload.qualification = changes.qualifications;

  const res = await fetch("/api/admin/doctors", {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-admin-auth": "authenticated_admin",
    },
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
  const res = await fetch(`/api/admin/doctors?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "x-admin-auth": "authenticated_admin",
    },
  });
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
    const res = await fetch(url, {
      credentials: "include",
      headers: {
        "x-admin-auth": "authenticated_admin",
      },
    });
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
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-admin-auth": "authenticated_admin",
    },
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
    credentials: "include",
    headers: {
      "x-admin-auth": "authenticated_admin",
    },
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
