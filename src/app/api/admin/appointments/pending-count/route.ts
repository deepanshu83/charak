import { NextResponse } from "next/server";
import { getAdminSupabaseClient } from "@/lib/supabaseServer";
import { verifyAdminRequest } from "@/lib/adminAuthServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const supabase = getAdminSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ ok: false, error: "Database client not configured." }, { status: 500 });
    }

    // 1. Fetch exact count of PENDING appointments
    const { count, error: countError } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("status", "PENDING");

    if (countError) {
      if (countError.code === "PGRST205") {
        return NextResponse.json({ ok: true, pendingCount: 0, pendingList: [] });
      }
      return NextResponse.json({ ok: false, error: countError.message }, { status: 400 });
    }

    const pendingCount = count || 0;

    // 2. Fetch the top 6 most recent pending appointments for notification preview
    const { data: latestPending } = await supabase
      .from("appointments")
      .select("id, patient_name, phone, email, appointment_date, start_time, created_at, doctors(name), treatments(name)")
      .eq("status", "PENDING")
      .order("created_at", { ascending: false })
      .limit(6);

    const formattedList = (latestPending || []).map((apt) => {
      let docName = "Ayurvedic Doctor";
      if (apt.doctors) {
        if (Array.isArray(apt.doctors) && apt.doctors.length > 0) {
          docName = (apt.doctors[0] as { name?: string })?.name || docName;
        } else if (typeof apt.doctors === "object") {
          docName = (apt.doctors as { name?: string })?.name || docName;
        }
      }

      let treatName = "Ayurvedic Consultation";
      if (apt.treatments) {
        if (Array.isArray(apt.treatments) && apt.treatments.length > 0) {
          treatName = (apt.treatments[0] as { name?: string })?.name || treatName;
        } else if (typeof apt.treatments === "object") {
          treatName = (apt.treatments as { name?: string })?.name || treatName;
        }
      }

      return {
        id: apt.id,
        patientName: apt.patient_name,
        phone: apt.phone,
        email: apt.email,
        date: apt.appointment_date,
        time: apt.start_time,
        doctorName: docName,
        treatmentName: treatName,
        createdAt: apt.created_at,
      };
    });

    return NextResponse.json({
      ok: true,
      pendingCount,
      pendingList: formattedList,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
