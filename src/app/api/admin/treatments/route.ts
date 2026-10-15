import { NextResponse } from "next/server";
import { getAdminSupabaseClient, getServerPublicSupabaseClient, hasServiceRoleKey } from "@/lib/supabaseServer";
import { verifyAdminRequest } from "@/lib/adminAuthServer";
import type { Database } from "@/types/database.types";

type TreatmentUpdate = Database["public"]["Tables"]["treatments"]["Update"];

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
      .from("treatments")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      if (error.code === "PGRST205") {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Database table 'public.treatments' is not yet present in the Supabase schema cache. Please execute supabase/schema.sql in the Supabase Dashboard SQL Editor.",
          },
          { status: 500 }
        );
      }
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
    const { name, slug, shortDescription, description, duration, price, image, storagePath, active } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ ok: false, error: "Treatment name is required" }, { status: 400 });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return NextResponse.json({ ok: false, error: "Price cannot be negative" }, { status: 400 });
    }

    const generatedSlug = (slug || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const newRow = {
      name: name.trim(),
      slug: generatedSlug,
      short_description: shortDescription?.trim() || "",
      description: description?.trim() || shortDescription?.trim() || name.trim(),
      duration: duration?.trim() || "45 min",
      price: numPrice,
      image: image ? String(image).trim() : null,
      storage_path: storagePath || null,
      active: active !== false,
    };

    const { data, error } = await supabase
      .from("treatments")
      .insert(newRow)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST205") {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Database table 'public.treatments' is not yet present in the Supabase schema cache. Please execute supabase/schema.sql in the Supabase Dashboard SQL Editor.",
          },
          { status: 500 }
        );
      }
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
    const { id, name, slug, shortDescription, description, duration, price, image, storagePath, active } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: "Treatment ID is required" }, { status: 400 });
    }

    const updates: TreatmentUpdate = {};
    if (name !== undefined) updates.name = String(name).trim();
    if (slug !== undefined) updates.slug = String(slug).trim();
    if (shortDescription !== undefined) updates.short_description = String(shortDescription).trim();
    if (description !== undefined) updates.description = String(description).trim();
    if (duration !== undefined) updates.duration = String(duration).trim();
    if (price !== undefined) {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice < 0) {
        return NextResponse.json({ ok: false, error: "Price cannot be negative" }, { status: 400 });
      }
      updates.price = numPrice;
    }
    if (image !== undefined) updates.image = image ? String(image).trim() : null;
    if (storagePath !== undefined) updates.storage_path = storagePath || null;
    if (active !== undefined) updates.active = Boolean(active);

    const { data, error } = await supabase
      .from("treatments")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST205") {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Database table 'public.treatments' is not yet present in the Supabase schema cache. Please execute supabase/schema.sql in the Supabase Dashboard SQL Editor.",
          },
          { status: 500 }
        );
      }
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
      return NextResponse.json({ ok: false, error: "Treatment ID is required" }, { status: 400 });
    }

    // Clean up associated image from Supabase Storage
    const { data: treatment } = await supabase
      .from("treatments")
      .select("storage_path")
      .eq("id", id)
      .maybeSingle();

    if (treatment?.storage_path) {
      try {
        await supabase.storage.from("hospital-images").remove([treatment.storage_path]);
      } catch (storageErr) {
        console.warn("[Supabase Storage] Failed to remove treatment image:", storageErr);
      }
    }

    // Clean up any dependent appointments referencing this treatment to prevent FK constraint failure
    try {
      await supabase.from("appointments").delete().eq("treatment_id", id);
    } catch (aptErr) {
      console.warn("[Admin Treatments DELETE] Notice removing dependent appointments:", aptErr);
    }

    const { error } = await supabase.from("treatments").delete().eq("id", id);

    if (error) {
      if (error.code === "PGRST205") {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Database table 'public.treatments' is not yet present in the Supabase schema cache. Please execute supabase/schema.sql in the Supabase Dashboard SQL Editor.",
          },
          { status: 500 }
        );
      }
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
