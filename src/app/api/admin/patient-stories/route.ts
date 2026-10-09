import { NextResponse } from "next/server";
import { getAdminSupabaseClient, getServerPublicSupabaseClient, hasServiceRoleKey } from "@/lib/supabaseServer";
import { verifyAdminRequest } from "@/lib/adminAuthServer";
import type { Database } from "@/types/database.types";

type PatientStoryUpdate = Database["public"]["Tables"]["patient_stories"]["Update"];

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

    const { data, error } = await supabase
      .from("patient_stories")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

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
    const { patientName, name, location, treatment, story, quote, image, storagePath, rating, displayOrder, published } = body;

    const actualName = patientName || name;
    if (!actualName || typeof actualName !== "string" || !actualName.trim()) {
      return NextResponse.json({ ok: false, error: "Patient name is required" }, { status: 400 });
    }

    const actualStory = story || quote;
    if (!actualStory || typeof actualStory !== "string" || !actualStory.trim()) {
      return NextResponse.json({ ok: false, error: "Story testimonial is required" }, { status: 400 });
    }

    const numRating = Number(rating || 5);
    const validRating = Math.max(1, Math.min(5, isNaN(numRating) ? 5 : numRating));

    const newRow = {
      patient_name: actualName.trim(),
      location: location ? String(location).trim() : "Pilani",
      treatment: treatment?.trim() || "Panchakarma",
      story: actualStory.trim(),
      image: image || null,
      storage_path: storagePath || null,
      rating: validRating,
      display_order: typeof displayOrder === "number" ? displayOrder : 0,
      published: published !== false,
    };

    const { data, error } = await supabase
      .from("patient_stories")
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
    const { id, patientName, name, location, treatment, story, quote, image, storagePath, rating, displayOrder, published } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: "Story ID is required" }, { status: 400 });
    }

    const updates: PatientStoryUpdate = {};
    const actualName = patientName || name;
    if (actualName !== undefined) updates.patient_name = String(actualName).trim();
    if (location !== undefined) updates.location = String(location).trim();
    if (treatment !== undefined) updates.treatment = String(treatment).trim();
    const actualStory = story || quote;
    if (actualStory !== undefined) updates.story = String(actualStory).trim();
    if (image !== undefined) updates.image = image;
    if (storagePath !== undefined) updates.storage_path = storagePath;
    if (rating !== undefined) {
      const numRating = Number(rating);
      updates.rating = Math.max(1, Math.min(5, isNaN(numRating) ? 5 : numRating));
    }
    if (displayOrder !== undefined) updates.display_order = Number(displayOrder);
    if (published !== undefined) updates.published = Boolean(published);

    const { data, error } = await supabase
      .from("patient_stories")
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
      return NextResponse.json({ ok: false, error: "Story ID is required" }, { status: 400 });
    }

    const { error } = await supabase.from("patient_stories").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
