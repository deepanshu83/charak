import type { Appointment, AppointmentStatus } from "@/types";
import { generateTimeSlots } from "./appointmentAvailability";

export { getDoctors, getDoctorById } from "./doctorService";
export { getTreatments, getTreatmentById } from "./treatmentService";

export interface BookingConfirmation {
  id: string;
  patientName: string;
  phone: string;
  email?: string;
  doctorId: string;
  doctorName?: string;
  treatmentId: string;
  treatmentName?: string;
  date: string;
  time: string;
  endTime?: string;
  status: AppointmentStatus | string;
  paymentStatus?: string;
  notes?: string;
  createdAt?: string;
}

export interface BookAppointmentInput {
  patientName: string;
  phone: string;
  email?: string;
  doctorId: string;
  treatmentId: string;
  date: string;
  time: string;
  notes?: string;
}

const EVENT_NAME = "charak_appointments_updated";

let runtimeAppointmentsCache: Appointment[] = [];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function notifySubscribers(): void {
  if (isBrowser()) {
    window.dispatchEvent(new Event(EVENT_NAME));
  }
}

/**
 * Public Booking API: calls POST /api/appointments
 */
export async function bookAppointment(input: BookAppointmentInput): Promise<BookingConfirmation> {
  const res = await fetch("/api/appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.ok || !json.data) {
    throw new Error(json.error || "Failed to book appointment. Please select another slot or try again.");
  }

  notifySubscribers();
  return json.data;
}

/**
 * Public Availability Fetch: calls GET /api/appointments/availability
 */
export async function fetchAvailableSlots(
  doctorId: string,
  date: string
): Promise<{ slots: { time: string; endTime?: string; isAvailable: boolean }[]; availableSlots: string[] }> {
  try {
    const res = await fetch(
      `/api/appointments/availability?doctorId=${encodeURIComponent(doctorId)}&date=${encodeURIComponent(date)}`
    );
    const json = await res.json().catch(() => ({}));
    if (json.ok && json.data) {
      return {
        slots: json.data.slots || [],
        availableSlots: json.data.availableSlots || [],
      };
    }
    return { slots: [], availableSlots: [] };
  } catch (err) {
    console.error("[AppointmentService] fetchAvailableSlots failed:", err);
    return { slots: [], availableSlots: [] };
  }
}

/**
 * Fallback slot calculation for clinic working hours (09:00 - 17:00, 30 min slots)
 */
export function getAllDoctorSlots(
  doctorId?: string,
  date?: string
): { time: string; endTime?: string; isAvailable: boolean }[] {
  void doctorId;
  void date;
  return generateTimeSlots("09:00", "17:00", 30).map((s) => ({
    time: s.time,
    endTime: s.endTime,
    isAvailable: true,
  }));
}

// ----------------------------------------------------------------------------
// Admin Operations
// ----------------------------------------------------------------------------

export async function fetchAdminAppointments(): Promise<Appointment[]> {
  if (!isBrowser()) return runtimeAppointmentsCache;
  try {
    const res = await fetch("/api/admin/appointments");
    const json = await res.json().catch(() => ({}));
    if (json.ok && Array.isArray(json.data)) {
      runtimeAppointmentsCache = json.data;
      return json.data;
    }
    return [];
  } catch (err) {
    console.error("[Admin Appointments API] fetch failed:", err);
    return [];
  }
}

export async function adminUpdateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
  notes?: string
): Promise<Appointment> {
  const res = await fetch("/api/admin/appointments", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status, notes }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.ok) {
    throw new Error(json.error || "Failed to update appointment status in database");
  }

  runtimeAppointmentsCache = runtimeAppointmentsCache.map((a) =>
    a.id === id ? { ...a, status, notes: notes !== undefined ? notes : a.notes } : a
  );
  notifySubscribers();

  const found = runtimeAppointmentsCache.find((a) => a.id === id);
  if (found) return found;

  return {
    id,
    patientName: "",
    phone: "",
    email: "",
    doctorId: "",
    treatmentId: "",
    date: "",
    time: "",
    status,
    notes: notes || "",
    createdAt: new Date().toISOString(),
  };
}

// ----------------------------------------------------------------------------
// Synchronous Cache Access (Backed only by active database results, no mock data)
// ----------------------------------------------------------------------------

export function getAppointments(): Appointment[] {
  return runtimeAppointmentsCache;
}

export function getAppointmentById(id: string): Appointment | undefined {
  return runtimeAppointmentsCache.find((a) => a.id === id);
}

export function subscribeAppointments(callback: () => void): () => void {
  if (!isBrowser()) return () => {};
  window.addEventListener(EVENT_NAME, callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
  };
}
