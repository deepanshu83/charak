"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  HeartPulse,
  Info,
  Loader2,
  MapPin,
  Printer,
  RotateCcw,
  ShieldCheck,
  CreditCard,
  Building2,
  Lock,
} from "lucide-react";
import {
  bookAppointment,
  fetchAvailableSlots,
  getAllDoctorSlots,
  getDoctors,
  getTreatments,
  subscribeAppointments,
  type BookingConfirmation,
} from "@/lib/appointmentService";
import { fetchDoctors } from "@/lib/doctorService";
import { fetchTreatments } from "@/lib/treatmentService";
import { getTodayIST } from "@/lib/appointmentAvailability";
import { launchRazorpayCheckout } from "@/lib/razorpayClient";
import type { Doctor, Treatment } from "@/types";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Textarea,
  useToast,
} from "@/components/ui";

const STEPS = [
  { num: 1, label: "Treatment" },
  { num: 2, label: "Doctor" },
  { num: 3, label: "Date" },
  { num: 4, label: "Time" },
  { num: 5, label: "Patient Details" },
  { num: 6, label: "Review" },
  { num: 7, label: "Confirmation" },
] as const;

export default function AppointmentFlow() {
  const toast = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>(getDoctors());
  const [treatments, setTreatments] = useState<Treatment[]>(getTreatments());

  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string>(
    treatments[0]?.id || "treat-1"
  );
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    doctors[0]?.id || "doc-1"
  );
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "pay_at_clinic">("razorpay");

  // Fetch live active doctors & treatments from Supabase on mount
  useEffect(() => {
    fetchDoctors()
      .then((docs) => {
        if (docs && docs.length > 0) {
          setDoctors(docs);
          setSelectedDoctorId((prev) =>
            docs.some((d) => d.id === prev) ? prev : docs[0].id
          );
        }
      })
      .catch(() => {});

    fetchTreatments()
      .then((treats) => {
        if (treats && treats.length > 0) {
          setTreatments(treats);
          setSelectedTreatmentId((prev) =>
            treats.some((t) => t.id === prev) ? prev : treats[0].id
          );
        }
      })
      .catch(() => {});
  }, []);

  // Generate dynamic 7-day calendar starting today (IST)
  const availableDates = useMemo(() => {
    const dates: string[] = [];
    const todayStr = getTodayIST();
    const [y, m, d] = todayStr.split("-").map(Number);
    const startDate = new Date(y, m - 1, d);
    for (let i = 0; i < 7; i++) {
      const cur = new Date(startDate);
      cur.setDate(startDate.getDate() + i);
      const iso = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}-${String(cur.getDate()).padStart(2, "0")}`;
      dates.push(iso);
    }
    return dates;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(availableDates[0]);
  const [selectedTime, setSelectedTime] = useState<string>("");

  const [patientForm, setPatientForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    notes: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [createdAppointment, setCreatedAppointment] = useState<BookingConfirmation | null>(
    null
  );

  // Slots with availability status
  const [allSlots, setAllSlots] = useState<{ time: string; isAvailable: boolean }[]>([]);

  const refreshSlots = async () => {
    setSlotsLoading(true);
    try {
      const data = await fetchAvailableSlots(selectedDoctorId, selectedDate);
      const slots = data.slots || [];
      setAllSlots(slots);
      // If selected time is no longer available in newly fetched slots, update it
      const selectedSlotObj = slots.find((s) => s.time === selectedTime);
      if (!selectedSlotObj || !selectedSlotObj.isAvailable) {
        const firstAvailable = slots.find((s) => s.isAvailable);
        setSelectedTime(firstAvailable ? firstAvailable.time : "");
      }
    } catch {
      const slots = getAllDoctorSlots(selectedDoctorId, selectedDate);
      setAllSlots(slots);
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    refreshSlots();
    const unsubscribe = subscribeAppointments(() => {
      refreshSlots();
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDoctorId, selectedDate]);

  const selectedDoctor =
    doctors.find((d) => d.id === selectedDoctorId) || doctors[0] || null;
  const selectedTreatment =
    treatments.find((t) => t.id === selectedTreatmentId) || treatments[0] || null;

  const sortedDoctors = useMemo(() => {
    return [...doctors].sort((a, b) => {
      const aMatches = a.treatmentIds?.includes(selectedTreatmentId) ? 1 : 0;
      const bMatches = b.treatmentIds?.includes(selectedTreatmentId) ? 1 : 0;
      return bMatches - aMatches;
    });
  }, [doctors, selectedTreatmentId]);

  const handleContinueToDoctor = () => {
    const matchingDoctor = doctors.find((d) =>
      d.treatmentIds && d.treatmentIds.includes(selectedTreatmentId)
    );
    if (matchingDoctor) {
      setSelectedDoctorId(matchingDoctor.id);
    }
    setStep(2);
  };

  const availableSlotsCount = allSlots.filter((s) => s.isAvailable).length;

  const validatePatientForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!patientForm.fullName.trim()) {
      errs.fullName = "Patient name is required";
    }
    if (!patientForm.phone.trim()) {
      errs.phone = "Phone number is required";
    } else if (!/^[0-9+ -]{7,15}$/.test(patientForm.phone.trim())) {
      errs.phone = "Enter a valid phone number";
    }
    if (!patientForm.email.trim()) {
      errs.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(patientForm.email)) {
      errs.email = "Enter a valid email address";
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePayWithRazorpay = async () => {
    if (!selectedTime) {
      toast.error("Please select a time slot", "A consultation time slot is required.");
      return;
    }

    const feeInRupees = selectedDoctor?.consultationFee ?? 500;
    const feeInPaise = Math.round(feeInRupees * 100);

    setIsSubmitting(true);

    try {
      await launchRazorpayCheckout({
        amountPaise: feeInPaise,
        currency: "INR",
        description: `Consultation with ${selectedDoctor?.name || "Senior Ayurvedic Physician"}`,
        prefill: {
          name: patientForm.fullName.trim(),
          email: patientForm.email.trim(),
          contact: patientForm.phone.trim(),
        },
        notes: {
          doctorId: selectedDoctorId,
          doctorName: selectedDoctor?.name || "",
          treatmentId: selectedTreatmentId,
          treatmentName: selectedTreatment?.name || "",
          appointmentDate: selectedDate,
          appointmentTime: selectedTime,
        },
        onSuccess: async (verifyResult, raw) => {
          try {
            const confirmation = await bookAppointment({
              patientName: patientForm.fullName.trim(),
              phone: patientForm.phone.trim(),
              email: patientForm.email.trim() || undefined,
              doctorId: selectedDoctorId,
              treatmentId: selectedTreatmentId,
              date: selectedDate,
              time: selectedTime,
              notes: patientForm.notes.trim() || undefined,
              paymentStatus: "PAID",
              razorpayPaymentId: raw.razorpay_payment_id,
            });

            setCreatedAppointment(confirmation);
            try {
              localStorage.setItem("charak-last-appointment", JSON.stringify(confirmation));
            } catch {
              // Ignore
            }
            setStep(7);
            toast.success(
              "Payment Verified & Appointment Confirmed!",
              `Ref: ${confirmation.id} • Razorpay ID: ${raw.razorpay_payment_id}`
            );
          } catch (bookErr: unknown) {
            const msg = bookErr instanceof Error ? bookErr.message : "Payment verified but slot encountered a conflict. Please contact clinic reception.";
            toast.error("Slot Conflict", msg);
          } finally {
            setIsSubmitting(false);
          }
        },
        onError: (errMsg) => {
          setIsSubmitting(false);
          toast.error("Payment Notice", errMsg);
        },
        onDismiss: () => {
          setIsSubmitting(false);
          toast.warning(
            "Payment Window Closed",
            "Payment checkout was dismissed. You can retry online payment or choose to pay at the clinic."
          );
        },
      });
    } catch (err: unknown) {
      setIsSubmitting(false);
      const msg = err instanceof Error ? err.message : "Failed to start Razorpay checkout.";
      toast.error("Payment Error", msg);
    }
  };

  const handleConfirmAppointment = async () => {
    if (paymentMethod === "razorpay") {
      await handlePayWithRazorpay();
      return;
    }

    if (!selectedTime) {
      toast.error("Please select a time slot", "A consultation time slot is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const confirmation = await bookAppointment({
        patientName: patientForm.fullName.trim(),
        phone: patientForm.phone.trim(),
        email: patientForm.email.trim() || undefined,
        doctorId: selectedDoctorId,
        treatmentId: selectedTreatmentId,
        date: selectedDate,
        time: selectedTime,
        notes: patientForm.notes.trim() || undefined,
      });

      setCreatedAppointment(confirmation);
      try {
        localStorage.setItem("charak-last-appointment", JSON.stringify(confirmation));
      } catch {
        // Ignore
      }
      setStep(7);
      toast.success(
        "Appointment Confirmed!",
        `Ref: ${confirmation.id}. Slot booked for ${confirmation.doctorName || selectedDoctor?.name || "Senior Physician"}.`
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "This appointment slot was just booked. Please select another time.";

      const isSlotConflict =
        errorMessage.toLowerCase().includes("slot") ||
        errorMessage.toLowerCase().includes("already booked") ||
        errorMessage.toLowerCase().includes("conflict");

      if (isSlotConflict) {
        toast.error("Booking Conflict", errorMessage);
        // Re-fetch slots so the newly taken slot shows disabled
        await refreshSlots();
        // Transition back to step 4 so user can pick another slot
        setStep(4);
      } else {
        toast.error("Booking Notice", errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBooking = () => {
    setCreatedAppointment(null);
    setStep(1);
    setPatientForm({ fullName: "", phone: "", email: "", notes: "" });
    refreshSlots();
  };

  const progressPercentage = Math.round((step / STEPS.length) * 100);

  return (
    <section className="mvp-section" aria-label="Ayurvedic Consultation Booking">
      <div className="wrap">
        <div className="mvp-page-heading">
          <span className="tag">Classical Ayurvedic Consultation</span>
          <h1>Book a Doctor Consultation</h1>
          <p>
            Experience authentic pulse diagnosis (Nadi Pariksha) and individualized
            healing plans beside Birla Hospital, Vidyavihar, Pilani.
          </p>
        </div>

        {/* Stepper Progress Bar */}
        <div className="stepper-progress-wrap" role="progressbar" aria-valuenow={progressPercentage} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="stepper-progress-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Stepper Navigation */}
        <nav className="mvp-stepper-bar" aria-label="Booking Steps">
          {STEPS.map((item) => {
            const isCompleted = step > item.num;
            const isActive = step === item.num;
            const canNavigate = item.num < step && step < 7;

            return (
              <div
                key={item.num}
                className={`stepper-item ${isActive ? "active" : ""} ${
                  isCompleted ? "completed" : ""
                }`}
                onClick={() => {
                  if (canNavigate) setStep(item.num);
                }}
                style={{ cursor: canNavigate ? "pointer" : "default" }}
                aria-current={isActive ? "step" : undefined}
                role="button"
                tabIndex={canNavigate ? 0 : -1}
                onKeyDown={(e) => {
                  if (canNavigate && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    setStep(item.num);
                  }
                }}
              >
                <span className="stepper-circle">
                  {isCompleted ? <Check size={14} /> : item.num}
                </span>
                <span className="stepper-label">{item.label}</span>
              </div>
            );
          })}
        </nav>

        {/* STEP 7: CONFIRMATION SCREEN */}
        {step === 7 && createdAppointment ? (
          <div className="mvp-success-wrapper">
            <Card variant="highlight" className="mvp-success-card">
              <div className="success-icon-wrap">
                <CheckCircle2 size={56} className="text-gold" />
              </div>

              <Badge variant="gold" dot>
                Step 7 of 7 &bull; Booking Confirmed
              </Badge>

              <h1 style={{ marginTop: "12px" }}>Consultation Scheduled Successfully</h1>

              <p className="success-subtext">
                Your consultation slot has been reserved. The slot{" "}
                <strong>{createdAppointment.time}</strong> on{" "}
                <strong>{createdAppointment.date}</strong> is now locked in the schedule.
              </p>

              <div className="order-id-badge">
                <span>Appointment Reference ID:</span>
                <strong>{createdAppointment.id}</strong>
              </div>

              <div className="order-summary-box">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 style={{ margin: 0 }}>Consultation Summary</h3>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <Badge variant={createdAppointment.status === "CONFIRMED" ? "success" : "gold"}>
                      {createdAppointment.status || "CONFIRMED"}
                    </Badge>
                    <Badge variant={createdAppointment.paymentStatus === "PAID" ? "success" : "gold"} dot={createdAppointment.paymentStatus === "PAID"}>
                      {createdAppointment.paymentStatus === "PAID" ? "Paid via Razorpay" : "Payment at Reception"}
                    </Badge>
                  </div>
                </div>

                <div className="order-details-grid">
                  <div>
                    <span>Patient Name:</span>
                    <strong>{createdAppointment.patientName}</strong>
                  </div>
                  <div>
                    <span>Contact:</span>
                    <strong>{createdAppointment.phone}</strong>
                  </div>
                  <div>
                    <span>Physician:</span>
                    <strong>{selectedDoctor?.name}</strong>
                  </div>
                  <div>
                    <span>Treatment Focus:</span>
                    <strong>{selectedTreatment?.name}</strong>
                  </div>
                  <div>
                    <span>Date:</span>
                    <strong>
                      {new Date(`${createdAppointment.date}T00:00:00`).toLocaleDateString(
                        "en-IN",
                        {
                          weekday: "long",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </strong>
                  </div>
                  <div>
                    <span>Time Slot:</span>
                    <strong>{createdAppointment.time}</strong>
                  </div>
                  <div>
                    <span>Payment Status:</span>
                    <strong style={{ color: createdAppointment.paymentStatus === "PAID" ? "var(--green)" : "var(--terra)" }}>
                      {createdAppointment.paymentStatus === "PAID" ? "Paid Online (Razorpay)" : "Pending at Reception"}
                    </strong>
                  </div>
                  <div>
                    <span>Consultation Fee:</span>
                    <strong>₹{(selectedDoctor?.consultationFee ?? 500).toLocaleString("en-IN")}</strong>
                  </div>
                </div>

                {createdAppointment.notes && (
                  <div
                    style={{
                      marginTop: "16px",
                      padding: "12px 14px",
                      background: "rgba(24, 66, 50, 0.04)",
                      borderRadius: "10px",
                      fontSize: "0.9rem",
                      color: "var(--ink-light)",
                    }}
                  >
                    <strong style={{ color: "var(--ink)" }}>Appointment Details &amp; Notes:</strong>{" "}
                    {createdAppointment.notes}
                  </div>
                )}
              </div>

              <div className="prototype-status-note">
                <Info size={16} />
                <span>
                  {createdAppointment.paymentStatus === "PAID" ? (
                    <>
                      <strong>Payment Receipt Confirmed:</strong> Your consultation fee has been settled via Razorpay Secure Checkout. Please arrive 10 minutes prior to your scheduled consultation time.
                    </>
                  ) : (
                    <>
                      <strong>Preparation for Nadi Pariksha:</strong> Please arrive 10 minutes early. Consultation fee of ₹{(selectedDoctor?.consultationFee ?? 500).toLocaleString("en-IN")} is settled directly at the hospital reception.
                    </>
                  )}
                </span>
              </div>

              <div className="success-actions" style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
                <Link href={`/appointment-confirmation?id=${encodeURIComponent(createdAppointment.id)}`}>
                  <Button variant="primary" icon={<ArrowRight size={16} />} iconPosition="right">
                    View Confirmation Slip
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => window.print()}
                  icon={<Printer size={16} />}
                >
                  Print Summary
                </Button>
                <Button
                  variant="ghost"
                  onClick={resetBooking}
                  icon={<RotateCcw size={16} />}
                >
                  Book Another Consultation
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          /* STEPS 1-6 MAIN LAYOUT */
          <div className="mvp-appointment-layout">
            <div className="mvp-appointment-panel">
              {/* STEP 1: SELECT TREATMENT */}
              {step === 1 && (
                <div className="step-content">
                  <div className="step-header">
                    <Badge variant="gold">Step 1 of 7</Badge>
                    <h2>Select Clinical Concern or Treatment</h2>
                    <p>Choose the therapy focus for your personalized consultation.</p>
                  </div>

                  {treatments.length === 0 ? (
                    <EmptyState
                      icon={<HeartPulse size={40} className="text-gold" />}
                      title="No Treatments Available"
                      description="Therapy catalog is currently being updated. Please consult our front desk."
                    />
                  ) : (
                    <div className="choice-cards-grid">
                      {treatments.map((t) => {
                        const isSelected = selectedTreatmentId === t.id;
                        return (
                          <div
                            key={t.id}
                            className={`choice-card ${isSelected ? "selected" : ""}`}
                            onClick={() => setSelectedTreatmentId(t.id)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setSelectedTreatmentId(t.id);
                              }
                            }}
                          >
                            <div className="choice-card-icon">
                              <HeartPulse size={24} />
                            </div>
                            <div className="choice-card-body" style={{ flex: 1 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <h3>{t.name}</h3>
                                {isSelected && (
                                  <Badge variant="success" size="sm">
                                    Selected
                                  </Badge>
                                )}
                              </div>
                              <p>{t.description}</p>
                              <div className="choice-card-meta">
                                <span>Duration: {t.duration}</span>
                                <strong>₹{(t.price ?? 0).toLocaleString("en-IN")}</strong>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="step-actions">
                    <span />
                    <Button
                      variant="primary"
                      onClick={handleContinueToDoctor}
                      icon={<ArrowRight size={16} />}
                      iconPosition="right"
                    >
                      Continue to Doctor
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 2: SELECT DOCTOR */}
              {step === 2 && (
                <div className="step-content">
                  <div className="step-header">
                    <Badge variant="gold">Step 2 of 7</Badge>
                    <h2>Select Senior Physician</h2>
                    <p>Consult with our experienced Ayurvedic Vaidyas at Pilani.</p>
                  </div>

                  {doctors.length === 0 ? (
                    <EmptyState
                      icon={<HeartPulse size={40} className="text-gold" />}
                      title="No Physicians Available"
                      description="Doctor roster is currently being refreshed. Please consult hospital administration."
                    />
                  ) : (
                    <div className="choice-cards-grid">
                      {sortedDoctors.map((doc) => {
                        const isSelected = selectedDoctorId === doc.id;
                        const isSpecialistForSelected =
                          Boolean(doc.treatmentIds && doc.treatmentIds.includes(selectedTreatmentId));
                        return (
                          <div
                            key={doc.id}
                            className={`choice-card doctor-choice-card ${
                              isSelected ? "selected" : ""
                            }`}
                            onClick={() => setSelectedDoctorId(doc.id)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setSelectedDoctorId(doc.id);
                              }
                            }}
                          >
                            <div className="doctor-avatar-wrap">
                              <Image
                                src={doc.image || "/images/g5.jpg"}
                                alt={doc.name}
                                width={60}
                                height={60}
                                className="doctor-avatar"
                                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
                              />
                            </div>
                            <div className="choice-card-body" style={{ flex: 1 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", flexWrap: "wrap" }}>
                                <h3>{doc.name}</h3>
                                <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                                  {isSpecialistForSelected && (
                                    <Badge variant="gold" size="sm">
                                      Specialist
                                    </Badge>
                                  )}
                                  {isSelected && (
                                    <Badge variant="success" size="sm">
                                      Selected
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <p className="doctor-title">{doc.title}</p>
                              <p className="doctor-meta">
                                {doc.qualifications} &bull; {doc.experience}
                              </p>

                              {/* Treatment/Consultation Tags */}
                              {doc.treatmentIds && doc.treatmentIds.length > 0 && (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", margin: "6px 0 8px 0" }}>
                                  {doc.treatmentIds.map((tid) => {
                                    const tr = treatments.find((t) => t.id === tid);
                                    if (!tr) return null;
                                    const isMatch = tid === selectedTreatmentId;
                                    return (
                                      <span
                                        key={tid}
                                        style={{
                                          fontSize: "0.72rem",
                                          padding: "2px 7px",
                                          borderRadius: "4px",
                                          background: isMatch ? "rgba(197, 160, 89, 0.2)" : "rgba(24, 66, 50, 0.06)",
                                          color: isMatch ? "#8a6416" : "var(--green)",
                                          fontWeight: isMatch ? 700 : 500,
                                          border: isMatch ? "1px solid rgba(197, 160, 89, 0.4)" : "1px solid rgba(24, 66, 50, 0.12)",
                                        }}
                                      >
                                        {tr.name}
                                      </span>
                                    );
                                  })}
                                </div>
                              )}

                              <div className="choice-card-meta">
                                <span>
                                  <MapPin size={13} style={{ verticalAlign: "-2px", marginRight: "3px" }} />
                                  {doc.location}
                                </span>
                                <strong>
                                  Fee: ₹{(doc.consultationFee ?? 500).toLocaleString("en-IN")}
                                </strong>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="step-actions">
                    <Button
                      variant="ghost"
                      onClick={() => setStep(1)}
                      icon={<ArrowLeft size={16} />}
                    >
                      Back
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => setStep(3)}
                      icon={<ArrowRight size={16} />}
                      iconPosition="right"
                    >
                      Continue to Date
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: SELECT DATE */}
              {step === 3 && (
                <div className="step-content">
                  <div className="step-header">
                    <Badge variant="gold">Step 3 of 7</Badge>
                    <h2>Select Consultation Date</h2>
                    <p>Appointments available Monday through Sunday (9:00 AM – 7:00 PM).</p>
                  </div>

                  <div className="date-cards-grid">
                    {availableDates.map((dStr) => {
                      const dateObj = new Date(`${dStr}T00:00:00`);
                      const isToday =
                        new Date().toISOString().split("T")[0] === dStr;
                      const isSelected = selectedDate === dStr;

                      return (
                        <button
                          key={dStr}
                          type="button"
                          className={`date-card ${isSelected ? "selected" : ""}`}
                          onClick={() => setSelectedDate(dStr)}
                        >
                          <Calendar size={20} />
                          <span className="date-weekday">
                            {dateObj.toLocaleDateString("en-IN", {
                              weekday: "short",
                            })}
                          </span>
                          <strong className="date-number">
                            {dateObj.getDate()}{" "}
                            {dateObj.toLocaleDateString("en-IN", {
                              month: "short",
                            })}
                          </strong>
                          <span
                            className="slot-badge"
                            style={{
                              color: "var(--green)",
                            }}
                          >
                            Slots Available
                          </span>
                          {isToday && <span className="today-tag">Today</span>}
                        </button>
                      );
                    })}
                  </div>

                  <div className="step-actions">
                    <Button
                      variant="ghost"
                      onClick={() => setStep(2)}
                      icon={<ArrowLeft size={16} />}
                    >
                      Back
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => setStep(4)}
                      icon={<ArrowRight size={16} />}
                      iconPosition="right"
                    >
                      Select Time Slot
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 4: SELECT TIME SLOT */}
              {step === 4 && (
                <div className="step-content">
                  <div className="step-header">
                    <Badge variant="gold">Step 4 of 7</Badge>
                    <h2>Available Time Slots</h2>
                    <p>
                      Consulting with <strong>{selectedDoctor?.name || "Senior Physician"}</strong> on{" "}
                      <strong>
                        {new Date(`${selectedDate}T00:00:00`).toLocaleDateString(
                          "en-IN",
                          { weekday: "long", day: "numeric", month: "short" }
                        )}
                      </strong>
                    </p>
                  </div>

                  {slotsLoading ? (
                    <div style={{ padding: "48px 20px", textAlign: "center" }}>
                      <Loader2
                        size={32}
                        className="animate-spin text-gold"
                        style={{ margin: "0 auto 12px", animation: "spin 1s linear infinite" }}
                      />
                      <p style={{ color: "var(--ink-light)", fontSize: "0.95rem" }}>
                        Checking physician schedule with clinical database...
                      </p>
                    </div>
                  ) : availableSlotsCount === 0 ? (
                    <EmptyState
                      icon={<Clock size={40} className="text-gold" />}
                      title="No Slots Available"
                      description={`All consultation slots for ${selectedDoctor?.name || "the selected physician"} are fully booked on this date. Please pick another date.`}
                      actionLabel="Choose Another Date"
                      onAction={() => setStep(3)}
                    />
                  ) : (
                    <>
                      <div className="time-slots-grid">
                        {allSlots.map((slot) => {
                          const isSelected = selectedTime === slot.time;
                          return (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={!slot.isAvailable}
                              className={`time-slot-btn ${
                                isSelected ? "selected" : ""
                              } ${!slot.isAvailable ? "disabled" : ""}`}
                              onClick={() => {
                                if (slot.isAvailable) setSelectedTime(slot.time);
                              }}
                              title={
                                slot.isAvailable
                                  ? `Select ${slot.time}`
                                  : "Slot already reserved"
                              }
                            >
                              <Clock size={15} />
                              <span>{slot.time}</span>
                              {!slot.isAvailable && (
                                <span style={{ fontSize: "0.68rem", opacity: 0.8 }}>
                                  (Full)
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <div className="slot-booking-note">
                        <ShieldCheck size={16} />
                        <span>
                          Once confirmed, your chosen slot is reserved exclusively. Rescheduling is complimentary up to 2 hours prior.
                        </span>
                      </div>
                    </>
                  )}

                  <div className="step-actions">
                    <Button
                      variant="ghost"
                      onClick={() => setStep(3)}
                      icon={<ArrowLeft size={16} />}
                    >
                      Back
                    </Button>
                    <Button
                      variant="primary"
                      disabled={!selectedTime || slotsLoading}
                      onClick={() => setStep(5)}
                      icon={<ArrowRight size={16} />}
                      iconPosition="right"
                    >
                      Patient Details
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 5: PATIENT DETAILS */}
              {step === 5 && (
                <div className="step-content">
                  <div className="step-header">
                    <Badge variant="gold">Step 5 of 7</Badge>
                    <h2>Patient Information</h2>
                    <p>Enter contact details for medical records and SMS/WhatsApp appointment reminders.</p>
                  </div>

                  <div className="mvp-form-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "18px" }}>
                    <Input
                      label="Patient Full Name"
                      required
                      value={patientForm.fullName}
                      onChange={(e) =>
                        setPatientForm({ ...patientForm, fullName: e.target.value })
                      }
                      placeholder="e.g. Priya Sharma"
                      error={formErrors.fullName}
                    />

                    <Input
                      label="Phone Number"
                      required
                      type="tel"
                      value={patientForm.phone}
                      onChange={(e) =>
                        setPatientForm({ ...patientForm, phone: e.target.value })
                      }
                      placeholder="+91 98765 43210"
                      error={formErrors.phone}
                      helperText="For consultation confirmations & reminders"
                    />

                    <div style={{ gridColumn: "span 2" }}>
                      <Input
                        label="Email Address"
                        required
                        type="email"
                        value={patientForm.email}
                        onChange={(e) =>
                          setPatientForm({ ...patientForm, email: e.target.value })
                        }
                        placeholder="priya@example.com"
                        error={formErrors.email}
                      />
                    </div>

                    <div style={{ gridColumn: "span 2" }}>
                      <Textarea
                        label="Health Concerns / Symptoms (Optional)"
                        value={patientForm.notes}
                        onChange={(e) =>
                          setPatientForm({ ...patientForm, notes: e.target.value })
                        }
                        placeholder="e.g. Chronic joint stiffness for 6 months, skin irritation, digestive troubles..."
                        rows={3}
                        helperText="Brief details assist our Vaidya in preparing prior to your arrival."
                      />
                    </div>
                  </div>

                  <div className="step-actions">
                    <Button
                      variant="ghost"
                      onClick={() => setStep(4)}
                      icon={<ArrowLeft size={16} />}
                    >
                      Back
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => {
                        if (validatePatientForm()) setStep(6);
                      }}
                      icon={<ArrowRight size={16} />}
                      iconPosition="right"
                    >
                      Review Booking
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 6: REVIEW & CONFIRM */}
              {step === 6 && (
                <div className="step-content">
                  <div className="step-header">
                    <Badge variant="gold">Step 6 of 7</Badge>
                    <h2>Review &amp; Confirm Booking</h2>
                    <p>Verify your consultation details before finalizing your appointment.</p>
                  </div>

                  <div className="review-box">
                    <div className="review-grid">
                      <div>
                        <span>Selected Treatment</span>
                        <strong>{selectedTreatment?.name || "Ayurvedic Treatment"}</strong>
                      </div>
                      <div>
                        <span>Senior Physician</span>
                        <strong>{selectedDoctor?.name || "Senior Physician"}</strong>
                      </div>
                      <div>
                        <span>Consultation Date &amp; Time</span>
                        <strong>
                          {new Date(`${selectedDate}T00:00:00`).toLocaleDateString(
                            "en-IN",
                            { weekday: "short", day: "numeric", month: "short", year: "numeric" }
                          )}{" "}
                          at {selectedTime}
                        </strong>
                      </div>
                      <div>
                        <span>Patient Name</span>
                        <strong>{patientForm.fullName}</strong>
                      </div>
                      <div>
                        <span>Contact Info</span>
                        <strong>
                          {patientForm.phone} &bull; {patientForm.email}
                        </strong>
                      </div>
                      <div>
                        <span>Consultation Fee</span>
                        <strong style={{ color: "var(--green)" }}>
                          ₹{(selectedDoctor?.consultationFee ?? 500).toLocaleString("en-IN")}
                        </strong>
                      </div>
                    </div>

                    {patientForm.notes && (
                      <div className="review-notes" style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px dashed var(--border)" }}>
                        <span>Health Notes:</span>
                        <p style={{ margin: "4px 0 0", color: "var(--ink)", fontStyle: "italic" }}>
                          &ldquo;{patientForm.notes}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Payment Method Selector */}
                  <div className="payment-method-section" style={{ marginTop: "20px", marginBottom: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--ink)" }}>
                        Select Payment Option
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--ink-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Lock size={12} style={{ color: "var(--green)" }} /> 256-Bit SSL Encrypted
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
                      {/* Option 1: Razorpay Online Payment */}
                      <div
                        onClick={() => setPaymentMethod("razorpay")}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") setPaymentMethod("razorpay");
                        }}
                        style={{
                          border: paymentMethod === "razorpay" ? "2px solid var(--green)" : "1px solid var(--border)",
                          background: paymentMethod === "razorpay" ? "rgba(24, 66, 50, 0.04)" : "var(--cream)",
                          borderRadius: "14px",
                          padding: "16px",
                          cursor: "pointer",
                          position: "relative",
                          transition: "all 0.2s ease",
                          boxShadow: paymentMethod === "razorpay" ? "0 4px 12px rgba(24, 66, 50, 0.08)" : "none",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(24, 66, 50, 0.1)", display: "grid", placeItems: "center" }}>
                              <CreditCard size={16} style={{ color: "var(--green)" }} />
                            </div>
                            <strong style={{ fontSize: "0.95rem", color: "var(--green)" }}>Pay Online (Razorpay)</strong>
                          </div>
                          <span style={{ fontSize: "0.68rem", background: "var(--gold)", color: "#fff", padding: "2px 8px", borderRadius: "10px", fontWeight: 700, letterSpacing: "0.03em" }}>
                            RECOMMENDED
                          </span>
                        </div>
                        <p style={{ fontSize: "0.8rem", color: "var(--ink-muted)", margin: "0 0 8px", lineHeight: 1.4 }}>
                          Instant slot confirmation via UPI (GPay, PhonePe, Paytm), Debit/Credit Cards &amp; NetBanking.
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.72rem", color: "var(--green)", fontWeight: 600 }}>
                          <ShieldCheck size={14} /> Official Razorpay Checkout
                        </div>
                      </div>

                      {/* Option 2: Pay at Clinic */}
                      <div
                        onClick={() => setPaymentMethod("pay_at_clinic")}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") setPaymentMethod("pay_at_clinic");
                        }}
                        style={{
                          border: paymentMethod === "pay_at_clinic" ? "2px solid var(--green)" : "1px solid var(--border)",
                          background: paymentMethod === "pay_at_clinic" ? "rgba(24, 66, 50, 0.04)" : "var(--cream)",
                          borderRadius: "14px",
                          padding: "16px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          boxShadow: paymentMethod === "pay_at_clinic" ? "0 4px 12px rgba(24, 66, 50, 0.08)" : "none",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                          <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(194, 91, 56, 0.1)", display: "grid", placeItems: "center" }}>
                            <Building2 size={16} style={{ color: "var(--terra)" }} />
                          </div>
                          <strong style={{ fontSize: "0.95rem", color: "var(--ink)" }}>Pay at Hospital</strong>
                        </div>
                        <p style={{ fontSize: "0.8rem", color: "var(--ink-muted)", margin: 0, lineHeight: 1.4 }}>
                          Settle ₹{(selectedDoctor?.consultationFee ?? 500).toLocaleString("en-IN")} at hospital reception desk beside Birla Hospital upon arrival.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="step-actions">
                    <Button
                      variant="ghost"
                      onClick={() => setStep(5)}
                      icon={<ArrowLeft size={16} />}
                      disabled={isSubmitting}
                    >
                      Edit Details
                    </Button>

                    {paymentMethod === "razorpay" ? (
                      <Button
                        variant="gold"
                        onClick={handlePayWithRazorpay}
                        disabled={isSubmitting}
                        isLoading={isSubmitting}
                        icon={<ShieldCheck size={18} />}
                        id="razorpay-pay-btn"
                      >
                        {isSubmitting
                          ? "Connecting to Razorpay..."
                          : `Pay ₹${(selectedDoctor?.consultationFee ?? 500).toLocaleString("en-IN")} via Razorpay`}
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={handleConfirmAppointment}
                        disabled={isSubmitting}
                        isLoading={isSubmitting}
                        icon={<CheckCircle2 size={18} />}
                        id="confirm-booking-btn"
                      >
                        {isSubmitting ? "Confirming..." : "Confirm Booking (Pay at Clinic)"}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Sticky Sidebar */}
            <aside className="mvp-summary-card">
              <h2>Booking Summary</h2>

              <div className="summary-item">
                <span className="summary-label">Treatment</span>
                <strong className="summary-value">{selectedTreatment?.name || "Ayurvedic Consultation"}</strong>
                <small className="summary-sub">{selectedTreatment?.duration || "Standard Duration"}</small>
              </div>

              <div className="summary-item">
                <span className="summary-label">Physician</span>
                <strong className="summary-value">{selectedDoctor?.name || "Senior Vaidya"}</strong>
                <small className="summary-sub">{selectedDoctor?.title || "Ayurvedic Specialist"}</small>
              </div>

              <div className="summary-item">
                <span className="summary-label">Date &amp; Slot</span>
                <strong className="summary-value">
                  {new Date(`${selectedDate}T00:00:00`).toLocaleDateString(
                    "en-IN",
                    { weekday: "short", day: "numeric", month: "short" }
                  )}
                </strong>
                <small className="summary-sub">
                  {selectedTime ? `${selectedTime} hrs` : "Slot pending"}
                </small>
              </div>

              {patientForm.fullName && (
                <div className="summary-item">
                  <span className="summary-label">Patient</span>
                  <strong className="summary-value">{patientForm.fullName}</strong>
                  <small className="summary-sub">{patientForm.phone || "No phone entered"}</small>
                </div>
              )}

              <div className="summary-row total-row">
                <strong>Consultation Fee</strong>
                <strong className="total-amount">
                  ₹{(selectedDoctor?.consultationFee ?? 500).toLocaleString("en-IN")}
                </strong>
              </div>

              <div className="security-notice">
                <ShieldCheck size={16} />
                <span>Charak Ayurveda &bull; Vidyavihar, Pilani</span>
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
