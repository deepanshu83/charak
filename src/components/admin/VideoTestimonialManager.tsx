"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  RefreshCw,
  AlertTriangle,
  Video as VideoIcon,
  Play,
} from "lucide-react";
import {
  fetchAdminVideoTestimonials,
  adminCreateVideoTestimonial,
  adminUpdateVideoTestimonial,
  adminDeleteVideoTestimonial,
  getVideoTestimonials,
  subscribeVideoTestimonials,
} from "@/lib/videoTestimonialService";
import type { VideoTestimonial } from "@/types";
import { Button, Input, Modal, Textarea, useToast } from "@/components/ui";
import VideoUpload from "./VideoUpload";

const MAX_VIDEO_TESTIMONIALS = 10;

function formatDuration(seconds?: number): string {
  if (!seconds) return "";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export default function VideoTestimonialManager() {
  const toast = useToast();
  const [items, setItems] = useState<VideoTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VideoTestimonial | null>(null);
  const [itemToDelete, setItemToDelete] = useState<VideoTestimonial | null>(null);
  const [previewItem, setPreviewItem] = useState<VideoTestimonial | null>(null);

  const [form, setForm] = useState({
    title: "",
    patientName: "",
    description: "",
    videoUrl: "",
    storagePath: "",
    thumbnailUrl: "",
    thumbnailStoragePath: "",
    fileSize: 0,
    duration: 0,
    displayOrder: 0,
    published: true,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminVideoTestimonials();
      setItems(data);
    } catch (err) {
      console.error("[VideoTestimonials] Failed to load data:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeVideoTestimonials(() => {
      setItems(getVideoTestimonials());
    });
    return unsub;
  }, []);

  const isLimitReached = items.length >= MAX_VIDEO_TESTIMONIALS;

  const openCreateModal = () => {
    if (isLimitReached) {
      toast.error("Limit Reached", "Maximum 10 video testimonials allowed.");
      return;
    }
    setEditingItem(null);
    setForm({
      title: "",
      patientName: "",
      description: "",
      videoUrl: "",
      storagePath: "",
      thumbnailUrl: "",
      thumbnailStoragePath: "",
      fileSize: 0,
      duration: 0,
      displayOrder: items.length + 1,
      published: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: VideoTestimonial) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      patientName: item.patientName,
      description: item.description || "",
      videoUrl: item.videoUrl,
      storagePath: item.storagePath || "",
      thumbnailUrl: item.thumbnailUrl || "",
      thumbnailStoragePath: item.thumbnailStoragePath || "",
      fileSize: item.fileSize || 0,
      duration: item.duration || 0,
      displayOrder: item.displayOrder || 0,
      published: item.published !== false,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.patientName.trim()) {
      toast.error("Validation Error", "Title and Patient name are required.");
      return;
    }
    if (!form.videoUrl.trim()) {
      toast.error("Validation Error", "Please upload a video testimonial.");
      return;
    }

    if (!editingItem && isLimitReached) {
      toast.error("Limit Reached", "Maximum 10 video testimonials allowed.");
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        await adminUpdateVideoTestimonial(editingItem.id, {
          title: form.title.trim(),
          patientName: form.patientName.trim(),
          description: form.description.trim(),
          videoUrl: form.videoUrl.trim(),
          storagePath: form.storagePath || undefined,
          thumbnailUrl: form.thumbnailUrl || undefined,
          thumbnailStoragePath: form.thumbnailStoragePath || undefined,
          fileSize: form.fileSize || undefined,
          duration: form.duration || undefined,
          displayOrder: Number(form.displayOrder) || 0,
          published: form.published,
        });
        toast.success("Video Updated", `"${form.title}" details updated.`);
      } else {
        await adminCreateVideoTestimonial({
          title: form.title.trim(),
          patientName: form.patientName.trim(),
          description: form.description.trim(),
          videoUrl: form.videoUrl.trim(),
          storagePath: form.storagePath || undefined,
          thumbnailUrl: form.thumbnailUrl || undefined,
          thumbnailStoragePath: form.thumbnailStoragePath || undefined,
          fileSize: form.fileSize || undefined,
          duration: form.duration || undefined,
          displayOrder: Number(form.displayOrder) || 0,
          published: form.published,
        });
        toast.success("Video Added", `"${form.title}" added to testimonials.`);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      toast.error("Save Failed", err instanceof Error ? err.message : "Unable to save video");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublished = async (item: VideoTestimonial) => {
    const nextPublished = item.published === false ? true : false;
    try {
      await adminUpdateVideoTestimonial(item.id, { published: nextPublished });
      toast.success(
        nextPublished ? "Video Published" : "Video Hidden",
        `"${item.title}" is now ${nextPublished ? "visible on public pages" : "hidden"}.`
      );
      await loadData();
    } catch {
      toast.error("Update Failed", "Unable to update video visibility.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await adminDeleteVideoTestimonial(itemToDelete.id);
      toast.success("Video Deleted", `"${itemToDelete.title}" removed.`);
      setItemToDelete(null);
      await loadData();
    } catch {
      toast.error("Delete Failed", "Unable to delete video testimonial.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif font-bold text-stone-900">
              Video Testimonials
            </h1>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                isLimitReached
                  ? "bg-red-100 text-red-700 font-bold"
                  : items.length > 7
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {items.length} / {MAX_VIDEO_TESTIMONIALS} Videos
            </span>
          </div>
          <p className="text-sm text-stone-600 mt-1">
            Manage authentic patient recovery video stories (max 10 videos, max 10 MB per video).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/video-testimonials"
            target="_blank"
            className="flex items-center gap-1.5 text-sm text-stone-600 hover:text-emerald-800 px-3 py-2 rounded-lg border border-stone-200 hover:bg-stone-50 transition"
          >
            <span>Live Section</span>
            <ExternalLink size={14} />
          </Link>
          <Button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white"
            disabled={isLimitReached}
          >
            <Plus size={16} />
            <span>Add Video</span>
          </Button>
        </div>
      </div>

      {/* 10 Videos Limit Warning Banner */}
      {isLimitReached && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-center gap-3 text-red-800 text-sm">
          <AlertTriangle size={20} className="flex-shrink-0 text-red-500" />
          <div>
            <strong>Maximum 10 video testimonials allowed.</strong> Delete an existing video before uploading a new one.
          </div>
        </div>
      )}

      {/* Grid or Empty State */}
      {loading ? (
        <div className="flex items-center justify-center p-16 text-stone-500 gap-2">
          <RefreshCw className="animate-spin" size={20} />
          <span>Loading video testimonials...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-stone-300">
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "rgba(24, 66, 50, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              color: "var(--green, #184232)",
            }}
          >
            <VideoIcon size={28} />
          </div>
          <h3 className="text-lg font-serif font-bold text-stone-800">
            No video testimonials yet.
          </h3>
          <p className="text-sm text-stone-500 mt-1 max-w-sm mx-auto mb-5">
            Upload patient video interviews, recovery milestones, and real consultations to build clinical trust.
          </p>
          <Button
            onClick={openCreateModal}
            className="bg-emerald-800 hover:bg-emerald-900 text-white inline-flex items-center gap-2"
            disabled={isLimitReached}
          >
            <Plus size={16} />
            <span>Add Video</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div
                  className="relative aspect-video w-full bg-black cursor-pointer group"
                  onClick={() => setPreviewItem(item)}
                >
                  {item.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-stone-900 text-stone-500">
                      <VideoIcon size={36} />
                    </div>
                  )}

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/90 text-emerald-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                      <Play size={20} className="fill-current ml-0.5" />
                    </div>
                  </div>

                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md shadow-sm ${
                        item.published !== false
                          ? "bg-emerald-900/80 text-white"
                          : "bg-red-900/80 text-white"
                      }`}
                    >
                      {item.published !== false ? "Live" : "Hidden"}
                    </span>
                  </div>

                  {item.duration && (
                    <div className="absolute bottom-2 right-2">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-black/75 text-white backdrop-blur-sm">
                        {formatDuration(item.duration)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
                    {item.patientName}
                  </div>
                  <h3 className="font-semibold text-stone-900 text-sm line-clamp-1">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleTogglePublished(item)}
                  className={`text-xs font-medium flex items-center gap-1 transition ${
                    item.published !== false
                      ? "text-stone-500 hover:text-stone-700"
                      : "text-emerald-700 hover:text-emerald-800"
                  }`}
                  title={item.published !== false ? "Hide from public" : "Publish video"}
                >
                  {item.published !== false ? (
                    <>
                      <EyeOff size={14} /> <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <Eye size={14} /> <span>Publish</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition"
                    title="Edit video details"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setItemToDelete(item)}
                    className="p-1.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition"
                    title="Delete video"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Video Testimonial" : "Add Video Testimonial"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-stone-800 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Recovery from Chronic Joint Pain with Janu Basti"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-800 mb-1">
              Patient / Testimonial Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.patientName}
              onChange={(e) => setForm({ ...form, patientName: e.target.value })}
              placeholder="e.g. Rajesh S. (Pilani)"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-800 mb-1">
              Description / Case Summary
            </label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief summary of their health journey and clinical outcome..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-stone-800 mb-1">
                Display Order
              </label>
              <Input
                type="number"
                value={form.displayOrder}
                onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-stone-800">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  className="rounded text-emerald-800 focus:ring-emerald-700"
                />
                <span>Publish publicly</span>
              </label>
            </div>
          </div>

          {/* Reusable Video Upload Component */}
          <VideoUpload
            value={form.videoUrl}
            thumbnailUrl={form.thumbnailUrl}
            onChange={(res) =>
              setForm({
                ...form,
                videoUrl: res.videoUrl,
                storagePath: res.storagePath || "",
                thumbnailUrl: res.thumbnailUrl || "",
                thumbnailStoragePath: res.thumbnailStoragePath || "",
                fileSize: res.fileSize || 0,
                duration: res.duration || 0,
              })
            }
            folder="testimonials"
            label="Video File (MP4 or WEBM, Max 10 MB)"
            required
            disabled={!editingItem && isLimitReached}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-emerald-800 hover:bg-emerald-900 text-white"
              disabled={saving || (!editingItem && isLimitReached)}
            >
              {saving ? "Saving..." : editingItem ? "Update Video" : "Save Video"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        title="Confirm Video Deletion"
      >
        <div className="space-y-4">
          <p className="text-sm text-stone-600">
            Are you sure you want to delete <strong>&ldquo;{itemToDelete?.title}&rdquo;</strong>? This will permanently remove the video and its storage files.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setItemToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleConfirmDelete}
            >
              Delete Video
            </Button>
          </div>
        </div>
      </Modal>

      {/* Video Preview Modal */}
      <Modal
        isOpen={!!previewItem}
        onClose={() => setPreviewItem(null)}
        title={previewItem?.title || "Video Preview"}
      >
        {previewItem && (
          <div className="space-y-3">
            <div className="aspect-video bg-black rounded-xl overflow-hidden">
              <video
                src={previewItem.videoUrl}
                poster={previewItem.thumbnailUrl}
                controls
                playsInline
                preload="metadata"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                {previewItem.patientName}
              </div>
              <p className="text-sm text-stone-600 mt-1">
                {previewItem.description || "No description provided."}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
