import { NextResponse } from "next/server";
import { getAdminSupabaseClient, getServerPublicSupabaseClient } from "@/lib/supabaseServer";
import { verifyAdminRequest } from "@/lib/adminAuthServer";
import { DEFAULT_VACANCIES } from "@/lib/careersService";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// job_vacancies is a new table not yet present in the auto-generated Database type.
// We cast to `any` here and rely on runtime correctness + the migration SQL.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDb(): any {
  return getAdminSupabaseClient() ?? getServerPublicSupabaseClient();
}

// ─── GET  /api/admin/careers  → list all vacancies ───────────────────────────
export async function GET(req: Request) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized)
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });

    const supabase = getDb();
    if (!supabase)
      return NextResponse.json({ ok: false, error: "DB not configured" }, { status: 500 });

    const { data, error } = await supabase
      .from("job_vacancies")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    // Check if the only entries in the database are the old sample duplicate rows ("Ayurvedic Doctor (BAMS)")
    const isOnlyOldSampleData =
      Array.isArray(data) &&
      data.length > 0 &&
      data.every((row: { title?: string }) => row.title === "Ayurvedic Doctor (BAMS)");

    // Auto-seed all 8 hospital vacancies directly into the database if the table is empty or only old sample!
    if (!error && (data.length === 0 || isOnlyOldSampleData)) {
      if (isOnlyOldSampleData) {
        await supabase.from("job_vacancies").delete().eq("title", "Ayurvedic Doctor (BAMS)");
      }

      const rowsToInsert = DEFAULT_VACANCIES.map((v) => ({
        title: v.title,
        department: v.department,
        location: v.location,
        type: v.type,
        experience: v.experience,
        description: v.description,
        requirements: v.requirements,
        salary_range: v.salaryRange,
        apply_email: v.applyEmail,
        active: v.active,
        display_order: v.displayOrder,
      }));

      const { data: inserted, error: insertError } = await supabase
        .from("job_vacancies")
        .insert(rowsToInsert)
        .select();

      if (!insertError && inserted && inserted.length > 0) {
        return NextResponse.json({ ok: true, data: inserted });
      }
    }

    if (error || !data || data.length === 0) {
      return NextResponse.json({ ok: true, data: DEFAULT_VACANCIES });
    }
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

// ─── POST  /api/admin/careers  → create vacancy ──────────────────────────────
export async function POST(req: Request) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized)
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });

    const body = await req.json();
    const supabase = getDb();
    if (!supabase)
      return NextResponse.json({ ok: false, error: "DB not configured" }, { status: 500 });

    const { data, error } = await supabase
      .from("job_vacancies")
      .insert({
        title: body.title,
        department: body.department,
        location: body.location ?? "Pilani, Rajasthan",
        type: body.type ?? "Full-time",
        experience: body.experience ?? "Fresher",
        description: body.description,
        requirements: body.requirements ?? null,
        salary_range: body.salaryRange ?? null,
        apply_email: body.applyEmail ?? null,
        active: body.active ?? true,
        display_order: body.displayOrder ?? 0,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

// ─── PATCH  /api/admin/careers  → update vacancy ─────────────────────────────
export async function PATCH(req: Request) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized)
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });

    const body = await req.json();
    const { id, ...rest } = body;
    if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });

    const supabase = getDb();
    if (!supabase)
      return NextResponse.json({ ok: false, error: "DB not configured" }, { status: 500 });

    const patch: Record<string, unknown> = {};
    if (rest.title !== undefined) patch.title = rest.title;
    if (rest.department !== undefined) patch.department = rest.department;
    if (rest.location !== undefined) patch.location = rest.location;
    if (rest.type !== undefined) patch.type = rest.type;
    if (rest.experience !== undefined) patch.experience = rest.experience;
    if (rest.description !== undefined) patch.description = rest.description;
    if (rest.requirements !== undefined) patch.requirements = rest.requirements;
    if (rest.salaryRange !== undefined) patch.salary_range = rest.salaryRange;
    if (rest.applyEmail !== undefined) patch.apply_email = rest.applyEmail;
    if (rest.active !== undefined) patch.active = rest.active;
    if (rest.displayOrder !== undefined) patch.display_order = rest.displayOrder;

    const { data, error } = await supabase
      .from("job_vacancies")
      .update(patch)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

// ─── DELETE  /api/admin/careers?id=…  → delete vacancy ──────────────────────
export async function DELETE(req: Request) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized)
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });

    const supabase = getDb();
    if (!supabase)
      return NextResponse.json({ ok: false, error: "DB not configured" }, { status: 500 });

    const { error } = await supabase.from("job_vacancies").delete().eq("id", id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
