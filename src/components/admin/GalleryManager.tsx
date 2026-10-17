"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
  ImageIcon,
} from "lucide-react";
import {
  fetchAdminGallery,
  adminCreateGallery,
  adminUpdateGallery,
  adminDeleteGallery,
  getGalleryItems,
  subscribeGallery,
  type AdminGalleryItem,
} from "@/lib/galleryService";
import type { GalleryItem } from "@/types";
import { Badge, Button, Input, Modal, Select, useToast } from "@/components/ui";
import ImageUpload from "./ImageUpload";

const MAX_GALLERY_IMAGES = 50;

export default function GalleryManager() {
  const toast = useToast();
  const [items, setItems] = useState<AdminGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminGalleryItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<AdminGalleryItem | null>(null);

  const [form, setForm] = useState({
    title: "",
    category: "clinic" as GalleryItem["category"],
    caption: "",
    image: "",
    storagePath: "",
    fileSize: 0,
    displayOrder: 0,
    published: true,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminGallery();
      setItems(data);
    } catch (err) {
      console.error("[GalleryManager] Failed to load gallery items from database:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeGallery(() => {
      setItems(getGalleryItems());
    });
    return unsub;
  }, []);

  const isLimitReached = items.length >= MAX_GALLERY_IMAGES;

  const openCreateModal = () => {
    if (isLimitReached) {
      toast.error("Limit Reached", "Gallery limit of 50 images reached.");
      return;
    }
    setEditingItem(null);
    setForm({
      title: "",
      category: "clinic",
      caption: "",
      image: "",
      storagePath: "",
      fileSize: 0,
      displayOrder: items.length + 1,
      published: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: AdminGalleryItem) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      category: item.category as GalleryItem["category"],
      caption: item.caption || item.title,
      image: item.image,
      storagePath: item.storagePath || "",
      fileSize: item.fileSize || 0,
      displayOrder: item.displayOrder || 0,
      published: item.published !== false,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Validation Error", "Title is required.");
      return;
    }
    if (!form.image.trim()) {
      toast.error("Validation Error", "Please upload a photo for the gallery.");
      return;
    }

    if (!editingItem && isLimitReached) {
      toast.error("Limit Reached", "Gallery limit of 50 images reached.");
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        await adminUpdateGallery(editingItem.id, {
          title: form.title.trim(),
          category: form.category,
          caption: form.caption.trim() || form.title.trim(),
          image: form.image.trim(),
          storagePath: form.storagePath || undefined,
          fileSize: form.fileSize || undefined,
          displayOrder: Number(form.displayOrder) || 0,
          published: form.published,
        });
        toast.success("Photo Updated", `"${form.title}" details updated.`);
      } else {
        await adminCreateGallery({
          title: form.title.trim(),
          category: form.category,
          caption: form.caption.trim() || form.title.trim(),
          image: form.image.trim(),
          storagePath: form.storagePath || undefined,
          fileSize: form.fileSize || undefined,
          displayOrder: Number(form.displayOrder) || 0,
          published: form.published,
        });
        toast.success("Photo Added", `"${form.title}" added to clinic gallery.`);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      toast.error("Save Failed", err instanceof Error ? err.message : "Unable to save photo");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublished = async (item: AdminGalleryItem) => {
    const nextPublished = item.published === false ? true : false;
    try {
      await adminUpdateGallery(item.id, { published: nextPublished });
      toast.success(
        nextPublished ? "Photo Published" : "Photo Hidden",
        `"${item.title}" is now ${nextPublished ? "visible in the public gallery" : "hidden"}.`
      );
      await loadData();
    } catch {
      toast.error("Update Failed", "Unable to update gallery visibility.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await adminDeleteGallery(itemToDelete.id);
      toast.success("Photo Deleted", `"${itemToDelete.title}" removed.`);
      setItemToDelete(null);
      await loadData();
    } catch {
      toast.error("Delete Failed", "Unable to delete gallery photo.");
    }
  };

  const filteredItems = items.filter((item) => {
    if (filter === "all") return true;
    if (filter === "published") return item.published !== false;
    if (filter === "hidden") return item.published === false;
    return item.category === filter;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Bar */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "18px",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-sm)",
          padding: "24px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "18px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h1
              style={{
                fontSize: "1.7rem",
                color: "var(--green)",
                margin: 0,
                fontFamily: "var(--font-serif), Georgia, serif",
              }}
            >
              Gallery Management
            </h1>
            <Badge variant={isLimitReached ? "warning" : "gold"}>
              {items.length} / {MAX_GALLERY_IMAGES} Images
            </Badge>
          </div>
          <p style={{ margin: "6px 0 0", color: "var(--ink-light)", fontSize: "0.9rem" }}>
            Manage high-resolution clinic photos, Panchakarma suites, and herbal formulation glimpses.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/gallery" target="_blank">
            <Button variant="ghost" size="sm" icon={<ExternalLink size={14} />}>
              Live Gallery
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={openCreateModal}
            icon={<Plus size={16} />}
            disabled={isLimitReached}
          >
            Add Image
          </Button>
        </div>
      </div>

      {/* 50 Images Limit Warning Banner */}
      {isLimitReached && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderLeft: "4px solid #ef4444",
            padding: "14px 18px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "#991b1b",
            fontSize: "0.9rem",
          }}
        >
          <AlertTriangle size={20} style={{ color: "#ef4444", flexShrink: 0 }} />
          <div>
            <strong>Gallery limit of 50 images reached.</strong> Please delete or unpublish existing images before uploading new media.
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`filter-pill ${filter === "all" ? "active" : ""}`}
        >
          All ({items.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("therapy")}
          className={`filter-pill ${filter === "therapy" ? "active" : ""}`}
        >
          Therapies &amp; Panchakarma ({items.filter((i) => i.category === "therapy").length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("clinic")}
          className={`filter-pill ${filter === "clinic" ? "active" : ""}`}
        >
          Clinic &amp; Sanctuary ({items.filter((i) => i.category === "clinic").length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("herbs")}
          className={`filter-pill ${filter === "herbs" ? "active" : ""}`}
        >
          Herbs &amp; Apothecary ({items.filter((i) => i.category === "herbs").length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("published")}
          className={`filter-pill ${filter === "published" ? "active" : ""}`}
        >
          Live ({items.filter((i) => i.published !== false).length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("hidden")}
          className={`filter-pill ${filter === "hidden" ? "active" : ""}`}
        >
          Hidden ({items.filter((i) => i.published === false).length})
        </button>
      </div>

      {/* Grid or Empty State */}
      {loading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 20px",
            color: "var(--ink-muted)",
            gap: "8px",
          }}
        >
          <RefreshCw className="animate-spin" size={20} />
          <span>Loading gallery photos...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div
          style={{
            background: "#ffffff",
            padding: "54px 24px",
            textAlign: "center",
            borderRadius: "20px",
            border: "1px dashed var(--border)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "rgba(24, 66, 50, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              color: "var(--green)",
            }}
          >
            <ImageIcon size={30} />
          </div>
          <h3 style={{ fontSize: "1.25rem", color: "var(--green)", marginBottom: "8px" }}>
            No gallery images yet.
          </h3>
          <p
            style={{
              fontSize: "0.92rem",
              color: "var(--ink-light)",
              maxWidth: "460px",
              margin: "0 auto 24px",
              lineHeight: 1.6,
            }}
          >
            Upload your authentic clinic spaces, Panchakarma therapy suites, and herbal formulation glimpses to showcase to visitors.
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={openCreateModal}
            icon={<Plus size={16} />}
            disabled={isLimitReached}
          >
            Add Image
          </Button>
        </div>
      ) : (
        <div className="admin-gallery-grid">
          {filteredItems.map((item) => (
            <div key={item.id} className="admin-gallery-card">
              <div className="gallery-card-thumb">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  style={{ objectFit: "cover" }}
                  unoptimized={item.image.startsWith("http") || item.image.startsWith("/uploads")}
                />
                <span className="gallery-badge">
                  {item.category}
                </span>
                <span
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: item.published !== false ? "rgba(24, 66, 50, 0.9)" : "rgba(185, 28, 28, 0.9)",
                    color: "#ffffff",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    padding: "3px 8px",
                    borderRadius: "12px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  }}
                >
                  {item.published !== false ? "Live" : "Hidden"}
                </span>
              </div>

              <div className="gallery-card-body">
                <h4
                  style={{
                    margin: 0,
                    fontSize: "0.96rem",
                    color: "var(--green)",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={item.title}
                >
                  {item.title}
                </h4>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.82rem",
                    color: "var(--ink-light)",
                    lineHeight: 1.5,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {item.caption || item.title}
                </p>

                <div
                  style={{
                    borderTop: "1px solid rgba(24, 66, 50, 0.08)",
                    paddingTop: "12px",
                    marginTop: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleTogglePublished(item)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: item.published !== false ? "var(--ink-muted)" : "var(--green)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "4px 8px",
                      borderRadius: "6px",
                    }}
                    title={item.published !== false ? "Hide from public" : "Publish to gallery"}
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

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      style={{
                        background: "rgba(24, 66, 50, 0.06)",
                        border: "none",
                        borderRadius: "8px",
                        padding: "6px 8px",
                        cursor: "pointer",
                        color: "var(--green)",
                      }}
                      title="Edit photo details"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setItemToDelete(item)}
                      style={{
                        background: "rgba(239, 68, 68, 0.1)",
                        border: "none",
                        borderRadius: "8px",
                        padding: "6px 8px",
                        cursor: "pointer",
                        color: "#dc2626",
                      }}
                      title="Delete photo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
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
        title={editingItem ? "Edit Gallery Image" : "Add Gallery Image"}
      >
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--ink)", marginBottom: "6px" }}>
              Title <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Classical Shirodhara Therapy Room"
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--ink)", marginBottom: "6px" }}>
              Category <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <Select
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value as GalleryItem["category"] })
              }
            >
              <option value="therapy">Therapies &amp; Panchakarma</option>
              <option value="clinic">Clinic &amp; Sanctuary</option>
              <option value="herbs">Herbs &amp; Apothecary</option>
            </Select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--ink)", marginBottom: "6px" }}>
              Caption / Short Note
            </label>
            <Input
              value={form.caption}
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
              placeholder="e.g. Gentle stream of medicated herbal oils for deep nervous system relaxation"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", alignItems: "center" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--ink)", marginBottom: "6px" }}>
                Display Order
              </label>
              <Input
                type="number"
                value={form.displayOrder}
                onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>
            <div style={{ paddingTop: "20px" }}>
              <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.88rem", fontWeight: 500, color: "var(--ink)" }}>
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  style={{ accentColor: "var(--green)", width: "16px", height: "16px" }}
                />
                <span>Publish to public gallery</span>
              </label>
            </div>
          </div>

          {/* Reusable Image Upload with Automatic WebP Compression */}
          <ImageUpload
            value={form.image}
            onChange={(res) =>
              setForm({
                ...form,
                image: res.url,
                storagePath: res.storagePath || "",
                fileSize: res.fileSize || 0,
              })
            }
            folder="gallery"
            label="Gallery Photo (JPG, PNG or WEBP)"
            required
          />

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              paddingTop: "16px",
              borderTop: "1px solid var(--border)",
              marginTop: "8px",
            }}
          >
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
              variant="primary"
              disabled={saving || (!editingItem && isLimitReached)}
            >
              {saving ? "Saving..." : editingItem ? "Update Image" : "Save Image"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        title="Confirm Photo Deletion"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <p style={{ fontSize: "0.92rem", color: "var(--ink-light)", margin: 0 }}>
            Are you sure you want to delete <strong>&ldquo;{itemToDelete?.title}&rdquo;</strong>? This will permanently remove the record and its storage object.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
            <Button variant="outline" onClick={() => setItemToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
            >
              Delete Photo
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
