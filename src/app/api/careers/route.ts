import { NextResponse } from "next/server";
import { getServerPublicSupabaseClient } from "@/lib/supabaseServer";
import { DEFAULT_VACANCIES } from "@/lib/careersService";

/** GET /api/careers  – returns active job vacancies for the public careers page */
export async function GET() {
  try {
    // Cast to any because job_vacancies is not yet in the auto-generated Database type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = getServerPublicSupabaseClient() as any;
    if (!supabase) {
      return NextResponse.json({ ok: true, data: DEFAULT_VACANCIES.filter((v) => v.active) });
    }

    const { data, error } = await supabase
      .from("job_vacancies")
      .select("*")
      .eq("active", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    // Auto-seed all 8 hospital vacancies directly into the database if empty
    if (!error && Array.isArray(data) && data.length === 0) {
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

      await supabase.from("job_vacancies").insert(rowsToInsert);
    }

    if (error || !data || data.length === 0) {
      return NextResponse.json({ ok: true, data: DEFAULT_VACANCIES.filter((v) => v.active) });
    }
    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json({ ok: true, data: DEFAULT_VACANCIES.filter((v) => v.active) });
  }
}
