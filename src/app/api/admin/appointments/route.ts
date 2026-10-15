import { NextResponse } from "next/server";
import { getAdminSupabaseClient, hasServiceRoleKey } from "@/lib/supabaseServer";
import { verifyAdminRequest } from "@/lib/adminAuthServer";
import type { Database } from "@/types/database.types";
import type { AppointmentStatus } from "@/types";

type AppointmentUpdate = Database["public"]["Tables"]["appointments"]["Update"];

export async function GET(req: Request) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const supabase = getAdminSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { ok: false, error: "Database client not configured. SUPABASE_SERVICE_ROLE_KEY is required in .env.local." },
        { status: 500 }
      );
    }

    const { data: appointments, error } = await supabase
      .from("appointments")
      .select("*, doctors(name, specialization), treatments(name)")
      .order("appointment_date", { ascending: false });

    if (error) {
      if (error.code === "PGRST205") {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Database table 'public.appointments' is not yet present in the Supabase schema cache. Please execute supabase/schema.sql in the Supabase Dashboard SQL Editor.",
          },
          { status: 500 }
        );
      }
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    if (!appointments || appointments.length === 0) {
      return NextResponse.json({ ok: true, data: [] });
    }

    const unifiedAppointments = appointments.map((apt) => {
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
        doctorId: apt.doctor_id,
        treatmentId: apt.treatment_id,
        doctorName: docName,
        treatmentName: treatName,
        date: apt.appointment_date,
        time: apt.start_time?.slice(0, 5) || "09:00",
        startTime: apt.start_time,
        endTime: apt.end_time,
        status: apt.status as AppointmentStatus,
        paymentStatus: apt.payment_status,
        notes: apt.notes || "",
        createdAt: apt.created_at,
      };
    });

    return NextResponse.json({ ok: true, data: unifiedAppointments });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    if (!hasServiceRoleKey()) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Server Configuration Error: SUPABASE_SERVICE_ROLE_KEY is required in .env.local for administrative write operations. Please configure SUPABASE_SERVICE_ROLE_KEY in .env.local.",
        },
        { status: 500 }
      );
    }

    const supabase = getAdminSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { ok: false, error: "Database client not configured" },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "Invalid JSON request body" }, { status: 400 });
    }
    const { id, status, paymentStatus, notes } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: "Appointment ID is required" }, { status: 400 });
    }

    const validStatuses: AppointmentStatus[] = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"];
    if (status !== undefined && !validStatuses.includes(status)) {
      return NextResponse.json({ ok: false, error: "Invalid appointment status" }, { status: 400 });
    }

    const updates: AppointmentUpdate = {};
    if (status) updates.status = status;
    if (paymentStatus) updates.payment_status = paymentStatus;
    if (notes !== undefined) updates.notes = String(notes);

    const { data, error } = await supabase
      .from("appointments")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST205") {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Database table 'public.appointments' is not yet present in the Supabase schema cache. Please execute supabase/schema.sql in the Supabase Dashboard SQL Editor.",
          },
          { status: 500 }
        );
      }
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    if (!hasServiceRoleKey()) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Server Configuration Error: SUPABASE_SERVICE_ROLE_KEY is required in .env.local for administrative write operations. Please configure SUPABASE_SERVICE_ROLE_KEY in .env.local.",
        },
        { status: 500 }
      );
    }

    const supabase = getAdminSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { ok: false, error: "Database client not configured" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ ok: false, error: "Appointment ID is required" }, { status: 400 });
    }

    const { error } = await supabase.from("appointments").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
