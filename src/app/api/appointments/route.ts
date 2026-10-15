import { NextResponse } from "next/server";
import { getAdminSupabaseClient } from "@/lib/supabaseServer";
import {
  isDateInPast,
  normalizeTime,
} from "@/lib/appointmentAvailability";
import type { Database } from "@/types/database.types";

type AppointmentInsert = Database["public"]["Tables"]["appointments"]["Insert"];

function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

const DOCTOR_ID_MAP: Record<string, string> = {
  "doc-1": "d0c00000-0000-4000-a000-000000000001",
  "doc-2": "d0c00000-0000-4000-a000-000000000002",
  "doc-3": "d0c00000-0000-4000-a000-000000000003",
};

const TREATMENT_ID_MAP: Record<string, string> = {
  "treat-1": "70000000-0000-4000-a000-000000000001",
  "treat-2": "70000000-0000-4000-a000-000000000002",
  "treat-3": "70000000-0000-4000-a000-000000000003",
  "treat-4": "70000000-0000-4000-a000-000000000004",
  "treat-5": "70000000-0000-4000-a000-000000000005",
  "treat-6": "70000000-0000-4000-a000-000000000006",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      patientName,
      phone,
      email,
      doctorId: rawDoctorId,
      treatmentId: rawTreatmentId,
      date,
      time,
      notes,
    } = body;

    // 1. INPUT VALIDATION
    if (!patientName || typeof patientName !== "string" || !patientName.trim()) {
      return NextResponse.json(
        { ok: false, error: "Patient full name is required.", code: "NAME_REQUIRED" },
        { status: 400 }
      );
    }
    const cleanName = patientName.trim();
    if (cleanName.length < 2 || cleanName.length > 80) {
      return NextResponse.json(
        { ok: false, error: "Patient name must be between 2 and 80 characters.", code: "INVALID_NAME" },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== "string" || !phone.trim()) {
      return NextResponse.json(
        { ok: false, error: "Contact phone number is required.", code: "PHONE_REQUIRED" },
        { status: 400 }
      );
    }
    const cleanPhone = phone.trim();
    if (!/^[0-9+\s\-()]{7,20}$/.test(cleanPhone)) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid phone number (7 to 15 digits).", code: "INVALID_PHONE" },
        { status: 400 }
      );
    }

    let cleanEmail: string | null = null;
    if (email && typeof email !== "string" && String(email).trim()) {
      cleanEmail = String(email).trim();
    } else if (email && typeof email === "string" && email.trim()) {
      cleanEmail = email.trim();
      if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
        return NextResponse.json(
          { ok: false, error: "Please provide a valid email address.", code: "INVALID_EMAIL" },
          { status: 400 }
        );
      }
    }

    if (!rawDoctorId || typeof rawDoctorId !== "string" || !rawDoctorId.trim()) {
      return NextResponse.json(
        { ok: false, error: "A doctor selection is required.", code: "DOCTOR_REQUIRED" },
        { status: 400 }
      );
    }

    if (!rawTreatmentId || typeof rawTreatmentId !== "string" || !rawTreatmentId.trim()) {
      return NextResponse.json(
        { ok: false, error: "A clinical therapy or consultation is required.", code: "TREATMENT_REQUIRED" },
        { status: 400 }
      );
    }

    if (!date || typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
      return NextResponse.json(
        { ok: false, error: "Appointment date must be in YYYY-MM-DD format.", code: "INVALID_DATE" },
        { status: 400 }
      );
    }
    const cleanDate = date.trim();

    if (isDateInPast(cleanDate)) {
      return NextResponse.json(
        { ok: false, error: "Consultation date cannot be in the past.", code: "DATE_IN_PAST" },
        { status: 400 }
      );
    }

    if (!time || typeof time !== "string" || !/^\d{2}:\d{2}(:\d{2})?$/.test(time.trim())) {
      return NextResponse.json(
        { ok: false, error: "A valid start time slot is required (HH:MM).", code: "INVALID_TIME" },
        { status: 400 }
      );
    }
    const cleanTime = normalizeTime(time.trim());

    const supabase = getAdminSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { ok: false, error: "Database client unavailable.", code: "DB_UNAVAILABLE" },
        { status: 503 }
      );
    }

    // 2. VERIFY DOCTOR IN DATABASE
    let doctor: { id: string; name: string; active: boolean } | null = null;
    const doctorUuid = isUUID(rawDoctorId) ? rawDoctorId : (DOCTOR_ID_MAP[rawDoctorId] || null);

    if (doctorUuid) {
      const { data, error } = await supabase
        .from("doctors")
        .select("id, name, active")
        .eq("id", doctorUuid)
        .maybeSingle();
      if (!error && data) doctor = data;
    }

    if (!doctor && rawDoctorId) {
      // Try resolving by slug or name
      const { data, error } = await supabase
        .from("doctors")
        .select("id, name, active")
        .or(`slug.eq."${rawDoctorId}",name.ilike."%${rawDoctorId}%"`)
        .eq("active", true)
        .limit(1)
        .maybeSingle();
      if (!error && data) doctor = data;
    }

    // If still not resolved, fallback to first active doctor
    if (!doctor) {
      const { data, error } = await supabase
        .from("doctors")
        .select("id, name, active")
        .eq("active", true)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (!error && data) doctor = data;
    }

    if (!doctor) {
      return NextResponse.json(
        { ok: false, error: "Selected doctor does not exist in hospital directory.", code: "DOCTOR_NOT_FOUND" },
        { status: 404 }
      );
    }

    if (!doctor.active) {
      return NextResponse.json(
        { ok: false, error: `Dr. ${doctor.name} is currently inactive and not accepting appointments.`, code: "DOCTOR_INACTIVE" },
        { status: 400 }
      );
    }

    // 3. VERIFY TREATMENT IN DATABASE
    let treatment: { id: string; name: string; duration: string | null; price: number; active: boolean } | null = null;
    const treatmentUuid = isUUID(rawTreatmentId) ? rawTreatmentId : (TREATMENT_ID_MAP[rawTreatmentId] || null);

    if (treatmentUuid) {
      const { data, error } = await supabase
        .from("treatments")
        .select("id, name, duration, price, active")
        .eq("id", treatmentUuid)
        .maybeSingle();
      if (!error && data) treatment = data;
    }

    if (!treatment && rawTreatmentId) {
      // Try resolving by slug or name
      const { data, error } = await supabase
        .from("treatments")
        .select("id, name, duration, price, active")
        .or(`slug.eq."${rawTreatmentId}",name.ilike."%${rawTreatmentId}%"`)
        .eq("active", true)
        .limit(1)
        .maybeSingle();
      if (!error && data) treatment = data;
    }

    // If still not resolved, fallback to first active treatment
    if (!treatment) {
      const { data, error } = await supabase
        .from("treatments")
        .select("id, name, duration, price, active")
        .eq("active", true)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (!error && data) treatment = data;
    }

    if (!treatment) {
      return NextResponse.json(
        { ok: false, error: "Selected treatment does not exist in hospital directory.", code: "TREATMENT_NOT_FOUND" },
        { status: 404 }
      );
    }

    if (!treatment.active) {
      return NextResponse.json(
        { ok: false, error: `The treatment "${treatment.name}" is currently unavailable.`, code: "TREATMENT_INACTIVE" },
        { status: 400 }
      );
    }

    // 4. CHECK DOUBLE BOOKING
    const { data: existingBooking } = await supabase
      .from("appointments")
      .select("id")
      .eq("doctor_id", doctor.id)
      .eq("appointment_date", cleanDate)
      .eq("start_time", cleanTime)
      .in("status", ["PENDING", "CONFIRMED"])
      .maybeSingle();

    if (existingBooking) {
      return NextResponse.json(
        {
          ok: false,
          error: "This appointment slot was just booked by another patient. Please select another time.",
          code: "SLOT_ALREADY_BOOKED",
        },
        { status: 409 }
      );
    }

    // Calculate End Time
    let durationMinutes = 30;
    const durMatch = (treatment.duration || "").match(/(\d+)/);
    if (durMatch) {
      durationMinutes = parseInt(durMatch[1], 10);
    }
    const [hStr, mStr] = cleanTime.split(":");
    const startMinutes = parseInt(hStr, 10) * 60 + parseInt(mStr, 10);
    const endMinutes = startMinutes + durationMinutes;
    const endH = Math.floor(endMinutes / 60).toString().padStart(2, "0");
    const endM = (endMinutes % 60).toString().padStart(2, "0");
    const endTime = `${endH}:${endM}`;

    // 5. INSERT APPOINTMENT RECORD
    const newRow: AppointmentInsert = {
      patient_name: cleanName,
      phone: cleanPhone,
      email: cleanEmail || "not-provided@charak.in",
      doctor_id: doctor.id,
      treatment_id: treatment.id,
      appointment_date: cleanDate,
      start_time: cleanTime,
      end_time: endTime,
      status: "CONFIRMED",
      payment_status: "PENDING",
      notes: notes ? String(notes).trim() : null,
    };

    const { data: created, error: insertError } = await supabase
      .from("appointments")
      .insert(newRow)
      .select()
      .single();

    if (insertError) {
      if (
        insertError.code === "23505" ||
        insertError.message.includes("idx_appointments_no_double_booking") ||
        insertError.message.toLowerCase().includes("unique constraint")
      ) {
        return NextResponse.json(
          {
            ok: false,
            error: "This appointment slot was just booked. Please select another time.",
            code: "SLOT_ALREADY_BOOKED",
          },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { ok: false, error: `Failed to create appointment: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        data: {
          id: created.id,
          patientName: cleanName,
          phone: cleanPhone,
          email: cleanEmail,
          doctorId: doctor.id,
          doctorName: doctor.name,
          treatmentId: treatment.id,
          treatmentName: treatment.name,
          date: cleanDate,
          time: cleanTime,
          endTime,
          status: created.status,
          paymentStatus: created.payment_status,
          notes: created.notes || "",
          createdAt: created.created_at,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Appointment ID is required." },
        { status: 400 }
      );
    }

    const supabase = getAdminSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { ok: false, error: "Database client not configured." },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from("appointments")
      .select(`
        id,
        patient_name,
        phone,
        email,
        doctor_id,
        treatment_id,
        appointment_date,
        start_time,
        end_time,
        status,
        payment_status,
        notes,
        created_at,
        doctors ( name ),
        treatments ( name )
      `)
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json(
        { ok: false, error: "Appointment not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: {
        id: data.id,
        patientName: data.patient_name,
        phone: data.phone,
        email: data.email,
        doctorId: data.doctor_id,
        doctorName: (data.doctors as { name?: string } | null)?.name || "Senior Ayurvedic Vaidya",
        treatmentId: data.treatment_id,
        treatmentName: (data.treatments as { name?: string } | null)?.name || "Clinical Consultation",
        date: data.appointment_date,
        time: normalizeTime(data.start_time),
        endTime: data.end_time ? normalizeTime(data.end_time) : undefined,
        status: data.status,
        paymentStatus: data.payment_status,
        notes: data.notes || "",
        createdAt: data.created_at,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
