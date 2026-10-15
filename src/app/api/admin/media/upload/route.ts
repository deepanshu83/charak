import { NextResponse } from "next/server";
import path from "path";
import { getAdminSupabaseClient, hasServiceRoleKey } from "@/lib/supabaseServer";
import { verifyAdminRequest } from "@/lib/adminAuthServer";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10 MB (per Requirement 7)

const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const ALLOWED_VIDEO_MIMES = new Set([
  "video/mp4",
  "video/webm",
]);

/**
 * Server-side magic bytes validation to verify file type isn't spoofed.
 */
function detectMimeFromBytes(buffer: Buffer): string | null {
  if (buffer.length < 4) return null;

  // JPEG: FF D8
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    return "image/jpeg";
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  // WebP: RIFF ... WEBP
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }

  // GIF: GIF87a or GIF89a
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return "image/gif";
  }

  // WebM: 1A 45 DF A3
  if (
    buffer[0] === 0x1a &&
    buffer[1] === 0x45 &&
    buffer[2] === 0xdf &&
    buffer[3] === 0xa3
  ) {
    return "video/webm";
  }

  // MP4: ftyp box at offset 4
  if (buffer.length >= 8) {
    const boxType = buffer.subarray(4, 8).toString("ascii");
    if (boxType === "ftyp") {
      return "video/mp4";
    }
  }

  return null;
}

function getSafeExtension(originalName: string, mime: string): string {
  if (mime === "image/webp") return "webp";
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "video/mp4") return "mp4";
  if (mime === "video/webm") return "webm";

  const ext = path.extname(originalName).replace(".", "").toLowerCase();
  return ext || "bin";
}

export async function POST(req: Request) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ ok: false, error: auth.error || "Unauthorized" }, { status: auth.status });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bucket = ((formData.get("bucket") as string) || "hospital-images").trim();
    const folder = ((formData.get("folder") as string) || "general").replace(/[^a-zA-Z0-9_-]/g, "");

    if (!file) {
      return NextResponse.json({ ok: false, error: "No media file provided." }, { status: 400 });
    }

    if (bucket !== "hospital-images" && bucket !== "hospital-videos") {
      return NextResponse.json(
        { ok: false, error: "Invalid storage bucket specified." },
        { status: 400 }
      );
    }

    // Final Media Rule: Video upload is allowed ONLY for Patient / Customer Testimonials
    if (bucket === "hospital-videos" && folder !== "testimonials") {
      return NextResponse.json(
        { ok: false, error: "Video upload is strictly permitted only for Patient / Customer Testimonials." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. File Size Validation
    const maxSize = bucket === "hospital-videos" ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (buffer.length > maxSize) {
      const limitMb = Math.round(maxSize / (1024 * 1024));
      return NextResponse.json(
        { ok: false, error: `File size exceeds maximum limit of ${limitMb} MB.` },
        { status: 400 }
      );
    }

    // 2. MIME & Magic Bytes Validation
    let detectedMime = detectMimeFromBytes(buffer) || (file.type ? file.type.toLowerCase() : "");

    if (bucket === "hospital-images") {
      const ext = path.extname(file.name).replace(".", "").toLowerCase();
      if (!detectedMime || detectedMime === "application/octet-stream" || detectedMime === "binary/octet-stream") {
        if (ext === "webp") detectedMime = "image/webp";
        else if (ext === "jpg" || ext === "jpeg") detectedMime = "image/jpeg";
        else if (ext === "png") detectedMime = "image/png";
        else detectedMime = "image/webp"; // default for compressed hospital product photos
      }
      if (detectedMime === "image/jpg") detectedMime = "image/jpeg";

      if (!ALLOWED_IMAGE_MIMES.has(detectedMime)) {
        return NextResponse.json(
          { ok: false, error: "Please upload JPG, PNG or WEBP." },
          { status: 400 }
        );
      }
    } else {
      if (!ALLOWED_VIDEO_MIMES.has(detectedMime)) {
        return NextResponse.json(
          { ok: false, error: "Please upload MP4 or WEBM video." },
          { status: 400 }
        );
      }
    }

    // 3. Build sanitized filename and storage path
    const ext = getSafeExtension(file.name, detectedMime);
    const sanitizedBase = path
      .basename(file.name, path.extname(file.name))
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 32);
    const filename = `${Date.now()}-${sanitizedBase || "media"}.${ext}`;
    const storagePath = `${folder}/${filename}`;

    // 4. Upload directly to Supabase Storage using privileged server client
    if (!hasServiceRoleKey()) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Server Configuration Error: SUPABASE_SERVICE_ROLE_KEY is required in .env.local for administrative media uploads. Please configure SUPABASE_SERVICE_ROLE_KEY in .env.local (found in Supabase Dashboard -> Project Settings -> API Keys -> service_role secret).",
        },
        { status: 500 }
      );
    }

    const supabase = getAdminSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Supabase client not configured on server. Please configure SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in .env.local.",
        },
        { status: 500 }
      );
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(storagePath, buffer, {
        contentType: detectedMime,
        upsert: true,
      });

    if (error) {
      console.error(`[Supabase Storage Error] Upload to ${bucket}/${storagePath}:`, error.message);

      let status = 500;
      const errMsg = error.message || "Failed to upload file to storage.";
      const lower = errMsg.toLowerCase();

      if (lower.includes("bucket not found") || lower.includes("not found")) {
        status = 500; // Bucket missing in Supabase project
      } else if (
        lower.includes("row-level security") ||
        lower.includes("permission denied") ||
        lower.includes("unauthorized") ||
        lower.includes("jwt")
      ) {
        status = 403; // Storage permission/RLS policy issue
      } else if (
        lower.includes("payload too large") ||
        lower.includes("size") ||
        lower.includes("invalid")
      ) {
        status = 400; // File size or validation issue
      }

      return NextResponse.json(
        {
          ok: false,
          error: `Supabase Storage upload failed: ${errMsg}`,
          bucket,
          storagePath,
        },
        { status }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          ok: false,
          error: "Supabase Storage returned an empty response.",
        },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(storagePath);
    const publicUrl = urlData.publicUrl;

    return NextResponse.json({
      ok: true,
      url: publicUrl,
      publicUrl,
      storagePath,
      bucket,
      filename,
      fileType: detectedMime,
      fileSize: buffer.length,
      storage: "supabase",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[Media Upload API] Error:", err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
