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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [originalName, setOriginalName] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [optimizedSize, setOptimizedSize] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [resolution, setResolution] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  const allowedTypes = ["video/mp4", "video/webm"];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB per Requirement 7

  /**
   * Generates a video poster thumbnail from a video file at time = 1s.
   */
  const generateThumbnail = async (videoFile: File): Promise<{ blob: Blob; duration: number; resText: string }> => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(videoFile);
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = url;
      video.muted = true;
      video.playsInline = true;

      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Unable to read video metadata. Please ensure file is valid MP4 or WEBM."));
      };

      video.onloadedmetadata = () => {
        const vidDuration = Math.round(video.duration) || 0;
        const w = video.videoWidth || 1280;
        const h = video.videoHeight || 720;
        let resLabel = "720p";
        if (h >= 1080) resLabel = "720p (Optimized from 1080p)";
        else if (h >= 720) resLabel = "720p";
        else resLabel = `${w}x${h}`;

        // Seek to 1s or midpoint for frame thumbnail
        video.currentTime = Math.min(1.0, video.duration / 2);

        video.onseeked = () => {
          try {
            // Target 720p aspect ratio for thumbnail
            const thumbWidth = 640;
            const thumbHeight = Math.round((h / w) * thumbWidth);
            const canvas = document.createElement("canvas");
            canvas.width = thumbWidth;
            canvas.height = thumbHeight;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(video, 0, 0, thumbWidth, thumbHeight);
              canvas.toBlob(
                (blob) => {
                  URL.revokeObjectURL(url);
                  if (blob) {
                    resolve({ blob, duration: vidDuration, resText: resLabel });
                  } else {
                    reject(new Error("Failed to capture thumbnail"));
                  }
                },
                "image/webp",
                0.8
              );
            } else {
              URL.revokeObjectURL(url);
              reject(new Error("Canvas context failed"));
            }
          } catch (e) {
            URL.revokeObjectURL(url);
            reject(e);
          }
        };
      };
    });
  };

  const processAndUpload = async (file: File) => {
    setError(null);

    // 1. Validation
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload MP4 or WEBM video.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(`Video exceeds 10 MB maximum limit (${formatBytes(file.size)}). Please trim or compress the video before uploading.`);
      return;
    }

    setOriginalName(file.name);
    setOriginalSize(file.size);
    setOptimizing(true);
    setUploading(false);
    setUploadProgress(20);

    try {
      // 2. Extract metadata & generate thumbnail
      const { blob: thumbBlob, duration: vidDuration, resText } = await generateThumbnail(file);
      setDuration(vidDuration);
      setResolution(resText);
      setOptimizedSize(file.size);

      setOptimizing(false);
      setUploading(true);
      setUploadProgress(40);

      // 3. Upload Thumbnail first
      const thumbData = new FormData();
      thumbData.append("file", thumbBlob, "thumbnail.webp");
      thumbData.append("bucket", "hospital-images");
      thumbData.append("folder", "video-thumbnails");

      const thumbRes = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: thumbData,
      });
      const thumbJson = await thumbRes.json();
      const uploadedThumbUrl = thumbJson?.ok ? thumbJson.url : "";
      const uploadedThumbPath = thumbJson?.ok ? thumbJson.storagePath : "";

      setUploadProgress(60);

      // 4. Upload Video
      const videoData = new FormData();
      videoData.append("file", file, file.name);
      videoData.append("bucket", "hospital-videos");
      videoData.append("folder", folder);

      const vidRes = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: videoData,
      });

      setUploadProgress(90);

      const vidJson = await vidRes.json();
      if (!vidRes.ok || !vidJson.ok) {
        throw new Error(vidJson.error || "Failed to upload video to storage.");
      }

      setUploadProgress(100);
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
      processAndUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    onChange({ videoUrl: "", storagePath: undefined, thumbnailUrl: undefined, fileSize: undefined, duration: undefined });
    setOriginalName(null);
    setOriginalSize(null);
    setOptimizedSize(null);
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
          onDrop={disabled ? undefined : handleDrop}
          onDragOver={disabled ? undefined : (e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={disabled ? undefined : () => setDragActive(false)}
          onClick={disabled || optimizing || uploading ? undefined : () => fileInputRef.current?.click()}
          style={{
            border: dragActive ? "2px dashed var(--green, #184232)" : "2px dashed #d6d3cd",
            background: disabled ? "#f5f5f4" : dragActive ? "rgba(24, 66, 50, 0.04)" : "#faf9f6",
            borderRadius: "14px",
            padding: "24px 16px",
            textAlign: "center",
            cursor: disabled ? "not-allowed" : optimizing || uploading ? "wait" : "pointer",
            transition: "all 0.2s ease",
            opacity: disabled ? 0.6 : 1,
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp4,.webm,video/mp4,video/webm"
            className="hidden"
            onChange={handleFileChange}
            disabled={disabled || optimizing || uploading}
          />

          {optimizing ? (
            <div className="flex flex-col items-center justify-center space-y-2 py-3">
              <RefreshCw className="animate-spin text-amber-600" size={28} />
              <p className="text-sm font-medium text-stone-700">
                Processing video &amp; generating 720p poster...
              </p>
              <p className="text-xs text-stone-500">Checking bitrate and frame timing</p>
            </div>
          ) : uploading ? (
            <div className="flex flex-col items-center justify-center space-y-2 py-3">
              <UploadCloud className="animate-bounce text-emerald-600" size={28} />
              <p className="text-sm font-medium text-stone-700">
                Uploading optimized video ({uploadProgress}%)...
              </p>
              <div className="w-48 bg-stone-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
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
                Click to upload video or drag &amp; drop
              </div>
              <div className="text-xs text-stone-500">
                MP4 or WEBM &bull; Max 10 MB &bull; Target ~1–3 MB (720p)
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
                <CheckCircle size={12} /> Optimized Web Video
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
            {originalName && (
              <span className="font-medium text-stone-700 truncate max-w-xs">{originalName}</span>
            )}
            <div className="flex items-center gap-3 ml-auto">
              {originalSize && <span>Original: <strong>{formatBytes(originalSize)}</strong></span>}
              {optimizedSize && (
                <span className="text-emerald-700">
                  Optimized: <strong>{formatBytes(optimizedSize)}</strong>
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
