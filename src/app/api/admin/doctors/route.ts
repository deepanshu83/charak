import { NextResponse } from "next/server";
import { getAdminSupabaseClient, getServerPublicSupabaseClient, hasServiceRoleKey } from "@/lib/supabaseServer";
import { verifyAdminRequest } from "@/lib/adminAuthServer";
import type { Database } from "@/types/database.types";

type DoctorUpdate = Database["public"]["Tables"]["doctors"]["Update"];

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

    const { data: doctors, error: docError } = await supabase
      .from("doctors")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (docError) {
      if (docError.code === "PGRST205") {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Database table 'public.doctors' is not yet present in the Supabase schema cache. Please execute supabase/schema.sql in the Supabase Dashboard SQL Editor.",
          },
          { status: 500 }
        );
      }
      return NextResponse.json({ ok: false, error: docError.message }, { status: 400 });
    }

    const { data: availabilities, error: availError } = await supabase
      .from("doctor_availability")
      .select("*")
      .order("created_at", { ascending: true });

    if (availError) {
      if (availError.code === "PGRST205") {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Database table 'public.doctor_availability' is not yet present in the Supabase schema cache. Please execute supabase/schema.sql in the Supabase Dashboard SQL Editor.",
          },
          { status: 500 }
        );
      }
      return NextResponse.json({ ok: false, error: availError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, data: { doctors, availabilities } });
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
    const {
      name,
      slug,
      designation,
      specialization,
      qualification,
      experience,
      bio,
      detailedBio,
      image,
      storagePath,
      consultationFee,
      displayOrder,
      active,
    } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ ok: false, error: "Doctor name is required" }, { status: 400 });
    }

    if (!specialization || typeof specialization !== "string" || !specialization.trim()) {
      return NextResponse.json({ ok: false, error: "Doctor specialization is required" }, { status: 400 });
    }

    const generatedSlug = (slug || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const newRow = {
      name: name.trim(),
      slug: generatedSlug,
      designation: designation?.trim() || specialization.trim(),
      specialization: specialization.trim(),
      qualification: qualification?.trim() || "BAMS",
      experience: experience?.trim() || "10 years",
      bio: bio?.trim() || "",
      detailed_bio: detailedBio?.trim() || bio?.trim() || "",
      image: image?.trim() || "",
      storage_path: storagePath || null,
      consultation_fee: Number(consultationFee) || 1200,
      display_order: Number(displayOrder) || 0,
      active: active !== false,
    };

    const { data, error } = await supabase
      .from("doctors")
      .insert(newRow)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST205") {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Database table 'public.doctors' is not yet present in the Supabase schema cache. Please execute supabase/schema.sql in the Supabase Dashboard SQL Editor.",
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
    const {
      id,
      name,
      slug,
      designation,
      specialization,
      qualification,
      experience,
      bio,
      detailedBio,
      image,
      storagePath,
      consultationFee,
      displayOrder,
      active,
    } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: "Doctor ID is required" }, { status: 400 });
    }

    const updates: DoctorUpdate = {};
    if (name !== undefined) updates.name = String(name).trim();
    if (slug !== undefined) {
      updates.slug = String(slug)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
    if (designation !== undefined) updates.designation = String(designation).trim();
    if (specialization !== undefined) updates.specialization = String(specialization).trim();
    if (qualification !== undefined) updates.qualification = String(qualification).trim();
    if (experience !== undefined) updates.experience = String(experience).trim();
    if (bio !== undefined) updates.bio = String(bio).trim();
    if (detailedBio !== undefined) updates.detailed_bio = String(detailedBio).trim();
    if (image !== undefined) updates.image = String(image).trim();
    if (storagePath !== undefined) updates.storage_path = storagePath;
    if (consultationFee !== undefined) updates.consultation_fee = Number(consultationFee);
    if (displayOrder !== undefined) updates.display_order = Number(displayOrder);
    if (active !== undefined) updates.active = Boolean(active);

    const { data, error } = await supabase
      .from("doctors")
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
              "Database table 'public.doctors' is not yet present in the Supabase schema cache. Please execute supabase/schema.sql in the Supabase Dashboard SQL Editor.",
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
      return NextResponse.json({ ok: false, error: "Doctor ID is required" }, { status: 400 });
    }

    // Clean up storage file if exists
    const { data: item } = await supabase
      .from("doctors")
      .select("storage_path, image")
      .eq("id", id)
      .maybeSingle();

    if (item?.storage_path) {
      try {
        await supabase.storage.from("hospital-images").remove([item.storage_path]);
      } catch (storageErr) {
        console.warn("[Admin Doctors DELETE] Failed to remove storage file:", storageErr);
      }
    }

    const { error } = await supabase.from("doctors").delete().eq("id", id);

    if (error) {
      if (error.code === "PGRST205") {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Database table 'public.doctors' is not yet present in the Supabase schema cache. Please execute supabase/schema.sql in the Supabase Dashboard SQL Editor.",
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
