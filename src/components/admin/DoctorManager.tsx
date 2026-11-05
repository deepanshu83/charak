"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Edit2,
  ExternalLink,
  MapPin,
  Plus,
  Save,
  Stethoscope,
  Trash2,
  UserCheck,
  X,
} from "lucide-react";
import {
  adminCreateAvailability,
  adminCreateDoctor,
  adminDeleteAvailability,
  adminDeleteDoctor,
  adminUpdateDoctor,
  CLINIC_TREATMENTS,
  fetchAdminDoctors,
  fetchDoctorAvailability,
  type AdminDoctor,
  type DoctorAvailabilityItem,
} from "@/lib/doctorService";
import { Badge, Button, Input, Modal, Textarea, useToast } from "@/components/ui";
import ImageUpload, { type ImageUploadResult } from "@/components/admin/ImageUpload";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface DoctorFormState {
  name: string;
  slug: string;
  designation: string;
  specialization: string;
  qualification: string;
  experience: string;
  consultationFee: number;
  displayOrder: number;
  bio: string;
  detailedBio: string;
  image: string;
  storagePath?: string;
  active: boolean;
  treatmentIds: string[];
}

const emptyDoctorForm: DoctorFormState = {
  name: "",
  slug: "",
  designation: "Senior Ayurvedic Physician & Vaidya",
  specialization: "Panchakarma & Pulse Diagnosis",
  qualification: "BAMS, MD (Ayurveda)",
  experience: "10+ Years",
  consultationFee: 500,
  displayOrder: 0,
  bio: "",
  detailedBio: "",
  image: "",
  storagePath: "",
  active: true,
  treatmentIds: [],
};

export default function DoctorManager() {
  const toast = useToast();
  const [doctors, setDoctors] = useState<AdminDoctor[]>([]);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editFee, setEditFee] = useState<number>(0);

  // Doctor Form Modal
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<AdminDoctor | null>(null);
  const [doctorForm, setDoctorForm] = useState<DoctorFormState>(emptyDoctorForm);

  // Doctor Availability Modal
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedDoctorForSchedule, setSelectedDoctorForSchedule] = useState<AdminDoctor | null>(null);
  const [availabilities, setAvailabilities] = useState<DoctorAvailabilityItem[]>([]);
  const [newSlotForm, setNewSlotForm] = useState({
    dayOfWeek: "Monday",
    startTime: "09:00",
    endTime: "13:00",
    slotDuration: 30,
    active: true,
  });

  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    try {
      const list = await fetchAdminDoctors();
      setDoctors(list);
    } catch (err) {
      console.error("[DoctorManager] Failed to load doctors from database:", err);
      setDoctors([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Quick Fee Edit
  const handleStartEdit = (doc: AdminDoctor) => {
    setEditingDocId(doc.id);
    setEditFee(doc.consultationFee);
  };

  const handleSaveFee = async (docId: string, docName: string) => {
    await adminUpdateDoctor(docId, { consultationFee: editFee });
    setEditingDocId(null);
    await loadData();
    toast.success("Fee Updated", `Consultation fee for ${docName} updated to ₹${editFee.toLocaleString("en-IN")}.`);
  };

  // Full Doctor Profile Create / Edit
  const handleOpenAddDoctor = () => {
    setEditingDoctor(null);
    setDoctorForm(emptyDoctorForm);
    setIsDoctorModalOpen(true);
  };

  const handleOpenEditDoctor = (doc: AdminDoctor) => {
    setEditingDoctor(doc);
    setDoctorForm({
      name: doc.name,
      slug: doc.slug || doc.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      designation: doc.designation || doc.title || "Senior Ayurvedic Physician",
      specialization: doc.specialization || doc.title || "Ayurvedic Medicine",
      qualification: doc.qualifications || "",
      experience: doc.experience || "",
      consultationFee: doc.consultationFee || 500,
      displayOrder: doc.displayOrder ?? 0,
      bio: doc.bio || "",
      detailedBio: doc.detailedBio || doc.bio || "",
      image: doc.image || "",
      storagePath: doc.storagePath || "",
      active: doc.active !== false,
      treatmentIds: Array.isArray(doc.treatmentIds) ? [...doc.treatmentIds] : [],
    });
    setIsDoctorModalOpen(true);
  };

  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorForm.name.trim() || isSaving) return;

    setIsSaving(true);
    try {
      const generatedSlug = (doctorForm.slug || doctorForm.name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      if (editingDoctor) {
        await adminUpdateDoctor(editingDoctor.id, {
          name: doctorForm.name.trim(),
          slug: generatedSlug,
          designation: doctorForm.designation.trim(),
          specialization: doctorForm.specialization.trim(),
          title: doctorForm.designation.trim() || doctorForm.specialization.trim(),
          qualifications: doctorForm.qualification.trim(),
          experience: doctorForm.experience.trim(),
          consultationFee: Number(doctorForm.consultationFee),
          displayOrder: Number(doctorForm.displayOrder),
          bio: doctorForm.bio.trim(),
          detailedBio: doctorForm.detailedBio.trim(),
          image: doctorForm.image,
          storagePath: doctorForm.storagePath || undefined,
          active: doctorForm.active,
          treatmentIds: doctorForm.treatmentIds,
        });
        toast.success("Doctor Updated", `"${doctorForm.name}" updated successfully.`);
      } else {
        const created = await adminCreateDoctor({
          name: doctorForm.name.trim(),
          slug: generatedSlug,
          designation: doctorForm.designation.trim(),
          specialization: doctorForm.specialization.trim(),
          qualification: doctorForm.qualification.trim(),
          experience: doctorForm.experience.trim(),
          consultationFee: Number(doctorForm.consultationFee),
          displayOrder: Number(doctorForm.displayOrder),
          bio: doctorForm.bio.trim(),
          detailedBio: doctorForm.detailedBio.trim(),
          image: doctorForm.image,
          storagePath: doctorForm.storagePath || undefined,
          active: doctorForm.active,
          treatmentIds: doctorForm.treatmentIds,
        });
        toast.success("Doctor Added", `"${created.name}" is now part of the medical directory.`);
      }
      setIsDoctorModalOpen(false);
      await loadData();
    } catch {
      toast.error("Save Failed", "Could not save doctor to database.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDoctor = async (docId: string, docName: string) => {
    if (!confirm(`Are you sure you want to remove ${docName}?`)) return;
    await adminDeleteDoctor(docId);
    toast.success("Doctor Removed", `${docName} removed from medical directory.`);
    await loadData();
  };

  const handleToggleDoctorActive = async (doc: AdminDoctor) => {
    const nextState = !doc.active;
    await adminUpdateDoctor(doc.id, { active: nextState });
    toast.info(
      nextState ? "Doctor Activated" : "Doctor Deactivated",
      `${doc.name} is now ${nextState ? "active and visible" : "hidden"}.`
    );
    await loadData();
  };

  // Availability / Schedules
  const handleOpenSchedule = async (doc: AdminDoctor) => {
    setSelectedDoctorForSchedule(doc);
    setIsScheduleModalOpen(true);
    try {
      const slots = await fetchDoctorAvailability(doc.id);
      setAvailabilities(slots);
    } catch {
      setAvailabilities([]);
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorForSchedule) return;

    if (newSlotForm.startTime >= newSlotForm.endTime) {
      toast.error("Invalid Times", "Start time must be strictly before end time.");
      return;
    }

    try {
      const created = await adminCreateAvailability({
        doctorId: selectedDoctorForSchedule.id,
        dayOfWeek: newSlotForm.dayOfWeek,
        startTime: newSlotForm.startTime,
        endTime: newSlotForm.endTime,
        slotDuration: Number(newSlotForm.slotDuration),
        active: newSlotForm.active,
      });
      if (created) {
        setAvailabilities((prev) => [...prev, created]);
        toast.success("Slot Configured", `${newSlotForm.dayOfWeek} ${newSlotForm.startTime}-${newSlotForm.endTime} added.`);
        await loadData();
      }
    } catch (err) {
      toast.error("Failed to add slot", err instanceof Error ? err.message : "Error creating slot");
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    await adminDeleteAvailability(slotId);
    setAvailabilities((prev) => prev.filter((s) => s.id !== slotId));
    toast.success("Slot Removed", "Schedule slot removed.");
    await loadData();
  };

  return (
    <div className="wrap admin-page-container">
      <div className="admin-page-header">
        <div>
          <Badge variant="gold">Medical Staff</Badge>
          <h1 style={{ marginTop: "6px" }}>Doctor Directory &amp; Schedules</h1>
          <p>
            Manage senior Ayurvedic physicians, their consultation fees, qualifications, and weekly schedule patterns.
          </p>
        </div>
        <div className="header-quick-actions" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Link href="/doctors" target="_blank">
            <Button variant="ghost" size="sm" icon={<ExternalLink size={15} />}>
              Public Doctors Page
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAddDoctor}
            icon={<Plus size={16} />}
          >
            Add Doctor
          </Button>
        </div>
      </div>

      {doctors.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "#ffffff",
            borderRadius: "16px",
            border: "1px dashed var(--border)",
            marginTop: "16px",
          }}
        >
          <Stethoscope size={48} color="var(--gold)" style={{ margin: "0 auto 16px", opacity: 0.8 }} />
          <h3 style={{ fontSize: "1.3rem", marginBottom: "8px", color: "var(--green)" }}>No doctors added yet.</h3>
          <p style={{ color: "var(--ink-light)", maxWidth: "440px", margin: "0 auto 20px", fontSize: "0.95rem" }}>
            Add your clinical staff and Ayurvedic physicians to enable online appointments and showcase medical credentials.
          </p>
          <Button variant="primary" onClick={handleOpenAddDoctor} icon={<Plus size={16} />}>
            Add Doctor
          </Button>
        </div>
      ) : (
        <div className="admin-doctors-grid">
          {doctors.map((doc) => {
            const isEditing = editingDocId === doc.id;
            const scheduledDates = Object.keys(doc.availableTimes);

            return (
              <div
                key={doc.id}
                style={{
                  background: "#ffffff",
                  border: "1px solid rgba(24, 66, 50, 0.12)",
                  borderRadius: "18px",
                  padding: "20px",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  transition: "all 0.2s ease",
                }}
              >
                {/* Doctor Header */}
                <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "14px",
                      overflow: "hidden",
                      border: "1.5px solid rgba(197, 160, 89, 0.35)",
                      background: "#fbf9f5",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {doc.image ? (
                      <Image
                        src={doc.image}
                        alt={doc.name}
                        width={60}
                        height={60}
                        style={{ width: "100%", height: "100%", objectFit: "contain", padding: "3px" }}
                      />
                    ) : (
                      <UserCheck size={28} color="var(--green)" style={{ opacity: 0.5 }} />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "6px" }}>
                      <h3 style={{ fontSize: "1.12rem", fontWeight: 700, color: "var(--green)", margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {doc.name}
                      </h3>
                      {doc.slug && (
                        <Link
                          href={`/doctors/${doc.slug}`}
                          target="_blank"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "3px",
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            color: "#8a6416",
                            background: "rgba(197, 160, 89, 0.12)",
                            padding: "2px 7px",
                            borderRadius: "5px",
                            textDecoration: "none",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <span>Profile</span>
                          <ExternalLink size={10} />
                        </Link>
                      )}
                    </div>

                    <p style={{ fontSize: "0.82rem", color: "var(--terra)", fontWeight: 500, margin: "0 0 4px" }}>
                      {doc.designation || doc.title}
                    </p>

                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: "12px",
                          background: doc.active !== false ? "#f0fdf4" : "#f1f5f9",
                          color: doc.active !== false ? "#166534" : "#64748b",
                          border: doc.active !== false ? "1px solid #bbf7d0" : "1px solid #e2e8f0",
                        }}
                      >
                        {doc.active !== false ? "Active" : "Inactive"}
                      </span>
                      <span style={{ fontSize: "0.74rem", color: "#64748b", display: "inline-flex", alignItems: "center", gap: "2px" }}>
                        <MapPin size={11} color="var(--gold)" /> {doc.location || "Pilani"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Clean Info Grid */}
                <div
                  style={{
                    background: "#fbf9f5",
                    borderRadius: "12px",
                    padding: "10px 12px",
                    fontSize: "0.82rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    border: "1px solid rgba(24, 66, 50, 0.06)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                    <span style={{ color: "#64748b", fontWeight: 500 }}>Specialization:</span>
                    <strong style={{ color: "var(--ink)", textAlign: "right", fontWeight: 600 }}>{doc.specialization}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                    <span style={{ color: "#64748b", fontWeight: 500 }}>Degrees:</span>
                    <span style={{ color: "var(--ink)", textAlign: "right" }}>{doc.qualifications}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                    <span style={{ color: "#64748b", fontWeight: 500 }}>Experience:</span>
                    <span style={{ color: "var(--ink)", textAlign: "right" }}>{doc.experience}</span>
                  </div>
                </div>

                {/* Assigned Consultations (Services) */}
                <div>
                  <span style={{ display: "block", fontSize: "0.74rem", fontWeight: 600, color: "#64748b", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                    Assigned Consultations:
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    {doc.treatmentIds && doc.treatmentIds.length > 0 ? (
                      doc.treatmentIds.map((tid) => {
                        const treat = CLINIC_TREATMENTS.find((t) => t.id === tid);
                        return (
                          <span
                            key={tid}
                            style={{
                              fontSize: "0.73rem",
                              padding: "3px 8px",
                              borderRadius: "6px",
                              background: "rgba(24, 66, 50, 0.06)",
                              color: "var(--green)",
                              border: "1px solid rgba(24, 66, 50, 0.12)",
                              fontWeight: 600,
                            }}
                          >
                            {treat?.name || "Consultation"}
                          </span>
                        );
                      })
                    ) : (
                      <span
                        style={{
                          fontSize: "0.73rem",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          background: "rgba(197, 160, 89, 0.12)",
                          color: "#8a6416",
                          border: "1px solid rgba(197, 160, 89, 0.25)",
                          fontWeight: 600,
                        }}
                      >
                        All Clinical Consultations
                      </span>
                    )}
                  </div>
                </div>

                {/* Fee & Manage Slots Row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    background: "#f4f8f5",
                    border: "1px solid rgba(24, 66, 50, 0.08)",
                    borderRadius: "12px",
                  }}
                >
                  <div>
                    <span style={{ display: "block", fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Fee</span>
                    {isEditing ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                        <span>₹</span>
                        <input
                          type="number"
                          style={{ width: "70px", padding: "2px 6px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "0.85rem" }}
                          value={editFee}
                          onChange={(e) => setEditFee(Number(e.target.value))}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveFee(doc.id, doc.name)}
                          style={{ background: "var(--green)", color: "#fff", border: "none", borderRadius: "4px", padding: "3px 8px", fontSize: "0.75rem", cursor: "pointer" }}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingDocId(null)}
                          style={{ background: "transparent", border: "none", cursor: "pointer", color: "#666" }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <strong style={{ fontSize: "1.05rem", color: "var(--green)" }}>₹{doc.consultationFee.toLocaleString("en-IN")}</strong>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(doc)}
                          title="Edit Fee"
                          style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--gold-hover)", padding: "2px" }}
                        >
                          <Edit2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenSchedule(doc)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      background: "#ffffff",
                      border: "1px solid var(--border)",
                      color: "var(--green)",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <Calendar size={13} color="var(--gold)" />
                    <span>Manage Slots</span>
                  </button>
                </div>

                {/* Actions: Edit Profile, Deactivate, Delete */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "8px", marginTop: "2px" }}>
                  <button
                    type="button"
                    onClick={() => handleOpenEditDoctor(doc)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "5px",
                      background: "var(--green)",
                      color: "#ffffff",
                      border: "none",
                      padding: "7px 12px",
                      borderRadius: "8px",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <Edit2 size={12} />
                    <span>Edit Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleDoctorActive(doc)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: doc.active !== false ? "#fef3c7" : "#e2e8f0",
                      color: doc.active !== false ? "#92400e" : "#475569",
                      border: "none",
                      padding: "7px 12px",
                      borderRadius: "8px",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <span>{doc.active !== false ? "Deactivate" : "Activate"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteDoctor(doc.id, doc.name)}
                    title={`Delete ${doc.name}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#fee2e2",
                      color: "#dc2626",
                      border: "none",
                      padding: "7px 10px",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Doctor Profile Create / Edit Modal */}
      <Modal
        isOpen={isDoctorModalOpen}
        onClose={() => setIsDoctorModalOpen(false)}
        title={editingDoctor ? `Edit ${editingDoctor.name}` : "Add Doctor"}
      >
        <form onSubmit={handleSaveDoctor} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Input
            label="Doctor Full Name"
            value={doctorForm.name}
            onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
            placeholder="Dr. Ravi Sharma"
            required
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Input
              label="URL Slug (Optional)"
              value={doctorForm.slug}
              onChange={(e) => setDoctorForm({ ...doctorForm, slug: e.target.value })}
              placeholder="dr-ravi-sharma"
            />
            <Input
              label="Designation"
              value={doctorForm.designation}
              onChange={(e) => setDoctorForm({ ...doctorForm, designation: e.target.value })}
              placeholder="Senior Ayurvedic Physician & Vaidya"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Input
              label="Specialization"
              value={doctorForm.specialization}
              onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
              placeholder="Panchakarma & Pulse Diagnosis"
              required
            />
            <Input
              label="Qualifications"
              value={doctorForm.qualification}
              onChange={(e) => setDoctorForm({ ...doctorForm, qualification: e.target.value })}
              placeholder="BAMS, MD (Ayurveda)"
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Input
              label="Experience"
              value={doctorForm.experience}
              onChange={(e) => setDoctorForm({ ...doctorForm, experience: e.target.value })}
              placeholder="10+ Years"
              required
            />
            <Input
              label="Consultation Fee (₹)"
              type="number"
              value={String(doctorForm.consultationFee)}
              onChange={(e) => setDoctorForm({ ...doctorForm, consultationFee: Number(e.target.value) })}
              placeholder="1200"
              required
            />
          </div>

          <Textarea
            label="Short Bio (Shown on cards)"
            value={doctorForm.bio}
            onChange={(e) => setDoctorForm({ ...doctorForm, bio: e.target.value })}
            placeholder="Expert in Nadi Pariksha, classical detox, and personalized lifestyle prescriptions..."
            rows={2}
          />

          <div className="admin-treatment-assignment-section">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--ink)" }}>
                Assigned Consultations / Specializations (6 Clinical Focus Areas)
              </label>
              <span style={{ fontSize: "0.75rem", color: "var(--gold)", fontWeight: 600 }}>
                {doctorForm.treatmentIds.length} of {CLINIC_TREATMENTS.length} selected
              </span>
            </div>
            <p style={{ fontSize: "0.78rem", color: "var(--ink-light)", marginBottom: "10px", lineHeight: "1.4" }}>
              Select which clinical therapies patients can book with this doctor. Recommended specialists will appear first during booking.
            </p>
            <div className="admin-treatment-checkbox-grid">
              {CLINIC_TREATMENTS.map((treat) => {
                const isChecked = doctorForm.treatmentIds.includes(treat.id);
                return (
                  <label
                    key={treat.id}
                    className={`treatment-checkbox-item ${isChecked ? "active" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...doctorForm.treatmentIds, treat.id]
                          : doctorForm.treatmentIds.filter((id) => id !== treat.id);
                        setDoctorForm({ ...doctorForm, treatmentIds: next });
                      }}
                    />
                    <span className="treatment-item-name">{treat.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px", color: "var(--ink)" }}>
              Doctor Profile Image (Optimized WebP)
            </label>
            <ImageUpload
              bucket="hospital-images"
              folder="doctors"
              currentImageUrl={doctorForm.image || undefined}
              onUploadComplete={(result: ImageUploadResult) => {
                setDoctorForm((prev) => ({
                  ...prev,
                  image: result.publicUrl,
                  storagePath: result.storagePath,
                }));
              }}
              onRemove={() => {
                setDoctorForm((prev) => ({
                  ...prev,
                  image: "",
                  storagePath: "",
                }));
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="checkbox"
              id="doc-active"
              checked={doctorForm.active}
              onChange={(e) => setDoctorForm({ ...doctorForm, active: e.target.checked })}
            />
            <label htmlFor="doc-active" style={{ fontSize: "0.9rem", cursor: "pointer" }}>
              Active (Visible on website and available for appointments)
            </label>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
            <Button variant="ghost" type="button" onClick={() => setIsDoctorModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : editingDoctor ? "Save Changes" : "Create Doctor"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Doctor Availability Management Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title={selectedDoctorForSchedule ? `Weekly Schedule: ${selectedDoctorForSchedule.name}` : "Manage Availability"}
      >
        <div>
          <h4 style={{ marginBottom: "12px" }}>Configured Weekly Slots</h4>
          {availabilities.length === 0 ? (
            <p className="text-muted text-sm" style={{ padding: "16px", background: "rgba(0,0,0,0.02)", borderRadius: "8px" }}>
              No custom schedule slots found in database for this doctor. Add one below.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "240px", overflowY: "auto", marginBottom: "20px" }}>
              {availabilities.map((slot) => (
                <div
                  key={slot.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                    background: "#ffffff",
                    borderRadius: "10px",
                    border: "1px solid #e7dfd3",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, color: "var(--green)", fontSize: "0.92rem" }}>{slot.dayOfWeek}</span>
                    <span style={{ color: "#888" }}>•</span>
                    <span style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "0.92rem" }}>
                      {slot.startTime} – {slot.endTime}
                    </span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "#6b5d4d",
                        background: "#f4ede4",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontWeight: 500,
                      }}
                    >
                      {slot.slotDuration} min
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteSlot(slot.id)}
                    title="Delete Slot"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      border: "1px solid #fecdd3",
                      background: "#fff1f2",
                      color: "#e11d48",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#e11d48";
                      e.currentTarget.style.color = "#ffffff";
                      e.currentTarget.style.borderColor = "#e11d48";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#fff1f2";
                      e.currentTarget.style.color = "#e11d48";
                      e.currentTarget.style.borderColor = "#fecdd3";
                    }}
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          <h4 style={{ margin: "20px 0 10px", fontSize: "1.05rem", color: "var(--green)", fontWeight: 600 }}>
            Add New Consultation Window
          </h4>
          <form
            onSubmit={handleAddSlot}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              background: "#faf7f2",
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid #e7dfd3",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.82rem", fontWeight: 600, color: "var(--ink)" }}>
                  Day of Week
                </label>
                <select
                  value={newSlotForm.dayOfWeek}
                  onChange={(e) => setNewSlotForm({ ...newSlotForm, dayOfWeek: e.target.value })}
                  className="table-inline-input"
                  style={{ width: "100%", padding: "10px 12px", background: "#ffffff", color: "#1e2621", fontWeight: 500 }}
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={day} value={day} style={{ color: "#1e2621", background: "#ffffff" }}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.82rem", fontWeight: 600, color: "var(--ink)" }}>
                  Slot Duration (min)
                </label>
                <input
                  type="number"
                  value={newSlotForm.slotDuration}
                  onChange={(e) => setNewSlotForm({ ...newSlotForm, slotDuration: Number(e.target.value) })}
                  className="table-inline-input"
                  style={{ width: "100%", padding: "10px 12px", background: "#ffffff", color: "#1e2621", fontWeight: 500 }}
                  min={10}
                  step={5}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.82rem", fontWeight: 600, color: "var(--ink)" }}>
                  Start Time
                </label>
                <input
                  type="time"
                  value={newSlotForm.startTime}
                  onChange={(e) => setNewSlotForm({ ...newSlotForm, startTime: e.target.value })}
                  className="table-inline-input"
                  style={{ width: "100%", padding: "10px 12px", background: "#ffffff", color: "#1e2621", fontWeight: 500 }}
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.82rem", fontWeight: 600, color: "var(--ink)" }}>
                  End Time
                </label>
                <input
                  type="time"
                  value={newSlotForm.endTime}
                  onChange={(e) => setNewSlotForm({ ...newSlotForm, endTime: e.target.value })}
                  className="table-inline-input"
                  style={{ width: "100%", padding: "10px 12px", background: "#ffffff", color: "#1e2621", fontWeight: 500 }}
                  required
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
              <Button variant="ghost" type="button" onClick={() => setIsScheduleModalOpen(false)}>
                Done
              </Button>
              <Button variant="primary" type="submit" icon={<Plus size={14} />}>
                Add Window
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
