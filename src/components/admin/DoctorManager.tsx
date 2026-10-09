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
}

const emptyDoctorForm: DoctorFormState = {
  name: "",
  slug: "",
  designation: "Senior Ayurvedic Physician & Vaidya",
  specialization: "Panchakarma & Pulse Diagnosis",
  qualification: "BAMS, MD (Ayurveda)",
  experience: "10+ Years",
  consultationFee: 1200,
  displayOrder: 0,
  bio: "",
  detailedBio: "",
  image: "",
  storagePath: "",
  active: true,
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
      consultationFee: doc.consultationFee || 1200,
      displayOrder: doc.displayOrder ?? 0,
      bio: doc.bio || "",
      detailedBio: doc.detailedBio || doc.bio || "",
      image: doc.image || "",
      storagePath: doc.storagePath || "",
      active: doc.active !== false,
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
      }
    } catch (err) {
      toast.error("Failed to add slot", err instanceof Error ? err.message : "Error creating slot");
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    await adminDeleteAvailability(slotId);
    setAvailabilities((prev) => prev.filter((s) => s.id !== slotId));
    toast.success("Slot Removed", "Schedule slot removed.");
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
              <div key={doc.id} className="admin-doctor-card">
                <div className="doctor-header-row">
                  <div className="doctor-avatar-wrap">
                    {doc.image ? (
                      <Image
                        src={doc.image}
                        alt={doc.name}
                        width={64}
                        height={64}
                        className="doctor-avatar-img"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "64px",
                          height: "64px",
                          borderRadius: "50%",
                          background: "rgba(24, 66, 50, 0.08)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--green)",
                        }}
                      >
                        <UserCheck size={28} />
                      </div>
                    )}
                  </div>
                  <div className="doctor-info-col">
                    <h3>{doc.name}</h3>
                    <p className="doctor-title-txt">{doc.designation || doc.title}</p>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "4px" }}>
                      <Badge variant={doc.active !== false ? "success" : "neutral"}>
                        {doc.active !== false ? "Active" : "Inactive"}
                      </Badge>
                      <span className="text-xs text-muted" style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                        <MapPin size={11} /> {doc.location}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="doctor-specs-box">
                  <div className="spec-row">
                    <span className="spec-label">Specialization:</span>
                    <span className="spec-val">{doc.specialization}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-label">Degrees:</span>
                    <span className="spec-val">{doc.qualifications}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-label">Experience:</span>
                    <span className="spec-val">{doc.experience}</span>
                  </div>
                  {doc.slug && (
                    <div className="spec-row">
                      <span className="spec-label">Profile URL:</span>
                      <span className="spec-val">/doctors/{doc.slug}</span>
                    </div>
                  )}
                </div>

                {/* Consultation Fee Controls */}
                <div className="fee-management-box">
                  <div className="fee-label">Consultation Fee</div>
                  {isEditing ? (
                    <div className="fee-edit-group">
                      <span className="fee-currency-prefix">₹</span>
                      <input
                        type="number"
                        className="fee-input"
                        value={editFee}
                        onChange={(e) => setEditFee(Number(e.target.value))}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleSaveFee(doc.id, doc.name)}
                        icon={<Save size={13} />}
                      >
                        Save
                      </Button>
                      <button
                        type="button"
                        className="fee-cancel-btn"
                        onClick={() => setEditingDocId(null)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="fee-display-group">
                      <span className="fee-amount">₹{doc.consultationFee.toLocaleString("en-IN")}</span>
                      <button
                        type="button"
                        className="fee-edit-btn"
                        onClick={() => handleStartEdit(doc)}
                        title="Edit Fee"
                      >
                        <Edit2 size={13} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Schedules overview */}
                <div className="doc-schedule-overview">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span className="text-xs font-semibold text-muted">Active Schedule</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenSchedule(doc)}
                      icon={<Calendar size={13} />}
                    >
                      Manage Slots
                    </Button>
                  </div>
                  <div className="schedule-pills-wrap">
                    {scheduledDates.slice(0, 3).map((dateKey) => (
                      <span key={dateKey} className="schedule-date-pill">
                        <Clock size={12} /> {dateKey} ({doc.availableTimes[dateKey]?.length || 0} slots)
                      </span>
                    ))}
                    {scheduledDates.length === 0 && (
                      <span className="text-xs text-muted">Click &quot;Manage Slots&quot; to configure weekly hours.</span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "8px", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--border)" }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEditDoctor(doc)}
                    icon={<Edit2 size={13} />}
                  >
                    Edit Profile
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleDoctorActive(doc)}
                  >
                    {doc.active !== false ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDoctor(doc.id, doc.name)}
                    icon={<Trash2 size={13} />}
                    style={{ color: "var(--crimson)", marginLeft: "auto" }}
                  >
                    Delete
                  </Button>
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

          <Input
            label="Display Order"
            type="number"
            value={String(doctorForm.displayOrder)}
            onChange={(e) => setDoctorForm({ ...doctorForm, displayOrder: Number(e.target.value) })}
            placeholder="0"
          />

          <Textarea
            label="Short Bio (Shown on cards)"
            value={doctorForm.bio}
            onChange={(e) => setDoctorForm({ ...doctorForm, bio: e.target.value })}
            placeholder="Expert in Nadi Pariksha, classical detox, and personalized lifestyle prescriptions..."
            rows={2}
          />

          <Textarea
            label="Detailed Bio (Shown on doctor detail page)"
            value={doctorForm.detailedBio}
            onChange={(e) => setDoctorForm({ ...doctorForm, detailedBio: e.target.value })}
            placeholder="Detailed background, hospital affiliations, research, and clinical philosophy..."
            rows={4}
          />

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
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "220px", overflowY: "auto", marginBottom: "20px" }}>
              {availabilities.map((slot) => (
                <div
                  key={slot.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    background: "#f9f9f9",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div>
                    <strong>{slot.dayOfWeek}</strong>: {slot.startTime} – {slot.endTime}{" "}
                    <span className="text-muted text-xs">({slot.slotDuration} min)</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSlot(slot.id)}
                    icon={<Trash2 size={13} />}
                    style={{ color: "var(--crimson)" }}
                  />
                </div>
              ))}
            </div>
          )}

          <h4 style={{ margin: "20px 0 10px" }}>Add New Consultation Window</h4>
          <form onSubmit={handleAddSlot} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label className="text-xs text-muted" style={{ display: "block", marginBottom: "4px" }}>Day of Week</label>
                <select
                  value={newSlotForm.dayOfWeek}
                  onChange={(e) => setNewSlotForm({ ...newSlotForm, dayOfWeek: e.target.value })}
                  className="table-inline-input"
                  style={{ width: "100%", padding: "8px" }}
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-muted" style={{ display: "block", marginBottom: "4px" }}>Slot Duration (min)</label>
                <input
                  type="number"
                  value={newSlotForm.slotDuration}
                  onChange={(e) => setNewSlotForm({ ...newSlotForm, slotDuration: Number(e.target.value) })}
                  className="table-inline-input"
                  style={{ width: "100%", padding: "8px" }}
                  min={10}
                  step={5}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label className="text-xs text-muted" style={{ display: "block", marginBottom: "4px" }}>Start Time</label>
                <input
                  type="time"
                  value={newSlotForm.startTime}
                  onChange={(e) => setNewSlotForm({ ...newSlotForm, startTime: e.target.value })}
                  className="table-inline-input"
                  style={{ width: "100%", padding: "8px" }}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-muted" style={{ display: "block", marginBottom: "4px" }}>End Time</label>
                <input
                  type="time"
                  value={newSlotForm.endTime}
                  onChange={(e) => setNewSlotForm({ ...newSlotForm, endTime: e.target.value })}
                  className="table-inline-input"
                  style={{ width: "100%", padding: "8px" }}
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
