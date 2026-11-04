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

    if (error || !data || data.length === 0) {
      return NextResponse.json({ ok: true, data: DEFAULT_VACANCIES.filter((v) => v.active) });
    }
    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json({ ok: true, data: DEFAULT_VACANCIES.filter((v) => v.active) });
  }
}
