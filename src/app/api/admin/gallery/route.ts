import { NextResponse } from "next/server";
import { getAdminSupabaseClient, getServerPublicSupabaseClient, hasServiceRoleKey } from "@/lib/supabaseServer";
import { verifyAdminRequest } from "@/lib/adminAuthServer";
import type { Database } from "@/types/database.types";

type GalleryUpdate = Database["public"]["Tables"]["gallery"]["Update"];

const MAX_GALLERY_LIMIT = 50;

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
      .from("gallery")
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

    // Enforce 50-image limit per Requirement 5
    const { count, error: countError } = await supabase
      .from("gallery")
      .select("*", { count: "exact", head: true });

    if (!countError && count !== null && count >= MAX_GALLERY_LIMIT) {
      return NextResponse.json(
        { ok: false, error: "Gallery limit of 50 images reached." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { title, image, category, caption, storagePath, fileSize, displayOrder, published } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ ok: false, error: "Gallery title is required" }, { status: 400 });
    }

    if (!image || typeof image !== "string" || !image.trim()) {
      return NextResponse.json({ ok: false, error: "Image URL is required" }, { status: 400 });
    }

    const validCategory =
      category === "therapy" || category === "clinic" || category === "herbs"
        ? category
        : "clinic";

    const newRow = {
      title: title.trim(),
      image: image.trim(),
      category: validCategory,
      caption: caption ? String(caption).trim() : title.trim(),
      storage_path: storagePath || null,
      file_size: typeof fileSize === "number" ? fileSize : null,
      display_order: typeof displayOrder === "number" ? displayOrder : 0,
      published: published !== false,
    };

    const { data, error } = await supabase
      .from("gallery")
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
    const { id, title, image, category, caption, storagePath, fileSize, displayOrder, published } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: "Gallery item ID is required" }, { status: 400 });
    }

    const updates: GalleryUpdate = {};
    if (title !== undefined) updates.title = String(title).trim();
    if (image !== undefined) updates.image = String(image).trim();
    if (caption !== undefined) updates.caption = String(caption).trim();
    if (storagePath !== undefined) updates.storage_path = storagePath;
    if (fileSize !== undefined) updates.file_size = fileSize;
    if (displayOrder !== undefined) updates.display_order = Number(displayOrder);
    if (category !== undefined) {
      if (category === "therapy" || category === "clinic" || category === "herbs") {
        updates.category = category;
      }
    }
    if (published !== undefined) updates.published = Boolean(published);

    const { data, error } = await supabase
      .from("gallery")
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
      return NextResponse.json({ ok: false, error: "Gallery item ID is required" }, { status: 400 });
    }

    const { error } = await supabase.from("gallery").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
