import { NextResponse } from "next/server";
import { getAdminSupabaseClient, getServerPublicSupabaseClient, hasServiceRoleKey } from "@/lib/supabaseServer";
import { verifyAdminRequest } from "@/lib/adminAuthServer";
import type { Database } from "@/types/database.types";

type VideoTestimonialUpdate = Database["public"]["Tables"]["video_testimonials"]["Update"];

const MAX_VIDEOS_LIMIT = 10;

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
      .from("video_testimonials")
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

    // Check 10-video limit per Requirement 6
    const { count, error: countError } = await supabase
      .from("video_testimonials")
      .select("*", { count: "exact", head: true });

    if (!countError && count !== null && count >= MAX_VIDEOS_LIMIT) {
      return NextResponse.json(
        { ok: false, error: "Maximum 10 video testimonials allowed." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      title,
      patientName,
      description,
      videoUrl,
      storagePath,
      thumbnailUrl,
      thumbnailStoragePath,
      fileSize,
      duration,
      published,
      displayOrder,
    } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ ok: false, error: "Video title is required" }, { status: 400 });
    }

    if (!patientName || typeof patientName !== "string" || !patientName.trim()) {
      return NextResponse.json(
        { ok: false, error: "Patient / testimonial name is required" },
        { status: 400 }
      );
    }

    if (!videoUrl || typeof videoUrl !== "string" || !videoUrl.trim()) {
      return NextResponse.json({ ok: false, error: "Video URL is required" }, { status: 400 });
    }

    const newRow = {
      title: title.trim(),
      patient_name: patientName.trim(),
      description: description ? String(description).trim() : null,
      video_url: videoUrl.trim(),
      storage_path: storagePath || null,
      thumbnail_url: thumbnailUrl || null,
      thumbnail_storage_path: thumbnailStoragePath || null,
      file_size: typeof fileSize === "number" ? fileSize : null,
      duration: typeof duration === "number" ? duration : null,
      published: published !== false,
      display_order: typeof displayOrder === "number" ? displayOrder : 0,
    };

    const { data, error } = await supabase
      .from("video_testimonials")
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
    const {
      id,
      title,
      patientName,
      description,
      videoUrl,
      storagePath,
      thumbnailUrl,
      thumbnailStoragePath,
      fileSize,
      duration,
      published,
      displayOrder,
    } = body;

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Video testimonial ID is required" },
        { status: 400 }
      );
    }

    const updates: VideoTestimonialUpdate = {};
    if (title !== undefined) updates.title = String(title).trim();
    if (patientName !== undefined) updates.patient_name = String(patientName).trim();
    if (description !== undefined) updates.description = String(description).trim();
    if (videoUrl !== undefined) updates.video_url = String(videoUrl).trim();
    if (storagePath !== undefined) updates.storage_path = storagePath;
    if (thumbnailUrl !== undefined) updates.thumbnail_url = thumbnailUrl;
    if (thumbnailStoragePath !== undefined) updates.thumbnail_storage_path = thumbnailStoragePath;
    if (fileSize !== undefined) updates.file_size = fileSize;
    if (duration !== undefined) updates.duration = duration;
    if (published !== undefined) updates.published = Boolean(published);
    if (displayOrder !== undefined) updates.display_order = Number(displayOrder);

    const { data, error } = await supabase
      .from("video_testimonials")
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
      return NextResponse.json(
        { ok: false, error: "Video testimonial ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("video_testimonials").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
