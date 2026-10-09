"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Clock,
  Edit2,
  ExternalLink,
  HeartPulse,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import {
  adminCreateTreatment,
  adminDeleteTreatment,
  adminUpdateTreatment,
  fetchAdminTreatments,
  type AdminTreatment,
} from "@/lib/treatmentService";
import { Badge, Button, Input, Modal, Textarea, useToast } from "@/components/ui";
import ImageUpload from "@/components/admin/ImageUpload";

const emptyForm = {
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  duration: "45 min",
  price: 1200,
  image: "",
  storagePath: "",
  active: true,
};

export default function TreatmentManager() {
  const toast = useToast();
  const [treatments, setTreatments] = useState<AdminTreatment[]>([]);
  const [editingInlineId, setEditingInlineId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editDuration, setEditDuration] = useState<string>("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<AdminTreatment | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    try {
      const list = await fetchAdminTreatments();
      setTreatments(list);
    } catch (err) {
      console.error("[TreatmentManager] Failed to load treatments from database:", err);
      setTreatments([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartInlineEdit = (t: AdminTreatment) => {
    setEditingInlineId(t.id);
    setEditPrice(t.price);
    setEditDuration(t.duration);
  };

  const handleSaveInline = async (id: string, name: string) => {
    await adminUpdateTreatment(id, { price: editPrice, duration: editDuration });
    setEditingInlineId(null);
    await loadData();
    toast.success("Treatment Updated", `Pricing for ${name} updated to ₹${editPrice.toLocaleString("en-IN")}.`);
  };

  const handleOpenAdd = () => {
    setEditingTreatment(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: AdminTreatment) => {
    setEditingTreatment(t);
    setForm({
      name: t.name,
      slug: t.slug || t.id,
      shortDescription: t.shortDescription || "",
      description: t.description,
      duration: t.duration,
      price: t.price,
      image: t.image || "",
      storagePath: t.storagePath || "",
      active: t.active !== false,
    });
    setIsModalOpen(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || isSaving) return;

    if (form.price < 0) {
      toast.error("Invalid Price", "Price cannot be negative.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingTreatment) {
        await adminUpdateTreatment(editingTreatment.id, {
          name: form.name.trim(),
          slug: form.slug.trim(),
          shortDescription: form.shortDescription.trim(),
          description: form.description.trim() || form.shortDescription.trim(),
          duration: form.duration.trim(),
          price: Number(form.price),
          image: form.image.trim(),
          storagePath: form.storagePath.trim() || undefined,
          active: form.active,
        });
        toast.success("Treatment Updated", `"${form.name}" was successfully updated.`);
      } else {
        const created = await adminCreateTreatment({
          name: form.name.trim(),
          slug: form.slug.trim() || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          shortDescription: form.shortDescription.trim(),
          description: form.description.trim() || form.shortDescription.trim(),
          duration: form.duration.trim(),
          price: Number(form.price),
          image: form.image.trim(),
          storagePath: form.storagePath.trim() || undefined,
          active: form.active,
        });
        toast.success("Treatment Added", `"${created.name}" is now configured.`);
      }
      setIsModalOpen(false);
      await loadData();
    } catch {
      toast.error("Save Failed", "Could not save treatment.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (t: AdminTreatment) => {
    if (!confirm(`Are you sure you want to remove "${t.name}"?`)) return;
    await adminDeleteTreatment(t.id);
    toast.success("Treatment Removed", `"${t.name}" was deleted.`);
    await loadData();
  };

  const handleToggleActive = async (t: AdminTreatment) => {
    const nextState = !t.active;
    await adminUpdateTreatment(t.id, { active: nextState });
    toast.info(
      nextState ? "Treatment Activated" : "Treatment Deactivated",
      `"${t.name}" is now ${nextState ? "active" : "hidden"}.`
    );
    await loadData();
  };

  return (
    <div className="wrap admin-page-container">
      <div className="admin-page-header">
        <div>
          <Badge variant="gold">Clinical Services</Badge>
          <h1 style={{ marginTop: "6px" }}>Manage Treatments &amp; Therapies</h1>
          <p>
            Configure classical Panchakarma therapies, consultation offerings, duration, and pricing.
          </p>
        </div>
        <div className="header-quick-actions" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Link href="/what-we-treat" target="_blank">
            <Button variant="ghost" size="sm" icon={<ExternalLink size={15} />}>
              Public Treatments Page
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            icon={<Plus size={16} />}
          >
            Add Treatment
          </Button>
        </div>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Treatment Name</th>
              <th>Description</th>
              <th>Duration</th>
              <th>Price (₹)</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {treatments.map((t) => {
              const isEditing = editingInlineId === t.id;

              return (
                <tr key={t.id}>
                  <td>
                    <div className="treatment-name-cell">
                      <div className="treatment-icon-wrap">
                        <HeartPulse size={18} />
                      </div>
                      <div>
                        <strong>{t.name}</strong>
                        {t.slug && <span className="text-muted text-xs" style={{ display: "block" }}>/{t.slug}</span>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="text-sm text-muted">{t.description}</span>
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editDuration}
                        onChange={(e) => setEditDuration(e.target.value)}
                        className="table-inline-input"
                      />
                    ) : (
                      <span className="text-sm">
                        <Clock size={12} style={{ verticalAlign: "-1px", marginRight: "4px" }} />
                        {t.duration}
                      </span>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(Number(e.target.value))}
                        className="table-inline-input"
                        style={{ width: "90px" }}
                      />
                    ) : (
                      <strong>₹{t.price.toLocaleString("en-IN")}</strong>
                    )}
                  </td>
                  <td>
                    <Badge variant={t.active !== false ? "success" : "neutral"}>
                      {t.active !== false ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div className="table-actions-cell">
                      {isEditing ? (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleSaveInline(t.id, t.name)}
                            icon={<Save size={14} />}
                          >
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingInlineId(null)}
                            icon={<X size={14} />}
                          />
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="action-icon-btn"
                            title="Quick Edit Fee"
                            onClick={() => handleStartInlineEdit(t)}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            className="action-icon-btn"
                            title="Edit Full Details"
                            onClick={() => handleOpenEdit(t)}
                          >
                            <Edit2 size={14} color="var(--gold)" />
                          </button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(t)}
                          >
                            {t.active !== false ? "Hide" : "Show"}
                          </Button>
                          <button
                            type="button"
                            className="action-icon-btn"
                            title="Delete Treatment"
                            onClick={() => handleDelete(t)}
                            style={{ color: "var(--crimson)" }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Treatment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTreatment ? `Edit ${editingTreatment.name}` : "Add New Treatment"}
      >
        <form onSubmit={handleSaveModal} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Input
            label="Treatment Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Panchakarma Detox"
            required
          />
          <Input
            label="URL Slug (Unique)"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="panchakarma-detox"
          />
          <Input
            label="Short Summary"
            value={form.shortDescription}
            onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
            placeholder="Classical five-step cleansing and rehabilitation plan"
          />
          <Textarea
            label="Full Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Comprehensive description of clinical procedure and benefits..."
            rows={3}
            required
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Input
              label="Duration"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              placeholder="45 min"
              required
            />
            <Input
              label="Price (₹)"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              min={0}
              required
            />
          </div>
          <ImageUpload
            bucket="hospital-images"
            folder="treatments"
            label="Treatment Photo"
            currentImageUrl={form.image}
            value={form.image}
            onChange={(res) => {
              setForm((prev) => ({
                ...prev,
                image: res.publicUrl,
                storagePath: res.storagePath || "",
              }));
            }}
            onRemove={() => {
              setForm((prev) => ({
                ...prev,
                image: "",
                storagePath: "",
              }));
            }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="checkbox"
              id="treat-active"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            <label htmlFor="treat-active" style={{ fontSize: "0.9rem", cursor: "pointer" }}>
              Active (Visible on public What We Treat page)
            </label>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : editingTreatment ? "Save Changes" : "Create Treatment"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
