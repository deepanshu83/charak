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

async function createVideoMetadataAndThumbnail(file: File): Promise<{
  thumbnail: Blob;
  duration: number;
  width: number;
  height: number;
}> {
  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.preload = "metadata";
  video.playsInline = true;
  video.muted = true;

  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("Unable to read video file. Please ensure it is a valid video format."));
      video.src = objectUrl;
      video.load();
    });

    if (!Number.isFinite(video.duration) || video.duration <= 0) {
      throw new Error("The video duration could not be read.");
    }

    const duration = Math.round(video.duration);
    const sourceWidth = video.videoWidth || 1280;
    const sourceHeight = video.videoHeight || 720;

    video.currentTime = Math.min(1, video.duration / 2);
    await new Promise<void>((resolve, reject) => {
      video.onseeked = () => resolve();
      video.onerror = () => reject(new Error("The video preview could not be created."));
    });

    const canvas = document.createElement("canvas");
    const scale = Math.min(1, 640 / (sourceWidth || 640), 640 / (sourceHeight || 640));
    canvas.width = Math.max(2, Math.floor(((sourceWidth || 640) * scale) / 2) * 2);
    canvas.height = Math.max(2, Math.floor(((sourceHeight || 360) * scale) / 2) * 2);
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Unable to create a preview image for the video.");
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const thumbnail = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Unable to create a preview image for the video."))),
        "image/webp",
        0.85
      );
    });

    return { thumbnail, duration, width: sourceWidth, height: sourceHeight };
  } finally {
    video.pause();
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(objectUrl);
  }
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
        (extension === "mp4" || extension === "webm") && file.size <= MAX_UPLOAD_SIZE;

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
        // Server transcode path: Convert or compress source video
        const sourceData = new FormData();
        sourceData.append("file", file, file.name);
        const transcodeResponse = await fetch("/api/admin/media/transcode", {
          method: "POST",
          body: sourceData,
        });

        if (!transcodeResponse.ok) {
          const transcodeJson = await transcodeResponse.json().catch(() => null);
          const serverError = transcodeJson?.error || "";

          if (transcodeResponse.status === 503 || serverError.toLowerCase().includes("ffmpeg")) {
            throw new Error(
              `This video is ${formatBytes(file.size)} (${extension.toUpperCase()}). Supabase storage limit is 10 MB per video. Automatic server compression is unavailable because FFmpeg is not installed on the server. Please compress your video to MP4 under 10 MB before uploading.`
            );
          }
          throw new Error(serverError || "The server could not convert this video.");
        }

        const convertedBlob = await transcodeResponse.blob();
        if (!convertedBlob.size || convertedBlob.size > MAX_UPLOAD_SIZE) {
          throw new Error("The converted video is empty or exceeds the 10 MB upload limit.");
        }
        const baseName = file.name.replace(/\.[^.]+$/, "").replace(/\s+/g, "-");
        uploadFile = new File(
          [convertedBlob],
          `${baseName}-compressed.mp4`,
          { type: "video/mp4", lastModified: Date.now() }
        );
        const meta = await createVideoMetadataAndThumbnail(uploadFile);
        thumbBlob = meta.thumbnail;
        const headerDuration = Number(transcodeResponse.headers.get("X-Video-Duration"));
        vidDuration = Number.isFinite(headerDuration) && headerDuration > 0 ? headerDuration : meta.duration;
        const width = Number(transcodeResponse.headers.get("X-Video-Width"));
        const height = Number(transcodeResponse.headers.get("X-Video-Height"));
        resText = width > 0 && height > 0 ? `${width}x${height}` : (meta.width > 0 ? `${meta.width}x${meta.height}` : "");
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
                Processing video and preparing preview...
              </p>
              <p className="text-xs text-stone-500">Please wait a moment.</p>
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
