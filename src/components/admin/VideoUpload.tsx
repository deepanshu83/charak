"use client";

import React, { useState, useRef } from "react";
import { Video, UploadCloud, AlertCircle, RefreshCw, X, CheckCircle } from "lucide-react";

export interface VideoUploadResult {
  videoUrl: string;
  storagePath?: string;
  thumbnailUrl?: string;
  thumbnailStoragePath?: string;
  fileSize?: number;
  duration?: number;
}

interface VideoUploadProps {
  value?: string;
  thumbnailUrl?: string;
  onChange: (result: VideoUploadResult) => void;
  folder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

const MAX_SOURCE_SIZE = 100 * 1024 * 1024;
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
const SUPPORTED_VIDEO_EXTENSIONS = new Set(["mp4", "mov", "m4v", "webm", "3gp", "3g2"]);

function getVideoExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() || "";
}

/**
 * Compresses video on the client side using HTML5 Video + Canvas + MediaRecorder.
 * Scales resolution (up to 720p) and controls bitrate so the final file stays under 10 MB.
 */
async function compressVideoInBrowser(
  file: File,
  targetMaxBytes: number = 9.8 * 1024 * 1024,
  onProgress?: (progressPercent: number) => void
): Promise<{ blob: Blob; duration: number; width: number; height: number }> {
  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.preload = "auto";
  video.playsInline = true;
  video.muted = true;

  try {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error("Video format or codec is not supported by your browser for in-browser compression. Please upload an MP4 under 10 MB."));
      }, 8000);

      const onMeta = () => {
        cleanup();
        resolve();
      };
      const onErr = () => {
        cleanup();
        reject(new Error("Unable to read video file for compression. Please ensure it is standard H.264 MP4."));
      };

      function cleanup() {
        clearTimeout(timer);
        video.onloadedmetadata = null;
        video.onerror = null;
      }

      video.onloadedmetadata = onMeta;
      video.onerror = onErr;
      video.src = objectUrl;
    });

    const duration = video.duration;
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new Error("Could not determine video duration.");
    }

    // Determine target dimensions (cap at 720p, preserve aspect ratio)
    const srcW = video.videoWidth || 1280;
    const srcH = video.videoHeight || 720;
    const scale = Math.min(1, 1280 / srcW, 720 / srcH);
    const targetW = Math.max(2, Math.floor((srcW * scale) / 2) * 2);
    const targetH = Math.max(2, Math.floor((srcH * scale) / 2) * 2);

    // Target bitrate in bps based on duration to guarantee size < targetMaxBytes
    // size = (bitrate / 8) * duration => bitrate = (size * 8) / duration
    const targetBitrate = Math.max(
      200_000,
      Math.min(2_000_000, Math.floor((targetMaxBytes * 0.85 * 8) / duration))
    );

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not initialize canvas context.");

    const stream = canvas.captureStream(24);

    // Capture audio if present
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaElementSource(video);
      const dest = audioCtx.createMediaStreamDestination();
      source.connect(dest);
      source.connect(audioCtx.destination);
      dest.stream.getAudioTracks().forEach((track) => stream.addTrack(track));
    } catch {
      // Audio extraction may fail on some browsers, video will compress without audio stream
    }

    let mimeType = "video/webm;codecs=vp8,opus";
    if (MediaRecorder.isTypeSupported("video/mp4;codecs=avc1,mp4a.40.2")) {
      mimeType = "video/mp4;codecs=avc1,mp4a.40.2";
    } else if (MediaRecorder.isTypeSupported("video/mp4")) {
      mimeType = "video/mp4";
    } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")) {
      mimeType = "video/webm;codecs=vp9,opus";
    } else if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = "video/webm";
    }

    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: targetBitrate,
    });

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    const completionPromise = new Promise<Blob>((resolve, reject) => {
      recorder.onstop = () => {
        const finalBlob = new Blob(chunks, { type: mimeType.split(";")[0] });
        resolve(finalBlob);
      };
      recorder.onerror = (e) => reject(e);
    });

    recorder.start(100);

    let animationId: number;
    const drawFrame = () => {
      if (!video.paused && !video.ended) {
        ctx.drawImage(video, 0, 0, targetW, targetH);
        if (onProgress && duration > 0) {
          const pct = Math.min(99, Math.round((video.currentTime / duration) * 100));
          onProgress(pct);
        }
        animationId = requestAnimationFrame(drawFrame);
      }
    };

    video.currentTime = 0;
    await video.play();
    drawFrame();

    await new Promise<void>((resolve) => {
      video.onended = () => {
        cancelAnimationFrame(animationId);
        resolve();
      };
    });

    if (recorder.state === "recording") {
      recorder.stop();
    }

    const resultBlob = await completionPromise;
    return {
      blob: resultBlob,
      duration: Math.round(duration),
      width: targetW,
      height: targetH,
    };
  } finally {
    video.pause();
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Lightweight pure-JavaScript MP4/ISOBMFF box parser.
 * Reads duration, width, and height directly from binary headers without
 * relying on browser video decoders (works for HEVC, H.264, MOV, etc.).
 */
function parseMp4Metadata(buffer: ArrayBuffer): { duration?: number; width?: number; height?: number } {
  const view = new DataView(buffer);
  let duration: number | undefined;
  let width: number | undefined;
  let height: number | undefined;

  function scan(start: number, end: number) {
    let pos = start;
    while (pos + 8 <= end) {
      const size = view.getUint32(pos);
      if (size < 8 && size !== 0 && size !== 1) break;
      const type = String.fromCharCode(
        view.getUint8(pos + 4),
        view.getUint8(pos + 5),
        view.getUint8(pos + 6),
        view.getUint8(pos + 7)
      );
      const boxEnd =
        size === 1
          ? pos + Number(view.getBigUint64(pos + 8))
          : size === 0
          ? end
          : pos + size;
      const dataStart = size === 1 ? pos + 16 : pos + 8;

      if (type === "moov" || type === "trak" || type === "mdia") {
        scan(dataStart, Math.min(boxEnd, end));
      } else if (type === "mvhd" && dataStart + 20 <= end) {
        const ver = view.getUint8(dataStart);
        let timescale = 0;
        let dur = 0;
        if (ver === 1 && dataStart + 32 <= end) {
          timescale = view.getUint32(dataStart + 20);
          dur = Number(view.getBigUint64(dataStart + 24));
        } else if (ver === 0 && dataStart + 20 <= end) {
          timescale = view.getUint32(dataStart + 12);
          dur = view.getUint32(dataStart + 16);
        }
        if (timescale > 0 && dur > 0) {
          duration = Math.round(dur / timescale);
        }
      } else if (type === "tkhd" && !width) {
        const ver = view.getUint8(dataStart);
        const wOff = ver === 1 ? dataStart + 88 : dataStart + 76;
        if (wOff + 8 <= end) {
          const w = view.getUint32(wOff) >>> 16;
          const h = view.getUint32(wOff + 4) >>> 16;
          if (w > 0 && h > 0) {
            width = w;
            height = h;
          }
        }
      }

      if (boxEnd <= pos || boxEnd > end) break;
      pos = boxEnd;
    }
  }

  try {
    scan(0, view.byteLength);
  } catch {
    // Gracefully ignore corrupt boxes
  }

  return { duration, width, height };
}

/**
 * Creates an elegant, branded fallback video poster image using HTML Canvas.
 * Used when the browser video decoder is unable to extract a frame directly.
 */
async function createFallbackThumbnail(title = "Video Testimonial", durationSeconds = 0): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to create canvas context");
  }

  // Rich Ayurvedic background gradient
  const grad = ctx.createLinearGradient(0, 0, 640, 360);
  grad.addColorStop(0, "#122a22");
  grad.addColorStop(0.5, "#1e3d34");
  grad.addColorStop(1, "#0d1f19");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 640, 360);

  // Subtle warm glow
  const glow = ctx.createRadialGradient(320, 160, 20, 320, 160, 260);
  glow.addColorStop(0, "rgba(194, 139, 56, 0.22)");
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 640, 360);

  // Outer gold circle for play icon
  ctx.beginPath();
  ctx.arc(320, 155, 42, 0, Math.PI * 2);
  ctx.fillStyle = "#c28b38";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(320, 155, 50, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Play triangle (centered)
  ctx.beginPath();
  ctx.moveTo(314, 140);
  ctx.lineTo(333, 155);
  ctx.lineTo(314, 170);
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  // Primary heading
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 20px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  const displayTitle = title.replace(/\.[^.]+$/, "").slice(0, 32);
  ctx.fillText(displayTitle || "Patient Testimonial", 320, 238);

  // Secondary subtitle with duration badge
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.font = "14px system-ui, -apple-system, sans-serif";
  const durText = durationSeconds > 0 ? ` • ${formatDuration(durationSeconds)}` : "";
  ctx.fillText(`Charak Ayurveda Hospital${durText}`, 320, 264);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Unable to create preview image."))),
      "image/webp",
      0.9
    );
  });
}

/**
 * Robustly reads video duration, resolution, and extracts a frame thumbnail.
 * If the browser's native video element cannot decode the frame (e.g. HEVC or Linux codecs),
 * this function gracefully extracts metadata from MP4 headers and generates a branded fallback poster,
 * GUARANTEEING the upload process will never be blocked by decode errors.
 */
async function createVideoMetadataAndThumbnail(file: File | Blob): Promise<{
  thumbnail: Blob;
  duration: number;
  width: number;
  height: number;
}> {
  let extractedDuration = 0;
  let sourceWidth = 1280;
  let sourceHeight = 720;
  let thumbnailBlob: Blob | null = null;

  // 1. Attempt binary parse of MP4/MOV header first
  try {
    const slice = await file.slice(0, Math.min(file.size, 4 * 1024 * 1024)).arrayBuffer();
    const meta = parseMp4Metadata(slice);
    if (meta.duration && meta.duration > 0) extractedDuration = meta.duration;
    if (meta.width && meta.height) {
      sourceWidth = meta.width;
      sourceHeight = meta.height;
    }
  } catch {
    // Ignore and proceed
  }

  // 2. Attempt HTML5 Video element frame extraction
  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.preload = "auto";
  video.playsInline = true;
  video.muted = true;

  try {
    const loaded = await new Promise<boolean>((resolve) => {
      const timer = setTimeout(() => {
        cleanup();
        resolve(false);
      }, 4000);

      const onMeta = () => {
        cleanup();
        resolve(true);
      };

      const onErr = () => {
        cleanup();
        resolve(false);
      };

      function cleanup() {
        clearTimeout(timer);
        video.onloadedmetadata = null;
        video.oncanplay = null;
        video.onerror = null;
      }

      video.onloadedmetadata = onMeta;
      video.oncanplay = onMeta;
      video.onerror = onErr;

      // Assign src without redundant video.load() to prevent abort events
      video.src = objectUrl;
    });

    if (loaded) {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        extractedDuration = Math.round(video.duration);
      }
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        sourceWidth = video.videoWidth;
        sourceHeight = video.videoHeight;
      }

      // Try seeking to 1/3 of duration for frame capture
      const seekTarget = Math.min(1, Math.max(0.1, (video.duration || 2) / 3));
      video.currentTime = seekTarget;

      const seeked = await new Promise<boolean>((resolve) => {
        const timer = setTimeout(() => {
          video.onseeked = null;
          video.onerror = null;
          resolve(false);
        }, 1500);

        video.onseeked = () => {
          clearTimeout(timer);
          video.onseeked = null;
          video.onerror = null;
          resolve(true);
        };
        video.onerror = () => {
          clearTimeout(timer);
          video.onseeked = null;
          video.onerror = null;
          resolve(false);
        };
      });

      if (seeked || video.readyState >= 2) {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, 640 / (sourceWidth || 640), 640 / (sourceHeight || 640));
        canvas.width = Math.max(2, Math.floor(((sourceWidth || 640) * scale) / 2) * 2);
        canvas.height = Math.max(2, Math.floor(((sourceHeight || 360) * scale) / 2) * 2);
        const context = canvas.getContext("2d");
        if (context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          thumbnailBlob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(
              (blob) => resolve(blob),
              "image/webp",
              0.85
            );
          });
        }
      }
    }
  } catch (err) {
    console.warn("[VideoUpload] Could not capture frame from video:", err);
  } finally {
    try {
      video.pause();
      video.removeAttribute("src");
    } catch {
      // Ignore cleanup error
    }
    URL.revokeObjectURL(objectUrl);
  }

  // 3. If native frame capture didn't yield a thumbnail, generate branded fallback poster
  if (!thumbnailBlob) {
    const filename = file instanceof File ? file.name : "Testimonial";
    thumbnailBlob = await createFallbackThumbnail(filename, extractedDuration);
  }

  return {
    thumbnail: thumbnailBlob,
    duration: extractedDuration,
    width: sourceWidth,
    height: sourceHeight,
  };
}

export default function VideoUpload({
  value,
  thumbnailUrl,
  onChange,
  folder = "testimonials",
  label = "Upload Video Testimonial",
  required = false,
  disabled = false,
  className = "",
}: VideoUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [compressProgress, setCompressProgress] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [originalName, setOriginalName] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [optimizedSize, setOptimizedSize] = useState<number | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [resolution, setResolution] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  const processAndUpload = async (file: File) => {
    setError(null);
    setSelectedFileName(file.name);
    setOriginalName(file.name);
    setOriginalSize(file.size);

    const extension = getVideoExtension(file.name);
    if (!SUPPORTED_VIDEO_EXTENSIONS.has(extension)) {
      setError("Choose an MP4, MOV, M4V, WEBM, 3GP, or 3G2 video from your device.");
      return;
    }

    if (file.size > MAX_SOURCE_SIZE) {
      setError(`The selected video is ${formatBytes(file.size)}. The source-file limit is 100 MB; please trim it before uploading.`);
      return;
    }

    setOptimizing(true);
    setUploading(false);

    try {
      const isDirectUpload =
        (extension === "mp4" || extension === "webm" || extension === "mov" || extension === "m4v") &&
        file.size <= MAX_UPLOAD_SIZE;

      let uploadFile: File = file;
      let thumbBlob: Blob;
      let vidDuration = 0;
      let resText = "";

      if (isDirectUpload) {
        // Fast direct path: File is already MP4/WebM within the 10 MB storage limit
        const meta = await createVideoMetadataAndThumbnail(file);
        thumbBlob = meta.thumbnail;
        vidDuration = meta.duration;
        resText = meta.width > 0 && meta.height > 0 ? `${meta.width}x${meta.height}` : "";
      } else {
        // Try server transcode first
        let convertedBlob: Blob | null = null;
        let transcodeSuccess = false;

        try {
          const sourceData = new FormData();
          sourceData.append("file", file, file.name);
          const transcodeResponse = await fetch("/api/admin/media/transcode", {
            method: "POST",
            body: sourceData,
          });

          if (transcodeResponse.ok) {
            const blob = await transcodeResponse.blob();
            if (blob.size > 0 && blob.size <= MAX_UPLOAD_SIZE) {
              convertedBlob = blob;
              transcodeSuccess = true;
              const headerDuration = Number(transcodeResponse.headers.get("X-Video-Duration"));
              vidDuration = Number.isFinite(headerDuration) && headerDuration > 0 ? headerDuration : 0;
              const width = Number(transcodeResponse.headers.get("X-Video-Width"));
              const height = Number(transcodeResponse.headers.get("X-Video-Height"));
              resText = width > 0 && height > 0 ? `${width}x${height}` : "";
            }
          }
        } catch {
          // Server transcode failed or FFmpeg missing, fallback to in-browser compression
        }

        // If server transcode was not possible (e.g. FFmpeg missing or error), compress inside browser
        if (!transcodeSuccess || !convertedBlob) {
          setCompressProgress(0);
          const compressed = await compressVideoInBrowser(file, MAX_UPLOAD_SIZE * 0.95, (pct) => {
            setCompressProgress(pct);
          });
          convertedBlob = compressed.blob;
          vidDuration = compressed.duration;
          resText = `${compressed.width}x${compressed.height}`;
          setCompressProgress(null);
        }

        if (!convertedBlob || convertedBlob.size === 0) {
          throw new Error("Video compression produced an empty file. Please try another video.");
        }
        if (convertedBlob.size > MAX_UPLOAD_SIZE) {
          throw new Error(`Compressed video is ${formatBytes(convertedBlob.size)}, which exceeds the 10 MB limit. Please select a shorter video.`);
        }

        const isWebm = convertedBlob.type.includes("webm");
        const outExt = isWebm ? "webm" : "mp4";
        const baseName = file.name.replace(/\.[^.]+$/, "").replace(/\s+/g, "-");
        uploadFile = new File(
          [convertedBlob],
          `${baseName}-compressed.${outExt}`,
          { type: isWebm ? "video/webm" : "video/mp4", lastModified: Date.now() }
        );

        const meta = await createVideoMetadataAndThumbnail(uploadFile);
        thumbBlob = meta.thumbnail;
        if (!vidDuration) vidDuration = meta.duration;
        if (!resText && meta.width > 0) resText = `${meta.width}x${meta.height}`;
      }

      setDuration(vidDuration);
      setResolution(resText);
      setOptimizedSize(uploadFile.size);

      setOptimizing(false);
      setUploading(true);

      const thumbData = new FormData();
      thumbData.append("file", thumbBlob, "thumbnail.webp");
      thumbData.append("bucket", "hospital-images");
      thumbData.append("folder", "video-thumbnails");

      const thumbRes = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: thumbData,
      });
      const thumbJson = await thumbRes.json();
      if (!thumbRes.ok || !thumbJson?.ok) {
        throw new Error(thumbJson?.error || "Failed to upload the video preview image.");
      }
      const uploadedThumbUrl = thumbJson?.ok ? thumbJson.url : "";
      const uploadedThumbPath = thumbJson?.ok ? thumbJson.storagePath : "";

      const videoData = new FormData();
      videoData.append("file", uploadFile, uploadFile.name);
      videoData.append("bucket", "hospital-videos");
      videoData.append("folder", folder);

      const vidRes = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: videoData,
      });

      const vidJson = await vidRes.json();
      if (!vidRes.ok || !vidJson.ok) {
        throw new Error(vidJson.error || "Failed to upload video to storage.");
      }

      setUploading(false);

      onChange({
        videoUrl: vidJson.url,
        storagePath: vidJson.storagePath,
        thumbnailUrl: uploadedThumbUrl,
        thumbnailStoragePath: uploadedThumbPath,
        fileSize: vidJson.fileSize,
        duration: vidDuration,
      });
    } catch (err) {
      console.error("[VideoUpload Error]:", err);
      const msg = err instanceof Error ? err.message : "Video processing failed.";
      setError(msg);
      setOptimizing(false);
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      void processAndUpload(e.target.files[0]);
      e.target.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (!disabled && !optimizing && !uploading && e.dataTransfer.files[0]) {
      processAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    onChange({ videoUrl: "", storagePath: undefined, thumbnailUrl: undefined, fileSize: undefined, duration: undefined });
    setOriginalName(null);
    setOriginalSize(null);
    setOptimizedSize(null);
    setSelectedFileName(null);
    setDuration(null);
    setResolution(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-stone-800">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {!value ? (
        <div
          className={`video-upload-dropzone${dragActive ? " is-drag-active" : ""}${disabled ? " is-disabled" : ""}`}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled && !optimizing && !uploading) setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onClick={disabled || optimizing || uploading ? undefined : () => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (!disabled && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled || optimizing || uploading}
          aria-label="Choose a video to upload"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp4,.mov,.m4v,.webm,.3gp,.3g2,video/mp4,video/quicktime,video/x-quicktime,video/x-m4v,application/x-m4v,video/webm,video/3gpp,video/3gpp2"
            className="video-upload-input"
            onChange={handleFileChange}
            disabled={disabled || optimizing || uploading}
            tabIndex={-1}
            aria-label="Select video file"
          />

          {optimizing ? (
            <div className="flex flex-col items-center justify-center space-y-2 py-3">
              <RefreshCw className="animate-spin text-amber-600" size={28} />
              <p className="text-sm font-medium text-stone-700">
                {compressProgress !== null
                  ? `Compressing video under 10 MB (${compressProgress}%)...`
                  : "Processing and optimizing video..."}
              </p>
              <p className="text-xs text-stone-500">
                Automatically optimizing for fast mobile loading. Please wait.
              </p>
            </div>
          ) : uploading ? (
            <div className="flex flex-col items-center justify-center space-y-2 py-3">
              <UploadCloud className="animate-bounce text-emerald-600" size={28} />
              <p className="text-sm font-medium text-stone-700">Uploading video to storage...</p>
              <div className="video-upload-progress" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2">
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "rgba(194, 139, 56, 0.14)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--gold-hover, #9c6e28)",
                }}
              >
                <Video size={22} />
              </div>
              <div className="text-sm font-medium text-stone-800">
                {selectedFileName ? `Selected: ${selectedFileName}` : "Choose a video or drag and drop"}
              </div>
              <div className="text-xs text-stone-500">
                MP4 / WebM up to 10 MB &bull; Source up to 100 MB
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Video Preview with Details */
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e7e5e4",
            borderRadius: "14px",
            padding: "14px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            position: "relative",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                <CheckCircle size={12} /> Compressed for mobile
              </span>
              {resolution && (
                <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                  {resolution}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleClear}
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                color: "#dc2626",
                border: "none",
                borderRadius: "50%",
                width: "26px",
                height: "26px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              title="Remove video"
              aria-label="Remove video"
            >
              <X size={15} />
            </button>
          </div>

          <div
            style={{
              position: "relative",
              width: "100%",
              height: "200px",
              borderRadius: "10px",
              overflow: "hidden",
              background: "#000000",
            }}
          >
            <video
              ref={videoPreviewRef}
              src={value}
              poster={thumbnailUrl}
              controls
              playsInline
              preload="metadata"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-stone-500 flex-wrap gap-2 pt-1 border-t border-stone-100">
            {(originalName || value) && (
              <span className="font-medium text-stone-700 truncate max-w-xs">
                {originalName || decodeURIComponent(value?.split("/").pop()?.split("?")[0] || "")}
              </span>
            )}
            <div className="flex items-center gap-3 ml-auto">
              {originalSize && <span>Original: <strong>{formatBytes(originalSize)}</strong></span>}
              {optimizedSize && (
                <span className="text-emerald-700">
                  Uploaded: <strong>{formatBytes(optimizedSize)}</strong>
                </span>
              )}
              {duration !== null && (
                <span>Duration: <strong>{formatDuration(duration)}</strong></span>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
          <AlertCircle size={14} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
