import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getAdminSupabaseClient, hasServiceRoleKey } from "@/lib/supabaseServer";
import { verifyAdminRequest } from "@/lib/adminAuthServer";

export async function POST(req: Request) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ ok: false, error: auth.error || "Unauthorized" }, { status: auth.status });
    }

    const body = await req.json();
    const { storagePath, bucket } = body;

    if (!storagePath || typeof storagePath !== "string") {
      return NextResponse.json({ ok: false, error: "Storage path is required." }, { status: 400 });
    }

    if (!hasServiceRoleKey()) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Server Configuration Error: SUPABASE_SERVICE_ROLE_KEY is required in .env.local for administrative media operations. Please configure SUPABASE_SERVICE_ROLE_KEY in .env.local.",
        },
        { status: 500 }
      );
    }

    const targetBucket = bucket === "hospital-videos" ? "hospital-videos" : "hospital-images";

    let supabaseDeleted = false;
    let localDeleted = false;

    // 1. Delete from Supabase Storage
    const supabase = getAdminSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.storage.from(targetBucket).remove([storagePath]);
        if (!error) {
          supabaseDeleted = true;
        } else {
          console.warn(`[Supabase Storage Delete Notice] ${targetBucket}/${storagePath}: ${error.message}`);
        }
      } catch (err) {
        console.warn("[Supabase Storage Delete Notice] Error:", err);
      }
    }

    // 2. Delete from local upload folder if present
    try {
      const localFilePath = path.join(process.cwd(), "public", "uploads", targetBucket, storagePath);
      await fs.unlink(localFilePath);
      localDeleted = true;
    } catch {
      // file might not exist locally, which is fine
    }

    return NextResponse.json({
      ok: true,
      message: "Media object removed successfully.",
      storagePath,
      bucket: targetBucket,
      deletedFrom: {
        supabase: supabaseDeleted,
        local: localDeleted,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[Media Delete API] Error:", err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
