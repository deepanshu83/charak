import { NextResponse } from "next/server";
import { getAdminSupabaseClient, getServerPublicSupabaseClient, hasServiceRoleKey } from "@/lib/supabaseServer";
import { verifyAdminRequest } from "@/lib/adminAuthServer";
import type { Database } from "@/types/database.types";

type DoctorAvailabilityUpdate = Database["public"]["Tables"]["doctor_availability"]["Update"];

export async function GET(req: Request) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const supabase = getAdminSupabaseClient() || getServerPublicSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { ok: false, error: "Database client not configured" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId");

    let query = supabase.from("doctor_availability").select("*");
    if (doctorId) {
      query = query.eq("doctor_id", doctorId);
    }

    const { data, error } = await query.order("day_of_week", { ascending: true });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
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

    const body = await req.json();
    const { doctorId, dayOfWeek, startTime, endTime, slotDuration, active } = body;

    if (!doctorId) {
      return NextResponse.json({ ok: false, error: "Doctor ID is required" }, { status: 400 });
    }

    // Verify doctor exists
    const { data: doc, error: docErr } = await supabase
      .from("doctors")
      .select("id")
      .eq("id", doctorId)
      .maybeSingle();

    if (docErr || !doc) {
      return NextResponse.json({ ok: false, error: "Doctor does not exist" }, { status: 404 });
    }

    if (!dayOfWeek) {
      return NextResponse.json({ ok: false, error: "Day of week is required" }, { status: 400 });
    }

    if (!startTime || !endTime) {
      return NextResponse.json({ ok: false, error: "Start and end times are required" }, { status: 400 });
    }

    if (startTime >= endTime) {
      return NextResponse.json({ ok: false, error: "Start time must be before end time" }, { status: 400 });
    }

    const duration = Number(slotDuration || 30);
    if (isNaN(duration) || duration <= 0) {
      return NextResponse.json({ ok: false, error: "Slot duration must be a positive integer" }, { status: 400 });
    }

    const newRow = {
      doctor_id: doctorId,
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
      slot_duration: duration,
      active: active !== false,
    };

    const { data, error } = await supabase
      .from("doctor_availability")
      .insert(newRow)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
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

    const body = await req.json();
    const { id, dayOfWeek, startTime, endTime, slotDuration, active } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: "Availability slot ID is required" }, { status: 400 });
    }

    const updates: DoctorAvailabilityUpdate = {};
    if (dayOfWeek !== undefined) updates.day_of_week = dayOfWeek;
    if (startTime !== undefined && endTime !== undefined) {
      if (startTime >= endTime) {
        return NextResponse.json({ ok: false, error: "Start time must be before end time" }, { status: 400 });
      }
      updates.start_time = startTime;
      updates.end_time = endTime;
    }
    if (slotDuration !== undefined) {
      const duration = Number(slotDuration);
      if (isNaN(duration) || duration <= 0) {
        return NextResponse.json({ ok: false, error: "Slot duration must be positive" }, { status: 400 });
      }
      updates.slot_duration = duration;
    }
    if (active !== undefined) updates.active = Boolean(active);

    const { data, error } = await supabase
      .from("doctor_availability")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
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
      return NextResponse.json({ ok: false, error: "Availability ID is required" }, { status: 400 });
    }

    const { error } = await supabase.from("doctor_availability").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
