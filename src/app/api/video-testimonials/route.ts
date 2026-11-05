import { NextResponse } from "next/server";
import { getServerPublicSupabaseClient } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const supabase = getServerPublicSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ ok: true, data: [] });
    }

    const { data, error } = await supabase
      .from("video_testimonials")
      .select("*")
      .eq("published", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data) {
      return NextResponse.json({ ok: true, data: [] });
    }

    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json({ ok: true, data: [] });
  }
}
