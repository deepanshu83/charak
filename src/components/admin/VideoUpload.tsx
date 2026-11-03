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
const VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/x-quicktime",
  "video/x-m4v",
  "application/x-m4v",
  "video/webm",
  "video/3gpp",
  "video/3gpp2",
];

function getVideoExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() || "";
}

function getUnsupportedVideoMessage(file: File): string {
  const extension = getVideoExtension(file.name).toUpperCase();
  const sourceFormat = extension ? `${extension} file` : "video file";
  return `This browser cannot decode this ${sourceFormat}. iPhone videos may use HEVC/H.265, which some browsers do not support. Export or convert it to H.264 MP4, or upload it from Safari on iPhone.`;
}

function getOutputMimeType(): string {
  if (typeof MediaRecorder === "undefined") {
    throw new Error("This browser cannot compress videos. Please use an up-to-date Safari or Chrome browser.");
  }

  const candidates = [
    "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
    "video/mp4",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  const supported = candidates.find((mimeType) => MediaRecorder.isTypeSupported(mimeType));
  if (!supported) {
    throw new Error("Video compression is not supported by this browser. Please use an up-to-date Safari or Chrome browser.");
  }
  return supported;
}

async function compressVideo(
  file: File,
  onProgress: (progress: number) => void
): Promise<{ file: File; thumbnail: Blob; duration: number; resolution: string }> {
  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.preload = "auto";
  video.playsInline = true;
  video.src = objectUrl;

  let audioContext: AudioContext | null = null;
  let videoStream: MediaStream | null = null;
  let stream: MediaStream | null = null;
  let animationFrame = 0;

  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error(getUnsupportedVideoMessage(file)));
      video.load();
    });

    if (!Number.isFinite(video.duration) || video.duration <= 0) {
      throw new Error("The video duration could not be read.");
    }

    const sourceWidth = video.videoWidth || 1280;
    const sourceHeight = video.videoHeight || 720;
    const scale = Math.min(1, 1280 / sourceWidth, 720 / sourceHeight);
    const width = Math.max(2, Math.floor((sourceWidth * scale) / 2) * 2);
    const height = Math.max(2, Math.floor((sourceHeight * scale) / 2) * 2);
    const duration = Math.round(video.duration);
    const resolution = `${width}x${height}`;

    await new Promise<void>((resolve, reject) => {
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        resolve();
      } else {
        video.onloadeddata = () => resolve();
        video.onerror = () => reject(new Error(getUnsupportedVideoMessage(file)));
      }
    });

    video.currentTime = Math.min(1, video.duration / 2);
    await new Promise<void>((resolve, reject) => {
      video.onseeked = () => resolve();
      video.onerror = () => reject(new Error("Unable to preview this video."));
    });

    const thumbnailCanvas = document.createElement("canvas");
    thumbnailCanvas.width = Math.min(640, width);
    thumbnailCanvas.height = Math.max(
      2,
      Math.round((thumbnailCanvas.width * height) / width)
    );
    const thumbnailContext = thumbnailCanvas.getContext("2d");
    if (!thumbnailContext) {
      throw new Error("Unable to create the video preview image.");
    }
    thumbnailContext.drawImage(
      video,
      0,
      0,
      thumbnailCanvas.width,
      thumbnailCanvas.height
    );
    const thumbnail = await new Promise<Blob>((resolve, reject) => {
      thumbnailCanvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Unable to create the video preview image."))),
        "image/webp",
        0.8
      );
    });

    const mimeType = getOutputMimeType();
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context || typeof canvas.captureStream !== "function") {
      throw new Error("This browser cannot compress videos. Please use an up-to-date Safari or Chrome browser.");
    }

    videoStream = canvas.captureStream(24);
    audioContext = new AudioContext();
    const audioDestination = audioContext.createMediaStreamDestination();
    const audioSource = audioContext.createMediaElementSource(video);
    audioSource.connect(audioDestination);
    await audioContext.resume();

    stream = new MediaStream([
      ...videoStream.getVideoTracks(),
      ...audioDestination.stream.getAudioTracks(),
    ]);

    const targetBytes = MAX_UPLOAD_SIZE * 0.84;
    const audioBitrate = 96_000;
    const videoBitrate = Math.max(
      120_000,
      Math.min(900_000, (targetBytes * 8) / video.duration - audioBitrate)
    );
    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: videoBitrate,
      audioBitsPerSecond: audioBitrate,
    });
    const chunks: Blob[] = [];
    const recording = new Promise<Blob>((resolve, reject) => {
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      recorder.onerror = () => reject(new Error("Video compression failed. Please try a shorter video or another format."));
      recorder.onstop = () => {
        const outputType = recorder.mimeType || mimeType;
        resolve(new Blob(chunks, { type: outputType }));
      };
    });

    await new Promise<void>((resolve, reject) => {
      video.onseeked = () => resolve();
      video.onerror = () => reject(new Error("Unable to prepare the video for compression."));
      video.currentTime = 0;
    });
    recorder.start(500);
    const drawFrame = () => {
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        context.drawImage(video, 0, 0, width, height);
      }
      if (!video.ended && recorder.state === "recording") {
        animationFrame = requestAnimationFrame(drawFrame);
      }
    };
    drawFrame();
    video.onended = () => {
      if (recorder.state === "recording") recorder.stop();
    };
    video.ontimeupdate = () => {
      if (video.duration > 0) {
        onProgress(Math.min(99, Math.round((video.currentTime / video.duration) * 100)));
      }
    };
    await video.play();
    const compressedBlob = await recording;

    if (compressedBlob.size === 0) {
      throw new Error("Video compression produced an empty file. Please try another video.");
    }
    if (compressedBlob.size > MAX_UPLOAD_SIZE) {
      throw new Error("The compressed video is still over 10 MB. Please trim the video and try again.");
    }

    const outputMime = compressedBlob.type.startsWith("video/mp4")
      ? "video/mp4"
      : "video/webm";
    const extension = outputMime === "video/mp4" ? "mp4" : "webm";
    const baseName = file.name.replace(/\.[^.]+$/, "").replace(/\s+/g, "-");
    const compressedFile = new File(
      [compressedBlob],
      `${baseName}-compressed.${extension}`,
      { type: outputMime, lastModified: Date.now() }
    );

    return { file: compressedFile, thumbnail, duration, resolution };
  } finally {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    stream?.getTracks().forEach((track) => track.stop());
    videoStream?.getTracks().forEach((track) => track.stop());
    video.pause();
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(objectUrl);
    if (audioContext && audioContext.state !== "closed") {
      await audioContext.close();
    }
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
  const [uploadProgress, setUploadProgress] = useState(0);
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
    if (
      !SUPPORTED_VIDEO_EXTENSIONS.has(extension) ||
      (file.type && !VIDEO_MIME_TYPES.includes(file.type) && file.type !== "application/octet-stream")
    ) {
      setError("Choose an MP4, MOV, M4V, WEBM, 3GP, or 3G2 video from your device.");
      return;
    }

    if (file.size > MAX_SOURCE_SIZE) {
      setError(`The selected video is ${formatBytes(file.size)}. The source-file limit is 100 MB; please trim it before uploading.`);
      return;
    }

    setOptimizing(true);
    setUploading(false);
    setUploadProgress(0);

    try {
      const {
        file: compressedFile,
        thumbnail: thumbBlob,
        duration: vidDuration,
        resolution: resText,
      } = await compressVideo(file, setUploadProgress);
      setDuration(vidDuration);
      setResolution(resText);
      setOptimizedSize(compressedFile.size);

      setOptimizing(false);
      setUploading(true);
      setUploadProgress(0);

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
      videoData.append("file", compressedFile, compressedFile.name);
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
                Compressing video and preparing mobile-friendly preview...
              </p>
              <p className="text-xs text-stone-500">{uploadProgress}% complete</p>
            </div>
          ) : uploading ? (
            <div className="flex flex-col items-center justify-center space-y-2 py-3">
              <UploadCloud className="animate-bounce text-emerald-600" size={28} />
              <p className="text-sm font-medium text-stone-700">Uploading compressed video to storage...</p>
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
                iPhone: MOV / MP4 / M4V &bull; Android: MP4 / 3GP / WEBM &bull; Source up to 100 MB
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
