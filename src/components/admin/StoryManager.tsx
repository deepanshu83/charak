"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import {
  fetchAdminStories,
  adminCreateStory,
  adminUpdateStory,
  adminDeleteStory,
  type AdminPatientStory,
} from "@/lib/patientStoryService";
import { Badge, Button, Input, Modal, Select, Textarea, useToast } from "@/components/ui";
import ImageUpload from "./ImageUpload";

export default function StoryManager() {
  const toast = useToast();
  const [stories, setStories] = useState<AdminPatientStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<AdminPatientStory | null>(null);
  const [storyToDelete, setStoryToDelete] = useState<AdminPatientStory | null>(null);

  const [form, setForm] = useState({
    name: "",
    location: "Pilani",
    treatment: "Panchakarma Detox",
    rating: 5,
    quote: "",
    image: "",
    storagePath: "",
    displayOrder: 0,
    published: true,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminStories();
      setStories(data);
    } catch (err) {
      console.error("[StoryManager] Failed to load stories from database:", err);
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingStory(null);
    setForm({
      name: "",
      location: "Pilani",
      treatment: "Panchakarma Detox",
      rating: 5,
      quote: "",
      image: "",
      storagePath: "",
      displayOrder: stories.length + 1,
      published: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (story: AdminPatientStory) => {
    setEditingStory(story);
    setForm({
      name: story.name,
      location: story.location || "Pilani",
      treatment: story.treatment,
      rating: story.rating,
      quote: story.quote,
      image: story.image || "",
      storagePath: story.storagePath || "",
      displayOrder: story.displayOrder || 0,
      published: story.published !== false,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.quote.trim()) {
      toast.error("Validation Error", "Patient name and testimonial story are required.");
      return;
    }

    setSaving(true);
    try {
      if (editingStory) {
        await adminUpdateStory(editingStory.id, {
          name: form.name.trim(),
          location: form.location.trim(),
          treatment: form.treatment.trim(),
          rating: Number(form.rating),
          quote: form.quote.trim(),
          image: form.image ? form.image.trim() : undefined,
          storagePath: form.storagePath || undefined,
          displayOrder: Number(form.displayOrder) || 0,
          published: form.published,
        });
        toast.success("Testimonial Updated", `Review from "${form.name}" updated.`);
      } else {
        await adminCreateStory({
          name: form.name.trim(),
          location: form.location.trim(),
          treatment: form.treatment.trim(),
          rating: Number(form.rating),
          quote: form.quote.trim(),
          image: form.image ? form.image.trim() : undefined,
          storagePath: form.storagePath || undefined,
          displayOrder: Number(form.displayOrder) || 0,
          published: form.published,
        });
        toast.success("Testimonial Added", `Review from "${form.name}" published.`);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      toast.error("Save Failed", err instanceof Error ? err.message : "Unable to save story");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublished = async (story: AdminPatientStory) => {
    const nextPublished = story.published === false ? true : false;
    try {
      await adminUpdateStory(story.id, { published: nextPublished });
      toast.success(
        nextPublished ? "Testimonial Published" : "Testimonial Hidden",
        `Review from "${story.name}" is now ${nextPublished ? "live on the public site" : "hidden"}.`
      );
      await loadData();
    } catch {
      toast.error("Update Failed", "Unable to update review visibility.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!storyToDelete) return;
    try {
      await adminDeleteStory(storyToDelete.id);
      toast.success("Testimonial Removed", `Review from "${storyToDelete.name}" deleted.`);
      setStoryToDelete(null);
      await loadData();
    } catch {
      toast.error("Delete Failed", "Unable to delete review.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif font-bold text-stone-900">
              Patient Testimonials CMS
            </h1>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
              {stories.length} Testimonials
            </span>
          </div>
          <p className="text-sm text-stone-600 mt-1">
            Manage authentic patient healing reviews and clinical recovery experiences.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/patient-stories"
            target="_blank"
            className="flex items-center gap-1.5 text-sm text-stone-600 hover:text-emerald-800 px-3 py-2 rounded-lg border border-stone-200 hover:bg-stone-50 transition"
          >
            <span>Live Section</span>
            <ExternalLink size={14} />
          </Link>
          <Button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white"
          >
            <Plus size={16} />
            <span>Add Testimonial</span>
          </Button>
        </div>
      </div>

      {/* Table or Empty State */}
      {loading ? (
        <div className="flex items-center justify-center p-16 text-stone-500 gap-2">
          <RefreshCw className="animate-spin" size={20} />
          <span>Loading testimonials...</span>
        </div>
      ) : stories.length === 0 ? (
        /* Empty State per Requirement 18: "No testimonials yet." with "Add Testimonial" CTA */
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
            <MessageSquare size={28} />
          </div>
          <h3 className="text-lg font-serif font-bold text-stone-800">
            No testimonials yet.
          </h3>
          <p className="text-sm text-stone-500 mt-1 max-w-sm mx-auto mb-5">
            Add patient testimonials to showcase honest feedback and verified recovery outcomes.
          </p>
          <Button
            onClick={openCreateModal}
            className="bg-emerald-800 hover:bg-emerald-900 text-white inline-flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Add Testimonial</span>
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/50 text-stone-600 text-xs uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Treatment</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Feedback Quote</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {stories.map((s) => (
                <tr key={s.id} className="hover:bg-stone-50/80 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {s.image ? (
                        <div className="relative w-9 h-9 rounded-full overflow-hidden bg-stone-100 flex-shrink-0">
                          <Image
                            src={s.image}
                            alt={s.name}
                            fill
                            sizes="36px"
                            className="object-cover"
                            unoptimized={s.image.startsWith("http") || s.image.startsWith("/uploads")}
                          />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {s.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <strong>{s.name}</strong>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-stone-600">{s.location || "Pilani"}</td>
                  <td className="py-3 px-4">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">
                      {s.treatment}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex text-amber-500 text-xs">
                      {Array.from({ length: s.rating || 5 }).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 max-w-xs truncate text-stone-600">
                    &ldquo;{s.quote}&rdquo;
                  </td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => handleTogglePublished(s)}
                      className="cursor-pointer"
                      title="Toggle publication"
                    >
                      <Badge variant={s.published !== false ? "success" : "neutral"}>
                        {s.published !== false ? "Published" : "Draft"}
                      </Badge>
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(s)}
                        className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                        title="Edit testimonial"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setStoryToDelete(s)}
                        className="p-1.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete testimonial"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStory ? "Edit Patient Testimonial" : "Add Patient Testimonial"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-stone-800 mb-1">
                Patient Name <span className="text-red-500">*</span>
              </label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Sunita R."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-800 mb-1">
                Location
              </label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Pilani or Jhunjhunu"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-stone-800 mb-1">
                Treatment Focus
              </label>
              <Input
                required
                value={form.treatment}
                onChange={(e) => setForm({ ...form, treatment: e.target.value })}
                placeholder="e.g. Panchakarma Detox, Joint Care"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-800 mb-1">
                Rating
              </label>
              <Select
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
              >
                <option value={5}>5 Stars (Excellent)</option>
                <option value={4}>4 Stars (Very Good)</option>
                <option value={3}>3 Stars (Good)</option>
                <option value={2}>2 Stars (Fair)</option>
                <option value={1}>1 Star</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-800 mb-1">
              Testimonial Story / Quote <span className="text-red-500">*</span>
            </label>
            <Textarea
              rows={3}
              required
              value={form.quote}
              onChange={(e) => setForm({ ...form, quote: e.target.value })}
              placeholder="Patient feedback regarding consultation and recovery..."
            />
          </div>

          {/* Reusable Image Upload for Patient Photo */}
          <ImageUpload
            value={form.image}
            onChange={(res) =>
              setForm({
                ...form,
                image: res.url,
                storagePath: res.storagePath || "",
              })
            }
            folder="testimonials"
            label="Patient Photo (Optional)"
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="story-published"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="rounded text-emerald-800 focus:ring-emerald-700"
            />
            <label htmlFor="story-published" className="text-sm font-medium text-stone-800 cursor-pointer">
              Publish publicly (visible to website visitors)
            </label>
          </div>

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
              disabled={saving}
            >
              {saving ? "Saving..." : editingStory ? "Update Testimonial" : "Save Testimonial"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!storyToDelete}
        onClose={() => setStoryToDelete(null)}
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          <p className="text-sm text-stone-600">
            Are you sure you want to delete the testimonial from <strong>&ldquo;{storyToDelete?.name}&rdquo;</strong>?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setStoryToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleConfirmDelete}
            >
              Delete Testimonial
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
