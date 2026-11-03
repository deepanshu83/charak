import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/adminAuthServer";

export const runtime = "nodejs";

const execFileAsync = promisify(execFile);
const MAX_SOURCE_SIZE = 100 * 1024 * 1024;
const MAX_OUTPUT_SIZE = 10 * 1024 * 1024;
const SUPPORTED_VIDEO_EXTENSIONS = new Set(["mp4", "mov", "m4v", "webm", "3gp", "3g2"]);
const AUDIO_BITRATE = 96_000;

interface ProbeResult {
  format?: { duration?: string };
  streams?: Array<{
    codec_type?: string;
    width?: number;
    height?: number;
  }>;
}

function getErrorCode(error: unknown): string | undefined {
  if (error instanceof Error && "code" in error && typeof error.code === "string") {
    return error.code;
  }
  return undefined;
}

export async function POST(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { ok: false, error: auth.error || "Unauthorized" },
      { status: auth.status }
    );
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_SOURCE_SIZE + 1024 * 1024) {
    return NextResponse.json(
      { ok: false, error: "The source video exceeds the 100 MB limit." },
      { status: 413 }
    );
  }

  let temporaryDirectory: string | null = null;
  let processingStage: "probe" | "transcode" = "probe";

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "No video file was provided." },
        { status: 400 }
      );
    }

    const extension = path.extname(file.name).slice(1).toLowerCase();
    if (!SUPPORTED_VIDEO_EXTENSIONS.has(extension)) {
      return NextResponse.json(
        { ok: false, error: "Choose an MP4, MOV, M4V, WEBM, 3GP, or 3G2 video." },
        { status: 400 }
      );
    }
    if (file.size === 0 || file.size > MAX_SOURCE_SIZE) {
      return NextResponse.json(
        { ok: false, error: "The source video must be between 1 byte and 100 MB." },
        { status: 413 }
      );
    }

    temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "charak-video-"));
    const inputPath = path.join(temporaryDirectory, `source.${extension}`);
    const outputPath = path.join(temporaryDirectory, "converted.mp4");
    await writeFile(inputPath, Buffer.from(await file.arrayBuffer()));

    const ffprobePath = process.env.FFPROBE_PATH || "ffprobe";
    const ffmpegPath = process.env.FFMPEG_PATH || "ffmpeg";
    const probeOutput = await execFileAsync(
      ffprobePath,
      [
        "-v",
        "error",
        "-show_entries",
        "format=duration:stream=codec_type,width,height",
        "-of",
        "json",
        inputPath,
      ],
      { encoding: "utf8", timeout: 30_000, maxBuffer: 1024 * 1024 }
    );
    const probe = JSON.parse(probeOutput.stdout) as ProbeResult;
    const videoStream = probe.streams?.find((stream) => stream.codec_type === "video");
    const duration = Number(probe.format?.duration);
    const sourceWidth = Number(videoStream?.width);
    const sourceHeight = Number(videoStream?.height);

    if (
      !videoStream ||
      !Number.isFinite(duration) ||
      duration <= 0 ||
      !Number.isFinite(sourceWidth) ||
      sourceWidth <= 0 ||
      !Number.isFinite(sourceHeight) ||
      sourceHeight <= 0
    ) {
      return NextResponse.json(
        { ok: false, error: "The server could not read this video. Please try another file." },
        { status: 400 }
      );
    }

    const scale = Math.min(1, 1280 / sourceWidth, 720 / sourceHeight);
    const width = Math.max(2, Math.floor((sourceWidth * scale) / 2) * 2);
    const height = Math.max(2, Math.floor((sourceHeight * scale) / 2) * 2);
    const targetVideoBitrate = Math.max(
      100_000,
      Math.min(2_500_000, Math.floor((MAX_OUTPUT_SIZE * 0.82 * 8) / duration - AUDIO_BITRATE))
    );

    processingStage = "transcode";
    await execFileAsync(
      ffmpegPath,
      [
        "-hide_banner",
        "-loglevel",
        "error",
        "-nostdin",
        "-y",
        "-i",
        inputPath,
        "-map",
        "0:v:0",
        "-map",
        "0:a:0?",
        "-vf",
        "scale=w='min(1280,iw)':h='min(720,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2,fps=24",
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-pix_fmt",
        "yuv420p",
        "-b:v",
        String(targetVideoBitrate),
        "-maxrate",
        String(Math.round(targetVideoBitrate * 1.15)),
        "-bufsize",
        String(targetVideoBitrate * 2),
        "-c:a",
        "aac",
        "-b:a",
        String(AUDIO_BITRATE),
        "-map_metadata",
        "-1",
        "-movflags",
        "+faststart",
        "-threads",
        "2",
        outputPath,
      ],
      { encoding: "utf8", timeout: 180_000, maxBuffer: 1024 * 1024 }
    );

    const outputStats = await stat(outputPath);
    if (outputStats.size === 0) {
      return NextResponse.json(
        { ok: false, error: "Video conversion produced an empty file. Please try another video." },
        { status: 422 }
      );
    }
    if (outputStats.size > MAX_OUTPUT_SIZE) {
      return NextResponse.json(
        { ok: false, error: "The converted video exceeds 10 MB. Please trim the video and try again." },
        { status: 413 }
      );
    }

    const output = await readFile(outputPath);
    return new Response(new Uint8Array(output), {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": String(outputStats.size),
        "Cache-Control": "no-store",
        "X-Video-Duration": String(Math.round(duration)),
        "X-Video-Width": String(width),
        "X-Video-Height": String(height),
      },
    });
  } catch (error) {
    const errorCode = getErrorCode(error);
    if (errorCode === "ENOENT") {
      return NextResponse.json(
        {
          ok: false,
          error: "Server video conversion is unavailable. Install FFmpeg and ffprobe, then restart the app.",
        },
        { status: 503 }
      );
    }
    if (errorCode === "ETIMEDOUT") {
      return NextResponse.json(
        { ok: false, error: "Video conversion took too long. Please trim the video and try again." },
        { status: 408 }
      );
    }

    console.error(`[Video Transcode API] ${processingStage} failed:`, error);
    return NextResponse.json(
      {
        ok: false,
        error:
          processingStage === "probe"
            ? "The server could not decode this video. The file may be damaged or use an unsupported codec."
            : "Video conversion failed. Please try a shorter video or another format.",
      },
      { status: 422 }
    );
  } finally {
    if (temporaryDirectory) {
      await rm(temporaryDirectory, { recursive: true, force: true }).catch((error: unknown) => {
        console.error("[Video Transcode API] Temporary file cleanup failed:", error);
      });
    }
  }
}
