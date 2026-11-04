"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Briefcase,
  Edit2,
  Plus,
  RefreshCw,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Badge, Button, Modal, useToast } from "@/components/ui";
import type { JobVacancy, CreateJobVacancyInput } from "@/lib/careersService";

const DEPARTMENTS = [
  "Medical",
  "Therapy",
  "Nursing",
  "Pharmacy",
  "Administration",
  "Reception",
  "Housekeeping",
  "Other",
];

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];

const EXPERIENCE_OPTIONS = [
  "Fresher",
  "0–1 Years",
  "1–3 Years",
  "3–5 Years",
  "5+ Years",
];

const EMPTY_FORM: CreateJobVacancyInput = {
  title: "",
  department: "Medical",
  location: "Pilani, Rajasthan",
  type: "Full-time",
  experience: "Fresher",
  description: "",
  requirements: "",
  salaryRange: "",
  applyEmail: "",
  active: true,
  displayOrder: 0,
};

function mapRow(row: Record<string, unknown>): JobVacancy {
  return {
    id: row.id as string,
    title: row.title as string,
    department: row.department as string,
    location: row.location as string,
    type: row.type as string,
    experience: row.experience as string,
    description: row.description as string,
    requirements: (row.requirements ?? null) as string | null,
    salaryRange: (row.salary_range ?? null) as string | null,
    applyEmail: (row.apply_email ?? null) as string | null,
    active: row.active as boolean,
    displayOrder: (row.display_order as number) ?? 0,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export default function CareersManager() {
  const toast = useToast();
  const [vacancies, setVacancies] = useState<JobVacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateJobVacancyInput>({ ...EMPTY_FORM });

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<JobVacancy | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const inFlightRef = useRef(false);

  const loadVacancies = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/careers");
      const json = await res.json();
      if (json.ok && Array.isArray(json.data)) {
        setVacancies(json.data.map(mapRow));
      }
    } catch {
      toast.error("Failed to load job vacancies");
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadVacancies();
  }, [loadVacancies]);

  // ─── Open form ───────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setModalOpen(true);
  };

  const openEdit = (v: JobVacancy) => {
    setEditingId(v.id);
    setForm({
      title: v.title,
      department: v.department,
      location: v.location,
      type: v.type,
      experience: v.experience,
      description: v.description,
      requirements: v.requirements ?? "",
      salaryRange: v.salaryRange ?? "",
      applyEmail: v.applyEmail ?? "",
      active: v.active,
      displayOrder: v.displayOrder,
    });
    setModalOpen(true);
  };

  // ─── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and Description are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...(editingId ? { id: editingId } : {}),
        title: form.title,
        department: form.department,
        location: form.location,
        type: form.type,
        experience: form.experience,
        description: form.description,
        requirements: form.requirements || null,
        salaryRange: form.salaryRange || null,
        applyEmail: form.applyEmail || null,
        active: form.active,
        displayOrder: form.displayOrder ?? 0,
      };

      const res = await fetch("/api/admin/careers", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Save failed");

      toast.success(editingId ? "Vacancy updated!" : "Vacancy created!");
      setModalOpen(false);
      await loadVacancies();
    } catch (err) {
      toast.error(String(err));
    } finally {
      setSaving(false);
    }
  };

  // ─── Toggle active ────────────────────────────────────────────────────────────
  const toggleActive = async (v: JobVacancy) => {
    try {
      const res = await fetch("/api/admin/careers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: v.id, active: !v.active }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      toast.success(`Vacancy ${!v.active ? "published" : "hidden"}`);
      await loadVacancies();
    } catch (err) {
      toast.error(String(err));
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────────
  const confirmDelete = (v: JobVacancy) => {
    setDeleteTarget(v);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      const res = await fetch(`/api/admin/careers?id=${deleteTarget.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      toast.success("Vacancy deleted");
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
      await loadVacancies();
    } catch (err) {
      toast.error(String(err));
    } finally {
      setDeletingId(null);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="wrap admin-page-container">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <Badge variant="gold">Careers • Vacancies</Badge>
          <h1 style={{ marginTop: "6px" }}>Job Vacancies</h1>
          <p>Manage hospital job postings displayed on the public Careers page.</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadVacancies}
            icon={<RefreshCw size={14} className={loading ? "animate-spin" : ""} />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={openCreate}
            icon={<Plus size={15} />}
          >
            Add Vacancy
          </Button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ padding: "60px 0", textAlign: "center", color: "#64748b" }}>
          Loading vacancies…
        </div>
      ) : vacancies.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 24px",
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
          }}
        >
          <Briefcase size={36} style={{ color: "#cbd5e1", marginBottom: "14px" }} />
          <h2 style={{ color: "#1e293b", marginBottom: "8px" }}>No vacancies yet</h2>
          <p style={{ color: "#64748b", marginBottom: "20px" }}>
            Click &quot;Add Vacancy&quot; to post your first job opening.
          </p>
          <Button variant="primary" onClick={openCreate} icon={<Plus size={15} />}>
            Add Vacancy
          </Button>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Department</th>
                <th>Type</th>
                <th>Experience</th>
                <th>Salary</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vacancies.map((v) => (
                <tr key={v.id}>
                  <td>
                    <strong>{v.title}</strong>
                    <br />
                    <small className="text-muted">{v.location}</small>
                  </td>
                  <td>{v.department}</td>
                  <td>
                    <Badge variant="neutral" size="sm">
                      {v.type}
                    </Badge>
                  </td>
                  <td>{v.experience}</td>
                  <td>{v.salaryRange || <span className="text-muted">—</span>}</td>
                  <td>
                    {v.active ? (
                      <Badge variant="success" size="sm">
                        Live
                      </Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">
                        Hidden
                      </Badge>
                    )}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(v)}
                        title={v.active ? "Hide vacancy" : "Publish vacancy"}
                      >
                        {v.active ? <EyeOff size={14} /> : <Eye size={14} />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(v)}
                        icon={<Edit2 size={13} />}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => confirmDelete(v)}
                        disabled={deletingId === v.id}
                        icon={<Trash2 size={13} />}
                      >
                        Delete
                      </Button>
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
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Vacancy" : "New Job Vacancy"}
        size="lg"
        footer={
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : editingId ? "Save Changes" : "Create Vacancy"}
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Title */}
          <div>
            <label className="admin-field-label">Job Title *</label>
            <input
              className="admin-input"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Ayurvedic Doctor (BAMS)"
            />
          </div>

          {/* Department + Type */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label className="admin-field-label">Department *</label>
              <select
                className="admin-input"
                value={form.department}
                onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="admin-field-label">Job Type</label>
              <select
                className="admin-input"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              >
                {JOB_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Experience + Location */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label className="admin-field-label">Experience</label>
              <select
                className="admin-input"
                value={form.experience}
                onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
              >
                {EXPERIENCE_OPTIONS.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="admin-field-label">Location</label>
              <input
                className="admin-input"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="Pilani, Rajasthan"
              />
            </div>
          </div>

          {/* Salary + Apply Email */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label className="admin-field-label">Salary Range</label>
              <input
                className="admin-input"
                value={form.salaryRange ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, salaryRange: e.target.value }))}
                placeholder="₹20,000 – ₹35,000 / month"
              />
            </div>
            <div>
              <label className="admin-field-label">Apply Email</label>
              <input
                className="admin-input"
                type="email"
                value={form.applyEmail ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, applyEmail: e.target.value }))}
                placeholder="careers@charakayurvedapilani.com"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="admin-field-label">Job Description *</label>
            <textarea
              className="admin-input"
              rows={4}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Describe the role, responsibilities, and what the candidate will do…"
            />
          </div>

          {/* Requirements */}
          <div>
            <label className="admin-field-label">Requirements / Eligibility</label>
            <textarea
              className="admin-input"
              rows={4}
              value={form.requirements ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, requirements: e.target.value }))}
              placeholder="• BAMS degree&#10;• Valid registration with Ayurved Council&#10;• Good communication skills"
            />
          </div>

          {/* Display Order + Active */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label className="admin-field-label">Display Order</label>
              <input
                className="admin-input"
                type="number"
                min={0}
                value={form.displayOrder ?? 0}
                onChange={(e) =>
                  setForm((f) => ({ ...f, displayOrder: parseInt(e.target.value) || 0 }))
                }
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingTop: "24px" }}>
              <input
                type="checkbox"
                id="vacancy-active"
                checked={form.active ?? true}
                onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                style={{ width: "16px", height: "16px", cursor: "pointer" }}
              />
              <label htmlFor="vacancy-active" style={{ cursor: "pointer", fontWeight: 600 }}>
                Publish on website
              </label>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Vacancy"
        size="sm"
        footer={
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <Button variant="ghost" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={!!deletingId}
            >
              {deletingId ? "Deleting…" : "Yes, Delete"}
            </Button>
          </div>
        }
      >
        <p>
          Are you sure you want to permanently delete the vacancy{" "}
          <strong>&quot;{deleteTarget?.title}&quot;</strong>? This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
