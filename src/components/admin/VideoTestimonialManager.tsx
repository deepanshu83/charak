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
  Video as VideoIcon,
  Play,
  X,
  CheckCircle2,
} from "lucide-react";
import {
  fetchAdminVideoTestimonials,
  adminCreateVideoTestimonial,
  adminUpdateVideoTestimonial,
  adminDeleteVideoTestimonial,
} from "@/lib/videoTestimonialService";
import type { VideoTestimonial } from "@/types";
import { Button, Modal, useToast } from "@/components/ui";
import { extractYouTubeId, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "@/lib/youtubeUtils";

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
    thumbnailUrl: "",
    published: true,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminVideoTestimonials();
      setItems(data || []);
    } catch (err) {
      console.error("[VideoTestimonials] Failed to load data:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setForm({
      title: "",
      patientName: "",
      description: "",
      videoUrl: "",
      thumbnailUrl: "",
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
      thumbnailUrl: item.thumbnailUrl || getYouTubeThumbnailUrl(item.videoUrl),
      published: item.published,
    });
    setIsModalOpen(true);
  };

  const handleVideoUrlChange = (url: string) => {
    const ytid = extractYouTubeId(url);
    const thumb = ytid ? `https://img.youtube.com/vi/${ytid}/hqdefault.jpg` : form.thumbnailUrl;
    setForm((prev) => ({
      ...prev,
      videoUrl: url,
      thumbnailUrl: thumb,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.patientName.trim() || !form.videoUrl.trim()) {
      toast.error("Please fill in Title, Patient Name, and YouTube Video URL.");
      return;
    }

    const ytid = extractYouTubeId(form.videoUrl);
    if (!ytid) {
      toast.error("Please enter a valid YouTube link (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...)");
      return;
    }

    const finalThumb = form.thumbnailUrl || `https://img.youtube.com/vi/${ytid}/hqdefault.jpg`;

    setSaving(true);
    try {
      if (editingItem) {
        await adminUpdateVideoTestimonial(editingItem.id, {
          title: form.title.trim(),
          patientName: form.patientName.trim(),
          description: form.description.trim() || undefined,
          videoUrl: form.videoUrl.trim(),
          thumbnailUrl: finalThumb,
          published: form.published,
        });
        toast.success("Video testimonial updated successfully!");
      } else {
        await adminCreateVideoTestimonial({
          title: form.title.trim(),
          patientName: form.patientName.trim(),
          description: form.description.trim() || undefined,
          videoUrl: form.videoUrl.trim(),
          thumbnailUrl: finalThumb,
          published: form.published,
        });
        toast.success("Video testimonial added successfully!");
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save video testimonial");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (item: VideoTestimonial) => {
    try {
      await adminUpdateVideoTestimonial(item.id, {
        published: !item.published,
      });
      toast.success(item.published ? "Video hidden from public website." : "Video published successfully!");
      await loadData();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await adminDeleteVideoTestimonial(itemToDelete.id);
      toast.success("Video testimonial removed");
      setItemToDelete(null);
      await loadData();
    } catch {
      toast.error("Failed to delete video testimonial");
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 14px",
    fontSize: "0.93rem",
    borderRadius: "10px",
    border: "1.5px solid #dcd3c6",
    background: "#ffffff",
    color: "#1e2621",
    outline: "none",
    fontFamily: "inherit",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.86rem",
    fontWeight: 600,
    color: "var(--green, #184232)",
    marginBottom: "6px",
  };

  const extractedId = extractYouTubeId(form.videoUrl);

  return (
    <div className="wrap admin-page-container">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Patient Stories • YouTube Integration
          </span>
          <h1 style={{ marginTop: "4px", fontSize: "1.8rem", color: "var(--green)" }}>
            Video Testimonials
          </h1>
          <p style={{ color: "var(--ink-light)", fontSize: "0.95rem" }}>
            Add patient video stories via YouTube links. Videos play directly on the website without sending visitors away.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadData}
            icon={<RefreshCw size={14} className={loading ? "animate-spin" : ""} />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={openCreateModal}
            icon={<Plus size={15} />}
          >
            Add YouTube Video
          </Button>
        </div>
      </div>

      {/* Grid of Videos */}
      {loading ? (
        <div style={{ padding: "60px 0", textAlign: "center", color: "var(--ink-light)" }}>
          Loading video testimonials…
        </div>
      ) : items.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 24px",
            background: "#ffffff",
            border: "1px solid #e7dfd3",
            borderRadius: "16px",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(24, 66, 50, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "var(--green)" }}>
            <VideoIcon size={32} />
          </div>
          <h3 style={{ fontSize: "1.3rem", color: "var(--green)", marginBottom: "8px" }}>
            No Video Testimonials Yet
          </h3>
          <p style={{ color: "var(--ink-light)", fontSize: "0.95rem", marginBottom: "20px", lineHeight: "1.6" }}>
            Paste a YouTube video link to showcase patient recovery stories on the website. Videos will play directly inside the website without redirecting visitors to YouTube.
          </p>
          <Button variant="primary" onClick={openCreateModal} icon={<Plus size={15} />}>
            Add First Video
          </Button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "24px",
          }}
        >
          {items.map((item) => {
            const ytid = extractYouTubeId(item.videoUrl);
            const thumb = item.thumbnailUrl || (ytid ? `https://img.youtube.com/vi/${ytid}/hqdefault.jpg` : "/images/g5.jpg");

            return (
              <div
                key={item.id}
                style={{
                  background: "#ffffff",
                  borderRadius: "18px",
                  border: "1.5px solid #e7dfd3",
                  overflow: "hidden",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.04)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Thumbnail with Play Overlay */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    paddingTop: "56.25%",
                    background: "#000",
                    cursor: "pointer",
                  }}
                  onClick={() => setPreviewItem(item)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumb}
                    alt={item.title}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      background: "rgba(0,0,0,0.35)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "background 0.2s ease",
                    }}
                  >
                    <div
                      style={{
                        width: "52px",
                        height: "52px",
                        borderRadius: "50%",
                        background: "#FF0000",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                      }}
                    >
                      <Play size={24} fill="#ffffff" style={{ marginLeft: "3px" }} />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: "18px", flexGrow: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      YouTube Video
                    </span>
                    <span
                      style={{
                        padding: "3px 9px",
                        borderRadius: "999px",
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        background: item.published ? "rgba(46, 125, 50, 0.12)" : "rgba(100, 116, 139, 0.12)",
                        color: item.published ? "#2e7d32" : "#64748b",
                      }}
                    >
                      {item.published ? "Published" : "Hidden"}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "1.1rem", color: "var(--green)", marginBottom: "6px", lineHeight: "1.4" }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--gold-dark, #a87932)", marginBottom: "8px" }}>
                    {item.patientName}
                  </p>
                  {item.description && (
                    <p style={{ fontSize: "0.85rem", color: "var(--ink-light)", marginBottom: "14px", lineHeight: "1.5", flexGrow: 1 }}>
                      {item.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "8px", marginTop: "auto", paddingTop: "12px", borderTop: "1px solid #f0eae1" }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTogglePublish(item)}
                      title={item.published ? "Hide from website" : "Publish on website"}
                    >
                      {item.published ? <EyeOff size={14} /> : <Eye size={14} />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(item)}
                      icon={<Edit2 size={13} />}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setItemToDelete(item)}
                      icon={<Trash2 size={13} />}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Video Testimonial" : "Add YouTube Video Testimonial"}
        size="lg"
      >
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px", paddingTop: "6px" }}>
          {/* Title */}
          <div>
            <label style={labelStyle}>Video Title *</label>
            <input
              style={inputStyle}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Chronic Joint Pain Recovery with Panchakarma"
              required
            />
          </div>

          {/* Patient Name */}
          <div>
            <label style={labelStyle}>Patient Name & Location *</label>
            <input
              style={inputStyle}
              value={form.patientName}
              onChange={(e) => setForm({ ...form, patientName: e.target.value })}
              placeholder="e.g. Rajesh Sharma, Pilani"
              required
            />
          </div>

          {/* YouTube Video URL */}
          <div>
            <label style={labelStyle}>
              YouTube Video Link / URL *
            </label>
            <div style={{ position: "relative" }}>
              <input
                style={{ ...inputStyle, paddingLeft: "40px" }}
                value={form.videoUrl}
                onChange={(e) => handleVideoUrlChange(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                required
              />
              <VideoIcon
                size={18}
                style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#FF0000" }}
              />
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--ink-light)", marginTop: "4px" }}>
              Paste standard YouTube video, Shorts, or youtu.be link. Video will play directly on your website.
            </p>
          </div>

          {/* Live Preview if ID is valid */}
          {extractedId ? (
            <div style={{ background: "#000000", borderRadius: "12px", overflow: "hidden", border: "1.5px solid var(--gold)" }}>
              <div style={{ padding: "8px 12px", background: "var(--deep)", color: "#ffffff", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle2 size={14} style={{ color: "var(--gold)" }} />
                <span>Live Video Embed Preview (16:9 Widescreen):</span>
              </div>
              <div className="video-player-frame" style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", background: "#000000", overflow: "hidden" }}>
                <iframe
                  src={getYouTubeEmbedUrl(extractedId, false) || `https://www.youtube-nocookie.com/embed/${extractedId}?rel=0&playsinline=1`}
                  title="YouTube Preview"
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          ) : form.videoUrl.trim() ? (
            <p style={{ color: "#c0392b", fontSize: "0.84rem" }}>
              ⚠️ Could not extract YouTube video ID. Please check the URL format.
            </p>
          ) : null}

          {/* Description */}
          <div>
            <label style={labelStyle}>Treatment / Case Summary (Optional)</label>
            <textarea
              style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. 14-day Janu Basti & classical Panchakarma therapy outcome..."
              rows={3}
            />
          </div>

          {/* Published */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="checkbox"
              id="publish-video"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              style={{ width: "18px", height: "18px", accentColor: "var(--green)", cursor: "pointer" }}
            />
            <label htmlFor="publish-video" style={{ cursor: "pointer", fontWeight: 600, fontSize: "0.9rem", color: "var(--green)" }}>
              Publish publicly on website (/stories & /video-testimonials)
            </label>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "12px" }}>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={saving || !extractedId}>
              {saving ? "Saving…" : editingItem ? "Save Changes" : "Add Video Testimonial"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        title="Delete Video Testimonial"
        size="sm"
        footer={
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <Button variant="ghost" onClick={() => setItemToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        }
      >
        <p style={{ margin: 0, color: "var(--ink-light)", fontSize: "0.95rem" }}>
          Are you sure you want to remove &quot;{itemToDelete?.title}&quot;?
        </p>
      </Modal>

      {/* Video Modal Player (Plays on Website) */}
      {previewItem && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.88)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setPreviewItem(null)}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "min(960px, calc((100vh - 110px) * (16 / 9)))",
              maxHeight: "96vh",
              background: "#071711",
              borderRadius: "18px",
              overflow: "hidden",
              boxShadow: "0 24px 70px rgba(0,0,0,0.85), 0 0 0 1px rgba(194,139,56,0.3)",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewItem(null)}
              aria-label="Close video preview"
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                background: "rgba(0, 0, 0, 0.75)",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.35)",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 30,
              }}
            >
              <X size={20} />
            </button>

            <div className="video-player-frame" style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", background: "#000000", overflow: "hidden" }}>
              <iframe
                src={getYouTubeEmbedUrl(previewItem.videoUrl, true) || ""}
                title={previewItem.title}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            <div className="video-modal-info" style={{ padding: "16px 22px", background: "#0d261b", color: "#ffffff", borderTop: "1px solid rgba(194, 139, 56, 0.2)" }}>
              <h4 style={{ fontSize: "1.15rem", color: "var(--cream)", marginBottom: "4px" }}>
                {previewItem.title}
              </h4>
              <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.75)", margin: 0 }}>
                {previewItem.patientName} {previewItem.description ? `• ${previewItem.description}` : ""}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
