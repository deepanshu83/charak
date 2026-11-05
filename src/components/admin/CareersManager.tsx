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
  Sparkles,
} from "lucide-react";
import { Badge, Button, Modal, useToast } from "@/components/ui";
import {
  DEFAULT_VACANCIES,
  type JobVacancy,
  type CreateJobVacancyInput,
} from "@/lib/careersService";

const DEPARTMENTS = [
  "Clinical & Consultation",
  "Dispensary & Pharmacy",
  "Panchakarma & Wellness",
  "In-Patient & Clinical Care",
  "Hospital Support & Operations",
  "Front Office & Administration",
  "Facility Security & Safety",
  "Hospital Kitchen & Dietary",
  "Medical",
  "Nursing",
  "Other",
];

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Full-time (Rotational)"];

const EXPERIENCE_OPTIONS = [
  "Fresher",
  "Fresher / 1+ Year",
  "1–2 Years",
  "1–3 Years",
  "3+ Years",
  "3–5 Years",
  "5+ Years",
];

const ROLE_PRESETS = [
  {
    name: "Consultant",
    icon: "👨‍⚕️",
    title: "Ayurvedic Consultant (Vaidya)",
    department: "Clinical & Consultation",
    type: "Full-time",
    experience: "3+ Years",
    location: "Pilani, Rajasthan",
    salaryRange: "Best in industry based on experience",
    applyEmail: "careers@charakayurvedapilani.com",
    description: "Conduct patient consultations, clinical examinations, Nadi Pariksha, and prescribe classical Ayurvedic medicines and Panchakarma therapies.",
    requirements: "• BAMS / MD (Ayurveda) from a recognized university.\n• Valid state Ayurvedic medical council registration.\n• Deep knowledge of classical Ayurvedic texts and pulse diagnosis.\n• Compassionate patient care and excellent consultation communication.",
  },
  {
    name: "Pharmacist",
    icon: "💊",
    title: "Ayurvedic Pharmacist",
    department: "Dispensary & Pharmacy",
    type: "Full-time",
    experience: "1–3 Years",
    location: "Pilani, Rajasthan",
    salaryRange: "Competitive salary + incentives",
    applyEmail: "careers@charakayurvedapilani.com",
    description: "Manage hospital dispensary, dispense classical Ayurvedic medicines, herbal decoctions, oils, maintain medicine stock records, and guide patients on dosage.",
    requirements: "• D.Pharm / B.Pharm in Ayurveda or certified pharmacy qualification.\n• Understanding of classical Ayurvedic formulations and herbal ingredients.\n• Good inventory management and record-keeping skills.\n• Courteous patient communication.",
  },
  {
    name: "Panchkarma Therapist",
    icon: "🌿",
    title: "Panchakarma Therapist (Male & Female)",
    department: "Panchakarma & Wellness",
    type: "Full-time",
    experience: "1–2+ Years",
    location: "Pilani, Rajasthan",
    salaryRange: "Competitive pay + accommodation support",
    applyEmail: "careers@charakayurvedapilani.com",
    description: "Administer traditional Panchakarma therapies including Abhyanga, Shirodhara, Swedana, Patra Pinda Sweda, Janu Basti, and Nasya under medical supervision.",
    requirements: "• Certified Panchakarma Technician / Therapist diploma or certificate.\n• Hands-on practical knowledge of authentic Kerala and classical therapies.\n• Dedication to hygiene, cleanliness, and patient comfort.\n• Professional etiquette and physical stamina.",
  },
  {
    name: "Nursing Staff",
    icon: "🩺",
    title: "Nursing Staff / Staff Nurse",
    department: "In-Patient & Clinical Care",
    type: "Full-time",
    experience: "1–3 Years",
    location: "Pilani, Rajasthan",
    salaryRange: "Best in industry based on merit",
    applyEmail: "careers@charakayurvedapilani.com",
    description: "Oversee patient care in therapy and recovery rooms, monitor vital signs, prepare patients for procedures, administer oral treatments, and coordinate with attending Vaidyas.",
    requirements: "• GNM / B.Sc Nursing qualification.\n• Registered Nurse with clinical hospital experience.\n• Sound clinical judgement, emergency handling, and empathetic bedside manner.\n• Willingness to learn Ayurvedic clinical care protocols.",
  },
  {
    name: "MTS",
    icon: "📋",
    title: "MTS (Multi-Tasking Staff / Hospital Attendant)",
    department: "Hospital Support & Operations",
    type: "Full-time",
    experience: "Fresher / 1+ Year",
    location: "Pilani, Rajasthan",
    salaryRange: "Standard hospital pay scale",
    applyEmail: "careers@charakayurvedapilani.com",
    description: "Support general hospital operations, therapy room cleaning and setup, patient assistance, linen management, and assist clinic staff in daily operational tasks.",
    requirements: "• 10th or 12th pass.\n• Hardworking, disciplined, honest, and respectful.\n• Ability to handle multiple assistance tasks in a medical setting.\n• Good cooperative nature with staff and visitors.",
  },
  {
    name: "Receptionist",
    icon: "📞",
    title: "Receptionist / Front Desk Executive",
    department: "Front Office & Administration",
    type: "Full-time",
    experience: "1–2 Years",
    location: "Pilani, Rajasthan",
    salaryRange: "Attractive salary package",
    applyEmail: "careers@charakayurvedapilani.com",
    description: "Manage clinic front desk, welcome visiting patients, coordinate appointment schedules, attend patient phone inquiries and WhatsApp messages, and manage billing entries.",
    requirements: "• Graduate or 10+2 with proven front office / reception experience.\n• Fluent and polite communication in Hindi and basic English.\n• Computer literacy (MS Excel, Email, basic billing software).\n• Professional presentation and organized work ethic.",
  },
  {
    name: "Security Guard",
    icon: "🛡️",
    title: "Security Guard",
    department: "Facility Security & Safety",
    type: "Full-time (Rotational)",
    experience: "1+ Year",
    location: "Pilani, Rajasthan",
    salaryRange: "Fixed monthly salary",
    applyEmail: "careers@charakayurvedapilani.com",
    description: "Safeguard hospital premises, monitor visitor entry/exit, assist elderly patients at the gate, manage vehicle parking, and ensure peaceful environment throughout clinic hours.",
    requirements: "• Prior experience as a security guard in hospital, school, or corporate facility.\n• Physically fit, alert, polite, and disciplined.\n• Clean background with no criminal record.\n• Punctuality and vigilance.",
  },
  {
    name: "Cook",
    icon: "🍲",
    title: "Cook (Ayurvedic Dietary & Hospital Kitchen)",
    department: "Hospital Kitchen & Dietary",
    type: "Full-time",
    experience: "1–3 Years",
    location: "Pilani, Rajasthan",
    salaryRange: "Competitive salary + meals provided",
    applyEmail: "careers@charakayurvedapilani.com",
    description: "Prepare fresh, nutritious Satvik Ayurvedic meals, herbal teas, gruels (kanji/peya), and dietary foods strictly according to physician prescriptions for residential patients.",
    requirements: "• Experience in Satvik / vegetarian cooking in hospitals, retreats, or ashrams.\n• High standards of personal and kitchen cleanliness and food hygiene.\n• Knowledge of preparing light, digestive, wholesome Ayurvedic dishes.\n• Reliable and dedicated.",
  },
];

const EMPTY_FORM: CreateJobVacancyInput = {
  title: "",
  department: "Clinical & Consultation",
  location: "Pilani, Rajasthan",
  type: "Full-time",
  experience: "Fresher",
  description: "",
  requirements: "",
  salaryRange: "",
  applyEmail: "careers@charakayurvedapilani.com",
  active: true,
  displayOrder: 0,
};

function mapRow(row: Record<string, unknown>): JobVacancy {
  return {
    id: row.id as string,
    title: row.title as string,
    department: (row.department as string) || "General",
    location: (row.location as string) || "Pilani, Rajasthan",
    type: (row.type as string) || "Full-time",
    experience: (row.experience as string) || "Fresher",
    description: row.description as string,
    requirements: (row.requirements ?? null) as string | null,
    salaryRange: ((row.salary_range ?? row.salaryRange) ?? null) as string | null,
    applyEmail: ((row.apply_email ?? row.applyEmail) ?? "careers@charakayurvedapilani.com") as string | null,
    active: row.active !== false,
    displayOrder: ((row.display_order ?? row.displayOrder) as number) ?? 0,
    createdAt: ((row.created_at ?? row.createdAt) as string) || new Date().toISOString(),
    updatedAt: ((row.updated_at ?? row.updatedAt) as string) || new Date().toISOString(),
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
      if (json.ok && Array.isArray(json.data) && json.data.length > 0) {
        setVacancies(json.data.map(mapRow));
      } else {
        setVacancies(DEFAULT_VACANCIES);
      }
    } catch {
      setVacancies(DEFAULT_VACANCIES);
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, []);

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
      applyEmail: v.applyEmail ?? "careers@charakayurvedapilani.com",
      active: v.active,
      displayOrder: v.displayOrder,
    });
    setModalOpen(true);
  };

  const applyPreset = (preset: typeof ROLE_PRESETS[number]) => {
    setForm((prev) => ({
      ...prev,
      title: preset.title,
      department: preset.department,
      type: preset.type,
      experience: preset.experience,
      location: preset.location,
      salaryRange: preset.salaryRange,
      applyEmail: preset.applyEmail,
      description: preset.description,
      requirements: preset.requirements,
    }));
    toast.success(`Loaded ${preset.name} template`);
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
        applyEmail: form.applyEmail || "careers@charakayurvedapilani.com",
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

  // Input styles
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
    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
    fontFamily: "inherit",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.86rem",
    fontWeight: 600,
    color: "var(--green, #184232)",
    marginBottom: "6px",
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="wrap admin-page-container">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <Badge variant="gold">Careers • Vacancies</Badge>
          <h1 style={{ marginTop: "6px", fontSize: "1.8rem", color: "var(--green)" }}>
            Job Vacancies
          </h1>
          <p style={{ color: "var(--ink-light)", fontSize: "0.95rem" }}>
            Manage hospital job postings displayed on the public Careers page ({vacancies.length} positions).
          </p>
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
        <div className="admin-table-wrapper" style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e7dfd3", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
          <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--cream, #f7f4ee)", textAlign: "left" }}>
                <th style={{ padding: "14px 16px" }}>Position / Title</th>
                <th style={{ padding: "14px 16px" }}>Department</th>
                <th style={{ padding: "14px 16px" }}>Type</th>
                <th style={{ padding: "14px 16px" }}>Experience</th>
                <th style={{ padding: "14px 16px" }}>Salary</th>
                <th style={{ padding: "14px 16px" }}>Status</th>
                <th style={{ padding: "14px 16px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vacancies.map((v) => (
                <tr key={v.id} style={{ borderTop: "1px solid #f0eae1" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <strong style={{ color: "var(--green)", fontSize: "0.96rem" }}>{v.title}</strong>
                    <br />
                    <small style={{ color: "var(--ink-light)", fontSize: "0.82rem" }}>{v.location}</small>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: "0.9rem", color: "#4a5568" }}>{v.department}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <Badge variant="neutral" size="sm">
                      {v.type}
                    </Badge>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: "0.9rem", color: "#4a5568" }}>{v.experience}</td>
                  <td style={{ padding: "14px 16px", fontSize: "0.88rem", color: "#4a5568" }}>{v.salaryRange || <span style={{ color: "#a0aec0" }}>—</span>}</td>
                  <td style={{ padding: "14px 16px" }}>
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
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
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
        title={editingId ? "Edit Job Vacancy" : "Create New Job Vacancy"}
        size="lg"
        footer={
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", width: "100%", paddingTop: "12px" }}>
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : editingId ? "Save Changes" : "Create Vacancy"}
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "4px 0" }}>
          {/* Quick Pre-Fill Role Templates */}
          {!editingId && (
            <div
              style={{
                background: "var(--cream, #f7f4ee)",
                border: "1px solid #e7dfd3",
                borderRadius: "14px",
                padding: "14px",
                marginBottom: "4px",
              }}
            >
              <div
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "var(--green)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Sparkles size={14} style={{ color: "var(--gold)" }} />
                <span>Quick-Fill Hospital Role:</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {ROLE_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    style={{
                      padding: "5px 12px",
                      borderRadius: "999px",
                      background: "#ffffff",
                      border: "1px solid #dcd3c6",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: "var(--green)",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--gold)";
                      e.currentTarget.style.background = "#fffdf9";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#dcd3c6";
                      e.currentTarget.style.background = "#ffffff";
                    }}
                  >
                    <span>{preset.icon}</span>
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label style={labelStyle}>Job Title *</label>
            <input
              style={inputStyle}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Ayurvedic Consultant (Vaidya)"
            />
          </div>

          {/* Department + Type */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={labelStyle}>Department *</label>
              <select
                style={{ ...inputStyle, cursor: "pointer" }}
                value={form.department}
                onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Job Type</label>
              <select
                style={{ ...inputStyle, cursor: "pointer" }}
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              >
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Experience + Location */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={labelStyle}>Experience</label>
              <select
                style={{ ...inputStyle, cursor: "pointer" }}
                value={form.experience}
                onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
              >
                {EXPERIENCE_OPTIONS.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Location</label>
              <input
                style={inputStyle}
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="Pilani, Rajasthan"
              />
            </div>
          </div>

          {/* Salary + Apply Email */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={labelStyle}>Salary Range</label>
              <input
                style={inputStyle}
                value={form.salaryRange ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, salaryRange: e.target.value }))}
                placeholder="e.g. ₹25,000 – ₹45,000 / month or Competitive"
              />
            </div>
            <div>
              <label style={labelStyle}>Apply Email</label>
              <input
                style={inputStyle}
                type="email"
                value={form.applyEmail ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, applyEmail: e.target.value }))}
                placeholder="careers@charakayurvedapilani.com"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Job Description *</label>
            <textarea
              style={{ ...inputStyle, minHeight: "95px", resize: "vertical", lineHeight: "1.5" }}
              rows={4}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Describe the clinical or operational role, duties, and responsibilities…"
            />
          </div>

          {/* Requirements */}
          <div>
            <label style={labelStyle}>Requirements / Eligibility</label>
            <textarea
              style={{ ...inputStyle, minHeight: "95px", resize: "vertical", lineHeight: "1.5" }}
              rows={4}
              value={form.requirements ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, requirements: e.target.value }))}
              placeholder="• Required degree or certification&#10;• Clinical or operational experience&#10;• Good communication and patient care"
            />
          </div>

          {/* Active status */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingTop: "4px" }}>
            <input
              type="checkbox"
              id="vacancy-active"
              checked={form.active ?? true}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
              style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "var(--green)" }}
            />
            <label htmlFor="vacancy-active" style={{ cursor: "pointer", fontWeight: 600, fontSize: "0.92rem", color: "var(--green)" }}>
              Publish on public website (/careers)
            </label>
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
            <Button variant="ghost" onClick={() => setDeleteConfirmOpen(false)} disabled={!!deletingId}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={!!deletingId}>
              {deletingId ? "Deleting…" : "Delete Vacancy"}
            </Button>
          </div>
        }
      >
        <p style={{ margin: 0, color: "var(--ink-light)", fontSize: "0.95rem", lineHeight: 1.5 }}>
          Are you sure you want to remove &quot;{deleteTarget?.title}&quot;? It will no longer appear on the public careers page.
        </p>
      </Modal>
    </div>
  );
}
