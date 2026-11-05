import { NextResponse } from "next/server";
import { getServerPublicSupabaseClient } from "@/lib/supabaseServer";
import { DEFAULT_VIDEO_TESTIMONIALS } from "@/lib/videoTestimonialService";

export async function GET() {
  try {
    const supabase = getServerPublicSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ ok: true, data: DEFAULT_VIDEO_TESTIMONIALS });
    }

    const { data, error } = await supabase
      .from("video_testimonials")
      .select("*")
      .eq("published", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ ok: true, data: DEFAULT_VIDEO_TESTIMONIALS });
    }

    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json({ ok: true, data: DEFAULT_VIDEO_TESTIMONIALS });
  }
}
