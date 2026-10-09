import { NextResponse } from "next/server";
import { getAdminSupabaseClient, getServerPublicSupabaseClient, hasServiceRoleKey } from "@/lib/supabaseServer";
import { verifyAdminRequest } from "@/lib/adminAuthServer";
import type { Database } from "@/types/database.types";

type BlogUpdate = Database["public"]["Tables"]["blogs"]["Update"];

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
      .from("blogs")
      .select("*")
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
    const { title, slug, excerpt, content, featuredImage, storagePath, category, author, readTime, published, publishedAt } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ ok: false, error: "Blog title is required" }, { status: 400 });
    }

    const generatedSlug = (slug || title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const isPublished = Boolean(published);
    const pubDate = isPublished ? (publishedAt || new Date().toISOString()) : null;

    const newRow = {
      title: title.trim(),
      slug: generatedSlug,
      excerpt: excerpt?.trim() || "",
      content: Array.isArray(content) ? content.join("\n\n") : (content?.trim() || excerpt?.trim() || ""),
      category: category?.trim() || "Ayurvedic Care",
      author: author?.trim() || "Charak Medical Team",
      read_time: readTime?.trim() || "4 min read",
      featured_image: featuredImage || null,
      storage_path: storagePath || null,
      published: isPublished,
      published_at: pubDate,
    };

    const { data, error } = await supabase
      .from("blogs")
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
    const { id, title, slug, excerpt, content, featuredImage, storagePath, category, author, readTime, published, publishedAt } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: "Blog ID is required" }, { status: 400 });
    }

    const updates: BlogUpdate = {};
    if (title !== undefined) updates.title = String(title).trim();
    if (slug !== undefined) {
      updates.slug = String(slug)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
    if (excerpt !== undefined) updates.excerpt = String(excerpt).trim();
    if (content !== undefined) {
      updates.content = Array.isArray(content) ? content.join("\n\n") : String(content).trim();
    }
    if (category !== undefined) updates.category = String(category).trim();
    if (author !== undefined) updates.author = String(author).trim();
    if (readTime !== undefined) updates.read_time = String(readTime).trim();
    if (featuredImage !== undefined) updates.featured_image = featuredImage;
    if (storagePath !== undefined) updates.storage_path = storagePath;
    if (published !== undefined) {
      updates.published = Boolean(published);
      if (updates.published && !publishedAt) {
        updates.published_at = new Date().toISOString();
      } else if (!updates.published) {
        updates.published_at = null;
      }
    }
    if (publishedAt !== undefined) updates.published_at = publishedAt;

    const { data, error } = await supabase
      .from("blogs")
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
      return NextResponse.json({ ok: false, error: "Blog ID is required" }, { status: 400 });
    }

    const { data: item } = await supabase
      .from("blogs")
      .select("storage_path, featured_image")
      .eq("id", id)
      .maybeSingle();

    if (item?.storage_path) {
      try {
        await supabase.storage.from("hospital-images").remove([item.storage_path]);
      } catch (storageErr) {
        console.warn("[Admin Blogs DELETE] Failed to remove storage file:", storageErr);
      }
    }

    const { error } = await supabase.from("blogs").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
