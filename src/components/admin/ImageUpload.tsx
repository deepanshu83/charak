"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { UploadCloud, AlertCircle, X, Sparkles, RefreshCw } from "lucide-react";

export interface ImageUploadResult {
  url: string;
  publicUrl: string;
  storagePath?: string;
  fileSize?: number;
  filename?: string;
}

export interface ImageUploadProps {
  value?: string;
  currentImageUrl?: string;
  onChange?: (result: ImageUploadResult) => void;
  onUploadComplete?: (result: ImageUploadResult) => void;
  onRemove?: () => void;
  bucket?: string;
  folder?: string;
  label?: string;
  required?: boolean;
  maxDimension?: number;
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

export default function ImageUpload({
  value,
  currentImageUrl,
  onChange,
  onUploadComplete,
  onRemove,
  bucket = "hospital-images",
  folder = "general",
  label = "Upload Image",
  required = false,
  maxDimension = 1800,
  className = "",
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [originalName, setOriginalName] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [optimizedSize, setOptimizedSize] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  /**
   * Resizes and compresses image to WebP format targeting ~100-300 KB without excessive degradation.
   */
  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Failed to read image file"));
      reader.onload = () => {
        const img = new window.Image();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.onload = () => {
          let { width, height } = img;

          // Resize if exceeding max dimensions (around 1600-2000px)
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas context initialization failed"));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Convert to WebP with target quality
          // Iterative approach: try 0.82 first; if > 350KB, step down to 0.72
          canvas.toBlob(
            (firstBlob) => {
              if (!firstBlob) {
                // Fallback to jpeg
                canvas.toBlob(
                  (jpegBlob) => (jpegBlob ? resolve(jpegBlob) : reject(new Error("Compression failed"))),
                  "image/jpeg",
                  0.8
                );
                return;
              }

              if (firstBlob.size > 350 * 1024) {
                canvas.toBlob(
                  (secondBlob) => resolve(secondBlob || firstBlob),
                  "image/webp",
                  0.72
                );
              } else {
                resolve(firstBlob);
              }
            },
            "image/webp",
            0.82
          );
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const processAndUpload = async (file: File) => {
    setError(null);

    // 1. Validation
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload JPG, PNG or WEBP.");
      return;
    }

    setOriginalName(file.name);
    setOriginalSize(file.size);
    setOptimizing(true);
    setUploading(false);
    setUploadProgress(15);

    try {
      // 2. Client-side Resize & Compression
      const compressedBlob = await compressImage(file);
      setOptimizedSize(compressedBlob.size);
      setOptimizing(false);
      setUploading(true);
      setUploadProgress(40);

      // 3. Upload to server endpoint
      const formData = new FormData();
      const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
      formData.append("file", compressedBlob, newFileName);
      formData.append("bucket", bucket || "hospital-images");
      formData.append("folder", folder);

      setUploadProgress(65);

      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(90);

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Failed to upload image to storage.");
      }

      setUploadProgress(100);
      setUploading(false);

      const uploadResult: ImageUploadResult = {
        url: json.url,
        publicUrl: json.url,
        storagePath: json.storagePath,
        fileSize: json.fileSize,
        filename: json.filename,
      };

      if (onChange) onChange(uploadResult);
      if (onUploadComplete) onUploadComplete(uploadResult);
    } catch (err) {
      console.error("[ImageUpload Error]:", err);
      const msg = err instanceof Error ? err.message : "Image optimization failed.";
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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleClear = () => {
    if (onChange) onChange({ url: "", publicUrl: "", storagePath: undefined, fileSize: undefined });
    if (onRemove) onRemove();
    setOriginalName(null);
    setOriginalSize(null);
    setOptimizedSize(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const savingsPct =
    originalSize && optimizedSize && originalSize > optimizedSize
      ? Math.round(((originalSize - optimizedSize) / originalSize) * 100)
      : 0;

  const displayImage = value || currentImageUrl;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-stone-800">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Upload Drop Zone / Active Preview */}
      {!displayImage ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: dragActive ? "2px dashed var(--green, #184232)" : "2px dashed #d6d3cd",
            background: dragActive ? "rgba(24, 66, 50, 0.04)" : "#faf9f6",
            borderRadius: "14px",
            padding: "24px 16px",
            textAlign: "center",
            cursor: optimizing || uploading ? "wait" : "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
            disabled={optimizing || uploading}
          />

          {optimizing ? (
            <div className="flex flex-col items-center justify-center space-y-2 py-3">
              <RefreshCw className="animate-spin text-amber-600" size={28} />
              <p className="text-sm font-medium text-stone-700">
                Optimizing &amp; converting to WebP...
              </p>
              <p className="text-xs text-stone-500">Resizing and balancing clarity</p>
            </div>
          ) : uploading ? (
            <div className="flex flex-col items-center justify-center space-y-2 py-3">
              <UploadCloud className="animate-bounce text-emerald-600" size={28} />
              <p className="text-sm font-medium text-stone-700">
                Uploading to storage ({uploadProgress}%)...
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
                <UploadCloud size={22} />
              </div>
              <div className="text-sm font-medium text-stone-800">
                Click to upload or drag &amp; drop
              </div>
              <div className="text-xs text-stone-500">
                JPG, PNG or WEBP (Automatically optimized to ~100–300 KB)
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Image Preview Box with Details */
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e7e5e4",
            borderRadius: "14px",
            padding: "12px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "72px",
              height: "72px",
              borderRadius: "10px",
              overflow: "hidden",
              flexShrink: 0,
              background: "#f5f5f4",
            }}
          >
            <Image
              src={displayImage}
              alt="Uploaded Preview"
              fill
              sizes="72px"
              style={{ objectFit: "cover" }}
              unoptimized={displayImage.startsWith("http") || displayImage.startsWith("/uploads")}
            />
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Optimized WebP
              </span>
              {savingsPct > 0 && (
                <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1">
                  <Sparkles size={11} /> -{savingsPct}%
                </span>
              )}
            </div>

            {originalName && (
              <p className="text-xs text-stone-700 font-medium truncate mt-1">
                {originalName}
              </p>
            )}

            <div className="text-xs text-stone-500 mt-0.5 flex items-center gap-2 flex-wrap">
              {originalSize && (
                <span>Original: <strong>{formatBytes(originalSize)}</strong></span>
              )}
              {originalSize && optimizedSize && <span>&bull;</span>}
              {optimizedSize && (
                <span className="text-emerald-700">
                  Optimized: <strong>{formatBytes(optimizedSize)}</strong>
                </span>
              )}
              {!originalSize && (
                <span className="text-stone-500">Active image stored in cloud</span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleClear}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
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
            title="Remove image"
            aria-label="Remove image"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
          <AlertCircle size={14} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
