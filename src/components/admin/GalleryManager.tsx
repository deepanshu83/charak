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
import { Button, Input, Modal, Select, useToast } from "@/components/ui";
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
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif font-bold text-stone-900">
              Gallery Management
            </h1>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                isLimitReached
                  ? "bg-red-100 text-red-700 font-bold"
                  : items.length > 40
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {items.length} / {MAX_GALLERY_IMAGES} Images
            </span>
          </div>
          <p className="text-sm text-stone-600 mt-1">
            Manage high-resolution clinic photos, Panchakarma suites, and herbal formulation glimpses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/gallery"
            target="_blank"
            className="flex items-center gap-1.5 text-sm text-stone-600 hover:text-emerald-800 px-3 py-2 rounded-lg border border-stone-200 hover:bg-stone-50 transition"
          >
            <span>Live Gallery</span>
            <ExternalLink size={14} />
          </Link>
          <Button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white"
            disabled={isLimitReached}
          >
            <Plus size={16} />
            <span>Add Image</span>
          </Button>
        </div>
      </div>

      {/* 50 Images Limit Warning Banner */}
      {isLimitReached && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-center gap-3 text-red-800 text-sm">
          <AlertTriangle size={20} className="flex-shrink-0 text-red-500" />
          <div>
            <strong>Gallery limit of 50 images reached.</strong> Please delete or unpublish existing images before uploading new media.
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-sm">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-1.5 rounded-full font-medium transition ${
            filter === "all"
              ? "bg-stone-900 text-white"
              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          }`}
        >
          All ({items.length})
        </button>
        <button
          onClick={() => setFilter("therapy")}
          className={`px-4 py-1.5 rounded-full font-medium transition ${
            filter === "therapy"
              ? "bg-stone-900 text-white"
              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          }`}
        >
          Therapies &amp; Panchakarma
        </button>
        <button
          onClick={() => setFilter("clinic")}
          className={`px-4 py-1.5 rounded-full font-medium transition ${
            filter === "clinic"
              ? "bg-stone-900 text-white"
              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          }`}
        >
          Clinic &amp; Sanctuary
        </button>
        <button
          onClick={() => setFilter("herbs")}
          className={`px-4 py-1.5 rounded-full font-medium transition ${
            filter === "herbs"
              ? "bg-stone-900 text-white"
              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          }`}
        >
          Herbs &amp; Apothecary
        </button>
        <button
          onClick={() => setFilter("published")}
          className={`px-4 py-1.5 rounded-full font-medium transition ${
            filter === "published"
              ? "bg-stone-900 text-white"
              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          }`}
        >
          Live ({items.filter((i) => i.published !== false).length})
        </button>
        <button
          onClick={() => setFilter("hidden")}
          className={`px-4 py-1.5 rounded-full font-medium transition ${
            filter === "hidden"
              ? "bg-stone-900 text-white"
              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          }`}
        >
          Hidden ({items.filter((i) => i.published === false).length})
        </button>
      </div>

      {/* Grid or Empty State */}
      {loading ? (
        <div className="flex items-center justify-center p-16 text-stone-500 gap-2">
          <RefreshCw className="animate-spin" size={20} />
          <span>Loading gallery photos...</span>
        </div>
      ) : filteredItems.length === 0 ? (
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
            <ImageIcon size={28} />
          </div>
          <h3 className="text-lg font-serif font-bold text-stone-800">
            No gallery images yet.
          </h3>
          <p className="text-sm text-stone-500 mt-1 max-w-sm mx-auto mb-5">
            Upload your clinic healing spaces, Panchakarma chambers, and herbal formulations to showcase to visitors.
          </p>
          <Button
            onClick={openCreateModal}
            className="bg-emerald-800 hover:bg-emerald-900 text-white inline-flex items-center gap-2"
            disabled={isLimitReached}
          >
            <Plus size={16} />
            <span>Add Image</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[4/3] w-full bg-stone-100">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover"
                    unoptimized={item.image.startsWith("http") || item.image.startsWith("/uploads")}
                  />
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
                  <div className="absolute bottom-2 left-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-sm">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-stone-900 text-sm line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                    {item.caption || item.title}
                  </p>
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

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition"
                    title="Edit image details"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setItemToDelete(item)}
                    className="p-1.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition"
                    title="Delete image"
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
        title={editingItem ? "Edit Gallery Image" : "Add Gallery Image"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-stone-800 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Classical Shirodhara Therapy Room"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-800 mb-1">
              Category <span className="text-red-500">*</span>
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
            <label className="block text-sm font-semibold text-stone-800 mb-1">
              Caption / Short Note
            </label>
            <Input
              value={form.caption}
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
              placeholder="e.g. Gentle stream of medicated herbal oils for deep nervous system relaxation"
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
        <div className="space-y-4">
          <p className="text-sm text-stone-600">
            Are you sure you want to delete <strong>&ldquo;{itemToDelete?.title}&rdquo;</strong>? This will permanently remove the record and its storage object.
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
              Delete Photo
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
