import { NextResponse } from "next/server";
import { getAdminSupabaseClient, getServerPublicSupabaseClient } from "@/lib/supabaseServer";
import { DEFAULT_VACANCIES } from "@/lib/careersService";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** GET /api/careers – returns active job vacancies for the public careers page */
export async function GET() {
  try {
    // Prefer admin client for write/seed permissions, fallback to server public
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = (getAdminSupabaseClient() ?? getServerPublicSupabaseClient()) as any;
    if (!supabase) {
      return NextResponse.json({ ok: true, data: DEFAULT_VACANCIES.filter((v) => v.active) });
    }

    const { data, error } = await supabase
      .from("job_vacancies")
      .select("*")
      .eq("active", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    // Check if the only entries in the database are the old sample duplicate rows ("Ayurvedic Doctor (BAMS)")
    const isOnlyOldSampleData =
      Array.isArray(data) &&
      data.length > 0 &&
      data.every((row: { title?: string }) => row.title === "Ayurvedic Doctor (BAMS)");

    // Auto-seed all 8 official hospital vacancies directly into the database if empty or only old sample
    if (!error && (data.length === 0 || isOnlyOldSampleData)) {
      if (isOnlyOldSampleData) {
        // Clean out the old duplicate sample rows
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

      const { data: seeded } = await supabase
        .from("job_vacancies")
        .insert(rowsToInsert)
        .select();

      if (seeded && seeded.length > 0) {
        return NextResponse.json(
          { ok: true, data: seeded },
          { headers: { "Cache-Control": "no-store, max-age=0" } }
        );
      }
    }

    if (error || !data || data.length === 0) {
      return NextResponse.json(
        { ok: true, data: DEFAULT_VACANCIES.filter((v) => v.active) },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    return NextResponse.json(
      { ok: true, data },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch {
    return NextResponse.json(
      { ok: true, data: DEFAULT_VACANCIES.filter((v) => v.active) },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}
