"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Search,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { Badge, Button, Modal, useToast } from "@/components/ui";
import {
  fetchAdminAppointments,
  adminUpdateAppointmentStatus,
  subscribeAppointments,
} from "@/lib/appointmentService";
import { fetchAdminDoctors } from "@/lib/doctorService";
import { fetchAdminTreatments } from "@/lib/treatmentService";
import type { Appointment, AppointmentStatus, Doctor, Treatment } from "@/types";

const ALL_STATUSES: AppointmentStatus[] = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];

const PAGE_SIZE = 6;

export default function AppointmentManager() {
  const toast = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);
  const [treatmentsList, setTreatmentsList] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);

  // Cancellation Confirmation
  const [aptToCancel, setAptToCancel] = useState<Appointment | null>(null);

  const inFlightRef = useRef(false);

  const loadData = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setLoading(true);
    try {
      const [apts, docs, treats] = await Promise.all([
        fetchAdminAppointments(),
        fetchAdminDoctors().catch(() => []),
        fetchAdminTreatments().catch(() => []),
      ]);
      setAppointments(apts);
      setDoctorsList(docs);
      setTreatmentsList(treats);
    } catch (err) {
      console.error("[AppointmentManager] Failed to load data from database:", err);
      setAppointments([]);
      setDoctorsList([]);
      setTreatmentsList([]);
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const unsub = subscribeAppointments(loadData);
    return unsub;
  }, [loadData]);

  const doctorMap = useMemo(
    () => new Map(doctorsList.map((d) => [d.id, d])),
    [doctorsList]
  );
  const treatmentMap = useMemo(
    () => new Map(treatmentsList.map((t) => [t.id, t])),
    [treatmentsList]
  );

  const todayStr = new Date().toISOString().split("T")[0];

  const handleUpdateStatus = async (id: string, nextStatus: AppointmentStatus) => {
    setUpdatingId(id);
    try {
      await adminUpdateAppointmentStatus(id, nextStatus);
      toast.success("Status Updated", `Appointment ${id} marked as ${nextStatus}.`);
      if (selectedApt && selectedApt.id === id) {
        setSelectedApt((prev) => (prev ? { ...prev, status: nextStatus } : null));
      }
      await loadData();
    } catch (err) {
      toast.error("Update Failed", err instanceof Error ? err.message : "Unable to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmCancel = async () => {
    if (!aptToCancel) return;
    setUpdatingId(aptToCancel.id);
    try {
      await adminUpdateAppointmentStatus(aptToCancel.id, "CANCELLED");
      toast.info("Appointment Cancelled", `Booking ${aptToCancel.id} has been cancelled.`);
      setAptToCancel(null);
      await loadData();
    } catch (err) {
      toast.error("Cancel Failed", err instanceof Error ? err.message : "Unable to cancel booking");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const doc = doctorMap.get(apt.doctorId);
      const treat = treatmentMap.get(apt.treatmentId);

      const matchesSearch =
        apt.id.toLowerCase().includes(search.toLowerCase()) ||
        apt.patientName.toLowerCase().includes(search.toLowerCase()) ||
        apt.phone.includes(search) ||
        (doc && doc.name.toLowerCase().includes(search.toLowerCase())) ||
        (treat && treat.name.toLowerCase().includes(search.toLowerCase()));

      let matchesTab = true;
      if (filterTab === "Today's") {
        matchesTab = apt.date === todayStr;
      } else if (filterTab === "Upcoming") {
        matchesTab = apt.date >= todayStr && apt.status !== "CANCELLED";
      } else if (filterTab !== "All") {
        matchesTab = apt.status === filterTab;
      }

      return matchesSearch && matchesTab;
    });
  }, [appointments, search, filterTab, todayStr, doctorMap, treatmentMap]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterTab]);

  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / PAGE_SIZE));
  const paginatedAppointments = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAppointments.slice(start, start + PAGE_SIZE);
  }, [filteredAppointments, currentPage]);

  const tabCounts = useMemo(() => {
    return {
      All: appointments.length,
      "Today's": appointments.filter((a) => a.date === todayStr).length,
      Upcoming: appointments.filter(
        (a) => a.date >= todayStr && a.status !== "CANCELLED"
      ).length,
      CONFIRMED: appointments.filter((a) => a.status === "CONFIRMED").length,
      COMPLETED: appointments.filter((a) => a.status === "COMPLETED").length,
      CANCELLED: appointments.filter((a) => a.status === "CANCELLED").length,
    };
  }, [appointments, todayStr]);

  return (
    <div className="wrap admin-page-container">
      <div className="admin-page-header">
        <div>
          <Badge variant="gold">Clinical Schedules</Badge>
          <h1 style={{ marginTop: "6px" }}>Manage Consultations</h1>
          <p>
            Review patient appointments, confirm bookings, and manage doctor schedule availability.
            Cancellations immediately free the corresponding slot for other patients.
          </p>
        </div>
        <div className="header-quick-actions" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadData}
            icon={<RefreshCw size={14} className={loading ? "animate-spin" : ""} />}
          >
            Refresh
          </Button>
          <Link href="/appointment" target="_blank">
            <Button variant="primary" size="sm" icon={<Calendar size={15} />}>
              Open Booking Flow
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="admin-filter-bar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by ref ID, patient name, doctor, or treatment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-pill-group">
          {(
            [
              "All",
              "Today's",
              "Upcoming",
              "CONFIRMED",
              "COMPLETED",
              "CANCELLED",
            ] as const
          ).map((tab) => (
            <button
              key={tab}
              type="button"
              className={`filter-pill ${filterTab === tab ? "active" : ""}`}
              onClick={() => setFilterTab(tab)}
            >
              {tab} ({tabCounts[tab] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Appointments Table */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ref ID</th>
              <th>Patient</th>
              <th>Physician &amp; Therapy</th>
              <th>Date &amp; Time</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && appointments.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "36px", color: "var(--ink-muted)" }}>
                  Connecting to Supabase...
                </td>
              </tr>
            ) : paginatedAppointments.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "36px", color: "var(--ink-muted)" }}>
                  No consultations found matching this filter view.
                </td>
              </tr>
            ) : (
              paginatedAppointments.map((apt) => {
                const doc = doctorMap.get(apt.doctorId);
                const treat = treatmentMap.get(apt.treatmentId);
                const isToday = apt.date === todayStr;

                return (
                  <tr key={apt.id}>
                    <td>
                      <strong>{apt.id}</strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{apt.patientName}</div>
                      <div className="text-muted text-xs">{apt.phone}</div>
                    </td>
                    <td>
                      <div>
                        <strong>{doc?.name || apt.doctorId}</strong>
                      </div>
                      <div className="text-muted text-xs">
                        {treat?.name || apt.treatmentId}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <strong>{apt.date}</strong>
                        {isToday && <Badge variant="gold" size="sm">Today</Badge>}
                      </div>
                      <div className="text-muted text-xs">{apt.time}</div>
                    </td>
                    <td>
                      <StatusBadge status={apt.status} />
                    </td>
                    <td>
                      <div className="table-actions-cell">
                        {apt.status === "PENDING" && (
                          <button
                            type="button"
                            className="mini-action-btn primary"
                            disabled={updatingId === apt.id}
                            title="Confirm Appointment"
                            onClick={() => handleUpdateStatus(apt.id, "CONFIRMED")}
                          >
                            <Check size={13} /> Confirm
                          </button>
                        )}

                        {apt.status === "CONFIRMED" && (
                          <button
                            type="button"
                            className="mini-action-btn success"
                            disabled={updatingId === apt.id}
                            title="Mark Completed"
                            onClick={() => handleUpdateStatus(apt.id, "COMPLETED")}
                          >
                            <Check size={13} /> Complete
                          </button>
                        )}

                        {apt.status !== "CANCELLED" && apt.status !== "COMPLETED" && (
                          <button
                            type="button"
                            className="mini-action-btn danger"
                            disabled={updatingId === apt.id}
                            title="Cancel Appointment (re-opens slot)"
                            onClick={() => setAptToCancel(apt)}
                          >
                            Cancel
                          </button>
                        )}

                        <button
                          type="button"
                          className="action-icon-btn"
                          title="View Consultation Record"
                          onClick={() => setSelectedApt(apt)}
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        {filteredAppointments.length > PAGE_SIZE && (
          <div className="admin-pagination">
            <span>
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, filteredAppointments.length)} of{" "}
              {filteredAppointments.length} appointments
            </span>
            <div className="pagination-controls">
              <button
                type="button"
                className="pagination-btn"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={15} /> Prev
              </button>
              <span className="pagination-page-indicator">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                className="pagination-btn"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* REUSABLE MODAL: Patient Information Drawer */}
      <Modal
        isOpen={!!selectedApt}
        onClose={() => setSelectedApt(null)}
        title={selectedApt ? `Consultation Record: ${selectedApt.id}` : "Consultation Record"}
        description={
          selectedApt
            ? `${selectedApt.date} at ${selectedApt.time} (${selectedApt.status})`
            : ""
        }
        size="lg"
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button variant="primary" onClick={() => setSelectedApt(null)}>
              Close Record
            </Button>
          </div>
        }
      >
        {selectedApt && (
          <div className="order-drawer-content" style={{ marginTop: "12px" }}>
            {/* Patient & Clinic Details */}
            <div className="drawer-info-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
              <div className="drawer-info-block" style={{ padding: "16px", background: "var(--cream-card)", borderRadius: "12px", border: "1px solid var(--border)" }}>
                <h4 style={{ margin: "0 0 10px", color: "var(--green)" }}>Patient Details</h4>
                <p style={{ margin: "0 0 4px", fontSize: "0.9rem" }}>
                  <strong>Name:</strong> {selectedApt.patientName}
                </p>
                <p style={{ margin: "0 0 4px", fontSize: "0.9rem" }}>
                  <strong>Phone:</strong> {selectedApt.phone}
                </p>
                <p style={{ margin: 0, fontSize: "0.9rem" }}>
                  <strong>Email:</strong> {selectedApt.email}
                </p>
              </div>

              <div className="drawer-info-block" style={{ padding: "16px", background: "var(--cream-card)", borderRadius: "12px", border: "1px solid var(--border)" }}>
                <h4 style={{ margin: "0 0 10px", color: "var(--green)" }}>Clinical Session</h4>
                <p style={{ margin: "0 0 4px", fontSize: "0.9rem" }}>
                  <strong>Physician:</strong>{" "}
                  {doctorMap.get(selectedApt.doctorId)?.name || selectedApt.doctorId}
                </p>
                <p style={{ margin: "0 0 4px", fontSize: "0.9rem" }}>
                  <strong>Therapy:</strong>{" "}
                  {treatmentMap.get(selectedApt.treatmentId)?.name ||
                    selectedApt.treatmentId}
                </p>
                <p style={{ margin: 0, fontSize: "0.9rem" }}>
                  <strong>Scheduled:</strong> {selectedApt.date} at {selectedApt.time}
                </p>
              </div>
            </div>

            {selectedApt.notes && (
              <div
                style={{
                  padding: "14px 16px",
                  background: "rgba(24, 66, 50, 0.04)",
                  borderRadius: "12px",
                  marginBottom: "20px",
                }}
              >
                <h4 style={{ margin: "0 0 6px", color: "var(--green)", fontSize: "0.92rem" }}>Reported Symptoms &amp; Notes</h4>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--ink-light)" }}>{selectedApt.notes}</p>
              </div>
            )}

            {/* Status Update Actions */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 16px",
                background: "var(--cream-card)",
                borderRadius: "12px",
                border: "1px solid var(--border)",
              }}
            >
              <div>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "8px" }}>
                  Update Appointment Status:
                </span>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {ALL_STATUSES.map((st) => (
                    <button
                      key={st}
                      type="button"
                      className={`status-btn-choice ${selectedApt.status === st ? "active" : ""}`}
                      onClick={() => handleUpdateStatus(selectedApt.id, st)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "6px",
                        border: "1px solid var(--border)",
                        background: selectedApt.status === st ? "var(--green)" : "#fff",
                        color: selectedApt.status === st ? "#fff" : "var(--ink)",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* REUSABLE MODAL: Cancel Confirmation */}
      <Modal
        isOpen={!!aptToCancel}
        onClose={() => setAptToCancel(null)}
        title="Confirm Appointment Cancellation"
        description={`Cancel consultation for ${aptToCancel?.patientName} on ${aptToCancel?.date} at ${aptToCancel?.time}?`}
        footer={
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <Button variant="ghost" onClick={() => setAptToCancel(null)}>
              Keep Appointment
            </Button>
            <Button variant="danger" onClick={handleConfirmCancel}>
              Cancel Appointment
            </Button>
          </div>
        }
      >
        <p style={{ margin: 0, color: "var(--ink-light)", fontSize: "0.95rem" }}>
          Cancelling will automatically release this time slot so it becomes available
          again for other patients to book in the public appointment flow.
        </p>
      </Modal>
    </div>
  );
}
