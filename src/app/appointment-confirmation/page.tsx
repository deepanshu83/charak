"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CalendarCheck,
  Calendar,
  Clock,
  User,
  HeartPulse,
  Stethoscope,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import BrandHeader from "@/components/ui/BrandHeader";
import { formatTime12Hour } from "@/lib/appointmentAvailability";

interface ConfirmedAppointment {
  id: string;
  patientName: string;
  doctorName?: string;
  treatmentName?: string;
  date: string;
  time: string;
  status: string;
  paymentStatus?: string;
  notes?: string;
}

function AppointmentConfirmationContent() {
  const searchParams = useSearchParams();
  const queryId = searchParams.get("id");
  const [appointment, setAppointment] = useState<ConfirmedAppointment | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("charak-last-appointment");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!queryId || parsed.id === queryId) {
          setAppointment(parsed);
        }
      }
    } catch {
      // Ignore
    }
  }, [queryId]);

  return (
    <div style={{ padding: "48px 16px 80px", minHeight: "80vh", background: "var(--cream)" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>
        <div
          style={{
            background: "#ffffff",
            border: "1px solid rgba(197, 160, 89, 0.35)",
            borderRadius: "24px",
            padding: "40px 32px",
            boxShadow: "0 12px 36px rgba(24, 66, 50, 0.08)",
            textAlign: "center",
          }}
        >
          {/* Success Check Icon */}
          <div
            style={{
              width: "68px",
              height: "68px",
              borderRadius: "50%",
              background: "rgba(24, 66, 50, 0.08)",
              color: "var(--green)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              border: "2px solid var(--green)",
            }}
          >
            <CheckCircle2 size={38} />
          </div>

          <div
            style={{
              display: "inline-block",
              background: "rgba(197, 160, 89, 0.15)",
              color: "#8a6416",
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "4px 14px",
              borderRadius: "20px",
              marginBottom: "12px",
            }}
          >
            Consultation Confirmed
          </div>

          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "2rem",
              color: "var(--green)",
              margin: "0 0 10px 0",
              fontWeight: 700,
            }}
          >
            Appointment Confirmed
          </h1>

          <p
            style={{
              color: "var(--ink-light)",
              fontSize: "0.95rem",
              lineHeight: "1.6",
              maxWidth: "520px",
              margin: "0 auto 28px",
            }}
          >
            Your clinical consultation at Charak Ayurveda Hospital has been successfully reserved.
            Our medical reception desk has locked your consultation slot in the doctors schedule.
          </p>

          {/* Consultation Summary Box */}
          <div
            style={{
              background: "#faf7f2",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              borderRadius: "16px",
              padding: "20px 24px",
              textAlign: "left",
              marginBottom: "24px",
            }}
          >
            {/* Header: Ref ID & Status */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
                paddingBottom: "14px",
                marginBottom: "16px",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--ink-light)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontWeight: 700,
                    display: "block",
                  }}
                >
                  Reference ID
                </span>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.92rem",
                    fontWeight: 700,
                    color: "var(--green)",
                    wordBreak: "break-all",
                  }}
                >
                  {appointment?.id || queryId || "APT-CHARAK-CONFIRMED"}
                </span>
              </div>
              <span
                style={{
                  background: "rgba(46, 125, 50, 0.12)",
                  color: "#2e7d32",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                {appointment?.status || "CONFIRMED"}
              </span>
            </div>

            {/* Key-Value Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.88rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed rgba(0,0,0,0.06)", paddingBottom: "8px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--ink-light)" }}>
                  <User size={15} color="var(--green)" /> Patient:
                </span>
                <strong style={{ color: "var(--ink)" }}>
                  {appointment?.patientName || "Valued Patient"}
                </strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed rgba(0,0,0,0.06)", paddingBottom: "8px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--ink-light)" }}>
                  <Stethoscope size={15} color="var(--green)" /> Senior Physician:
                </span>
                <strong style={{ color: "var(--ink)" }}>
                  {appointment?.doctorName || "Senior Ayurvedic Physician"}
                </strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed rgba(0,0,0,0.06)", paddingBottom: "8px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--ink-light)" }}>
                  <HeartPulse size={15} color="var(--green)" /> Treatment Focus:
                </span>
                <strong style={{ color: "var(--ink)" }}>
                  {appointment?.treatmentName || "Ayurvedic Health Consultation"}
                </strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed rgba(0,0,0,0.06)", paddingBottom: "8px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--ink-light)" }}>
                  <Calendar size={15} color="var(--green)" /> Date:
                </span>
                <strong style={{ color: "var(--ink)" }}>
                  {appointment?.date || "Scheduled Date"}
                </strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed rgba(0,0,0,0.06)", paddingBottom: "8px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--ink-light)" }}>
                  <Clock size={15} color="var(--green)" /> Time Slot:
                </span>
                <strong style={{ color: "var(--green)", fontWeight: 700 }}>
                  {appointment?.time ? formatTime12Hour(appointment.time) : "Morning Session"}
                </strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "4px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--ink-light)" }}>
                  <ShieldCheck size={15} color="var(--green)" /> Payment Status:
                </span>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    background:
                      appointment?.paymentStatus === "PAID"
                        ? "rgba(46, 125, 50, 0.12)"
                        : "rgba(200, 140, 40, 0.12)",
                    color:
                      appointment?.paymentStatus === "PAID" ? "#2e7d32" : "#8c5d12",
                  }}
                >
                  {appointment?.paymentStatus === "PAID"
                    ? "Paid Online (Razorpay)"
                    : "Payable at Clinic Reception"}
                </span>
              </div>
            </div>
          </div>

          {/* Hospital Arrival Notice Box */}
          <div
            style={{
              background: "#fff9ee",
              border: "1px solid rgba(197, 160, 89, 0.35)",
              borderRadius: "12px",
              padding: "14px 18px",
              fontSize: "0.82rem",
              color: "#6b5118",
              textAlign: "left",
              marginBottom: "28px",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: "2px", color: "var(--gold)" }} />
            <div style={{ lineHeight: "1.5" }}>
              <strong style={{ display: "block", color: "#4d390e", marginBottom: "3px" }}>
                Hospital Arrival Instructions
              </strong>
              {appointment?.paymentStatus === "PAID"
                ? "Your consultation fee has been settled via Razorpay. Please arrive 10 minutes prior to your consulting time at Birla Hospital Road, Vidyavihar, Pilani and quote your Reference ID."
                : "Please arrive 10 minutes prior to your consulting time at Birla Hospital Road, Vidyavihar, Pilani. Consultation fees are paid directly at reception."}
            </div>
          </div>

          {/* Action Navigation Buttons */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/appointment"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "12px 24px",
                background: "var(--green)",
                color: "#ffffff",
                borderRadius: "9999px",
                fontWeight: 600,
                fontSize: "0.9rem",
                textDecoration: "none",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 8px rgba(24, 66, 50, 0.2)",
              }}
            >
              <CalendarCheck size={16} /> Book Another Appointment
            </Link>

            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "12px 24px",
                background: "#ffffff",
                color: "var(--ink)",
                border: "1px solid var(--border)",
                borderRadius: "9999px",
                fontWeight: 600,
                fontSize: "0.9rem",
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppointmentConfirmationPage() {
  return (
    <BrandHeader>
      <Suspense
        fallback={
          <div className="py-24 text-center">
            <CalendarCheck size={32} className="animate-spin text-emerald-800 mx-auto mb-4" />
            <p className="text-stone-600">Loading appointment confirmation...</p>
          </div>
        }
      >
        <AppointmentConfirmationContent />
      </Suspense>
    </BrandHeader>
  );
}
