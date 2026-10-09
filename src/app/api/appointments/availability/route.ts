import { NextResponse } from "next/server";
import { getAdminSupabaseClient } from "@/lib/supabaseServer";
import {
  getDayOfWeekFromDate,
  generateTimeSlots,
  getTodayIST,
  isDateInPast,
  normalizeTime,
  type GeneratedSlot,
} from "@/lib/appointmentAvailability";

function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

// Map friendly legacy IDs to database UUIDs
const DOCTOR_ID_MAP: Record<string, string> = {
  "doc-1": "d0c00000-0000-4000-a000-000000000001",
  "doc-2": "d0c00000-0000-4000-a000-000000000002",
  "doc-3": "d0c00000-0000-4000-a000-000000000003",
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawDoctorId = searchParams.get("doctorId");
    const date = searchParams.get("date");

    if (!rawDoctorId || !rawDoctorId.trim()) {
      return NextResponse.json(
        { ok: false, error: "doctorId parameter is required." },
        { status: 400 }
      );
    }

    if (!date || !date.trim()) {
      return NextResponse.json(
        { ok: false, error: "date parameter is required (YYYY-MM-DD)." },
        { status: 400 }
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
      return NextResponse.json(
        { ok: false, error: "Invalid date format. Expected YYYY-MM-DD." },
        { status: 400 }
      );
    }

    const trimmedDate = date.trim();

    if (isDateInPast(trimmedDate)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Selected date is in the past. Please choose a future consultation date.",
          code: "DATE_IN_PAST",
        },
        { status: 400 }
      );
    }

    let dayOfWeek: string;
    try {
      dayOfWeek = getDayOfWeekFromDate(trimmedDate);
    } catch {
      return NextResponse.json(
        { ok: false, error: "Unable to parse calendar date." },
        { status: 400 }
      );
    }

    const doctorUuid = isUUID(rawDoctorId) ? rawDoctorId : (DOCTOR_ID_MAP[rawDoctorId] || null);
    const supabase = getAdminSupabaseClient();

    if (!supabase) {
      return NextResponse.json(
        { ok: false, error: "Database client unavailable." },
        { status: 503 }
      );
    }

    // 1. RESOLVE DOCTOR FROM DATABASE
    let doctor: { id: string; name: string; active: boolean } | null = null;
    if (doctorUuid) {
      const { data, error } = await supabase
        .from("doctors")
        .select("id, name, active")
        .eq("id", doctorUuid)
        .maybeSingle();

      if (!error && data) {
        doctor = data;
      }
    }

    if (!doctor) {
      return NextResponse.json(
        { ok: false, error: "Selected doctor does not exist in hospital directory.", code: "DOCTOR_NOT_FOUND" },
        { status: 404 }
      );
    }

    if (!doctor.active) {
      return NextResponse.json(
        {
          ok: false,
          error: `Dr. ${doctor.name} is currently inactive and not accepting appointments.`,
          code: "DOCTOR_INACTIVE",
        },
        { status: 400 }
      );
    }

    // 2. FETCH AVAILABILITY WINDOWS FOR DAY
    let availList: { start_time: string; end_time: string; slot_duration: number; active: boolean }[] = [];
    const { data: availData, error: availErr } = await supabase
      .from("doctor_availability")
      .select("start_time, end_time, slot_duration, active")
      .eq("doctor_id", doctor.id)
      .ilike("day_of_week", dayOfWeek)
      .eq("active", true);

    if (!availErr && availData && availData.length > 0) {
      availList = availData;
    }

    // Standard clinical dispensary hours if not configured individually
    if (availList.length === 0 && dayOfWeek !== "Sunday") {
      availList = [
        { start_time: "09:00:00", end_time: "13:00:00", slot_duration: 30, active: true },
      ];
    }

    // Generate candidate slots
    const allCandidateSlots: { time: string; endTime: string }[] = [];
    for (const win of availList) {
      allCandidateSlots.push(
        ...generateTimeSlots(win.start_time, win.end_time, win.slot_duration || 30)
      );
    }

    // 3. IDENTIFY BOOKED SLOTS (CONFIRMED or PENDING)
    const bookedTimes = new Set<string>();
    const { data: bookedAppointments, error: aptError } = await supabase
      .from("appointments")
      .select("start_time, status")
      .eq("doctor_id", doctor.id)
      .eq("appointment_date", trimmedDate)
      .in("status", ["PENDING", "CONFIRMED"]);

    if (!aptError && bookedAppointments) {
      for (const apt of bookedAppointments) {
        if (apt.start_time) {
          bookedTimes.add(normalizeTime(apt.start_time));
        }
      }
    }

    const calculatedSlots: GeneratedSlot[] = allCandidateSlots.map((slot) => ({
      time: slot.time,
      endTime: slot.endTime,
      isAvailable: !bookedTimes.has(slot.time),
    }));

    const availableSlots = calculatedSlots
      .filter((s) => s.isAvailable)
      .map((s) => s.time);

    return NextResponse.json({
      ok: true,
      data: {
        doctorId: rawDoctorId,
        doctorName: doctor.name,
        date: trimmedDate,
        dayOfWeek,
        slots: calculatedSlots,
        availableSlots,
        today: getTodayIST(),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
