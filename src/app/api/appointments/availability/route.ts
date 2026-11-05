import { NextResponse } from "next/server";
import { getAdminSupabaseClient } from "@/lib/supabaseServer";
import {
  getDayOfWeekFromDate,
  generateTimeSlots,
  getTodayIST,
  getCurrentTimeIST,
  isDateInPast,
  isSlotInPast,
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
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!rawDoctorId || !rawDoctorId.trim()) {
      return NextResponse.json(
        { ok: false, error: "doctorId parameter is required." },
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

    if (!doctor && rawDoctorId) {
      const { data, error } = await supabase
        .from("doctors")
        .select("id, name, active")
        .or(`slug.eq."${rawDoctorId}",name.ilike."%${rawDoctorId}%"`)
        .eq("active", true)
        .limit(1)
        .maybeSingle();
      if (!error && data) doctor = data;
    }

    // Fallback to first active doctor
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
        {
          ok: false,
          error: `Dr. ${doctor.name} is currently inactive and not accepting appointments.`,
          code: "DOCTOR_INACTIVE",
        },
        { status: 400 }
      );
    }

    // Fetch all active availability windows for this doctor in one query
    const { data: allDoctorAvail } = await supabase
      .from("doctor_availability")
      .select("day_of_week, start_time, end_time, slot_duration, active")
      .eq("doctor_id", doctor.id)
      .eq("active", true);

    const hasAnyConfiguredSlots = Array.isArray(allDoctorAvail) && allDoctorAvail.length > 0;

    const todayIST = getTodayIST();
    const currentTimeIST = getCurrentTimeIST();

    // Helper to get matching availability for a given day name
    const getAvailForDay = (dayName: string) => {
      const target = dayName.trim().toLowerCase();
      const prefix = target.slice(0, 3);
      const matched = (allDoctorAvail || []).filter((row) => {
        const rowDay = (row.day_of_week || "").trim().toLowerCase();
        return rowDay === target || rowDay.startsWith(prefix);
      });

      if (matched.length > 0) return matched;
      if (!hasAnyConfiguredSlots) {
        // Fallback to standard hospital OPD hours if admin hasn't set any custom windows
        return [
          { day_of_week: dayName, start_time: "09:00:00", end_time: "13:00:00", slot_duration: 30, active: true },
          { day_of_week: dayName, start_time: "16:00:00", end_time: "19:00:00", slot_duration: 30, active: true },
        ];
      }
      return [];
    };

    // ------------------------------------------------------------------------
    // BATCH RANGE AVAILABILITY (e.g. for full month / 35-day slot counts)
    // ------------------------------------------------------------------------
    if (startDate && endDate) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate.trim()) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate.trim())) {
        return NextResponse.json(
          { ok: false, error: "startDate and endDate must be YYYY-MM-DD" },
          { status: 400 }
        );
      }

      const sDate = startDate.trim();
      const eDate = endDate.trim();

      // Fetch all booked appointments in this date range in one query
      const { data: rangeBookings } = await supabase
        .from("appointments")
        .select("appointment_date, start_time, status")
        .eq("doctor_id", doctor.id)
        .gte("appointment_date", sDate)
        .lte("appointment_date", eDate)
        .in("status", ["PENDING", "CONFIRMED"]);

      const bookedByDate = new Map<string, Set<string>>();
      if (rangeBookings) {
        for (const apt of rangeBookings) {
          if (!apt.appointment_date || !apt.start_time) continue;
          if (!bookedByDate.has(apt.appointment_date)) {
            bookedByDate.set(apt.appointment_date, new Set<string>());
          }
          bookedByDate.get(apt.appointment_date)!.add(normalizeTime(apt.start_time));
        }
      }

      const dateMap: Record<string, number> = {};
      const [sy, sm, sd] = sDate.split("-").map(Number);
      const [ey, em, ed] = eDate.split("-").map(Number);
      const cur = new Date(Date.UTC(sy, sm - 1, sd, 12, 0, 0));
      const end = new Date(Date.UTC(ey, em - 1, ed, 12, 0, 0));

      while (cur <= end) {
        const dStr = cur.toISOString().split("T")[0];
        let dayOfWeekName: string;
        try {
          dayOfWeekName = getDayOfWeekFromDate(dStr);
        } catch {
          dayOfWeekName = "";
        }

        const winList = dayOfWeekName ? getAvailForDay(dayOfWeekName) : [];
        const candidateSlots: { time: string; endTime: string }[] = [];
        for (const win of winList) {
          candidateSlots.push(
            ...generateTimeSlots(win.start_time, win.end_time, win.slot_duration || 30)
          );
        }

        const bookedTimes = bookedByDate.get(dStr) || new Set<string>();
        const isToday = dStr === todayIST;

        let availableCount = 0;
        for (const slot of candidateSlots) {
          if (isToday && normalizeTime(slot.time) <= currentTimeIST) {
            continue;
          }
          if (!bookedTimes.has(normalizeTime(slot.time))) {
            availableCount++;
          }
        }

        dateMap[dStr] = availableCount;
        cur.setUTCDate(cur.getUTCDate() + 1);
      }

      return NextResponse.json({
        ok: true,
        data: {
          doctorId: doctor.id,
          doctorName: doctor.name,
          startDate: sDate,
          endDate: eDate,
          dateMap,
          today: todayIST,
        },
      });
    }

    // ------------------------------------------------------------------------
    // SINGLE DATE DETAILED SLOTS (for Step 4 time slot selection)
    // ------------------------------------------------------------------------
    if (!date || !date.trim()) {
      return NextResponse.json(
        { ok: false, error: "date or (startDate & endDate) parameter is required (YYYY-MM-DD)." },
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

    const availList = getAvailForDay(dayOfWeek);

    // Generate candidate slots
    const allCandidateSlots: { time: string; endTime: string }[] = [];
    for (const win of availList) {
      allCandidateSlots.push(
        ...generateTimeSlots(win.start_time, win.end_time, win.slot_duration || 30)
      );
    }

    // Identify booked slots
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

    // Filter candidate slots: if booking is for today, remove past time slots
    const isToday = trimmedDate === todayIST;

    const futureCandidateSlots = allCandidateSlots.filter((slot) => {
      if (!isToday) return true;
      return normalizeTime(slot.time) > currentTimeIST;
    });

    const calculatedSlots: GeneratedSlot[] = futureCandidateSlots.map((slot) => ({
      time: slot.time,
      endTime: slot.endTime,
      isAvailable: !bookedTimes.has(normalizeTime(slot.time)),
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
        today: todayIST,
        currentTime: currentTimeIST,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
