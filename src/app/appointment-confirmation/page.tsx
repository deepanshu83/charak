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

interface ConfirmedAppointment {
  id: string;
  patientName: string;
  doctorName?: string;
  treatmentName?: string;
  date: string;
  time: string;
  status: string;
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
    <div className="appointment-confirmation-page py-16">
      <div className="wrap max-w-3xl mx-auto px-4">
        <div
          className="rounded-2xl border border-[var(--border)] p-8 sm:p-12 shadow-sm text-center"
          style={{ background: "var(--cream-card)" }}
        >
          <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={36} />
          </div>

          <span className="tag">Consultation Confirmed</span>

          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[var(--green)] mb-3">
            Appointment Confirmed
          </h1>

          <p className="text-stone-600 max-w-xl mx-auto mb-8">
            Your clinical consultation at Charak Ayurveda Hospital has been reserved.
            Our medical reception desk has locked your consultation slot in the doctors schedule.
          </p>

          <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-6 text-left mb-8 max-w-xl mx-auto">
            <div className="flex justify-between items-center border-b border-stone-200 pb-3 mb-4">
              <div>
                <span className="text-xs text-stone-500 uppercase font-semibold">Reference ID</span>
                <p className="font-mono text-sm font-bold text-[var(--green)]">
                  {appointment?.id || queryId || "APT-CHARAK-CONFIRMED"}
                </p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-md text-xs font-bold">
                {appointment?.status || "CONFIRMED"}
              </span>
            </div>

            <div className="space-y-3 text-sm text-stone-700">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-stone-600">
                  <User size={15} /> Patient:
                </span>
                <strong className="text-stone-900">
                  {appointment?.patientName || "Valued Patient"}
                </strong>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-stone-600">
                  <Stethoscope size={15} /> Senior Physician:
                </span>
                <strong className="text-stone-900">
                  {appointment?.doctorName || "Senior Ayurvedic Physician"}
                </strong>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-stone-600">
                  <HeartPulse size={15} /> Treatment Focus:
                </span>
                <strong className="text-stone-900">
                  {appointment?.treatmentName || "Ayurvedic Health Consultation"}
                </strong>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-stone-600">
                  <Calendar size={15} /> Date:
                </span>
                <strong className="text-stone-900">
                  {appointment?.date || "Scheduled Date"}
                </strong>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-stone-600">
                  <Clock size={15} /> Time Slot:
                </span>
                <strong className="text-stone-900">
                  {appointment?.time ? `${appointment.time} hrs` : "Morning Session"}
                </strong>
              </div>
            </div>
          </div>

          <div className="bg-amber-50/60 border border-amber-200/70 rounded-xl p-4 text-xs text-amber-900 max-w-xl mx-auto mb-8 text-left flex items-start gap-3">
            <ShieldCheck size={16} className="shrink-0 mt-0.5 text-amber-700" />
            <div>
              <strong>Hospital Arrival Instructions</strong>
              <p className="mt-0.5 text-stone-600">
                Please arrive 10 minutes prior to your consulting time at Birla Hospital Road, Vidyavihar, Pilani.
                Consultation fees are paid directly at reception.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/appointment"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--green)] text-white font-medium rounded-lg hover:bg-[#0f3023] transition-colors"
            >
              <CalendarCheck size={18} /> Book Another Appointment
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-stone-300 text-stone-700 font-medium rounded-lg hover:bg-stone-50 transition-colors"
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
