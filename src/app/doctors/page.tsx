import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBar from "@/components/MobileBar";
import { fetchDoctors } from "@/lib/doctorService";
import {
  Stethoscope,
  Calendar,
  Clock,
  ArrowRight,
  UserCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Ayurvedic Doctors & Physicians | Charak Ayurveda Pilani",
  description:
    "Meet our senior Ayurvedic physicians and Panchakarma specialists at Charak Ayurveda, Pilani. Book personalized consultations and Nadi Pariksha.",
  alternates: {
    canonical: "https://charakayurvedapilani.com/doctors",
  },
};

export default async function DoctorsPage() {
  const doctors = await fetchDoctors();

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "80vh", paddingTop: "20px" }}>
        {/* Page Hero Banner */}
        <section style={{ padding: "60px 0 30px" }}>
          <div className="wrap">
            <div className="head">
              <span className="tag">Expert Medical Leadership</span>
              <h1>Our Ayurvedic Physicians</h1>
              <p>
                Dedicated to restoring vibrant health through classical Vedic pulse diagnosis, compassionate clinical care, and time-tested natural healing protocols.
              </p>
            </div>
          </div>
        </section>

        {/* Doctors Directory Grid */}
        <section style={{ padding: "40px 0 80px" }}>
          <div className="wrap">
            {doctors.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  background: "var(--cream-card)",
                  borderRadius: "20px",
                  border: "1px dashed var(--border)",
                  maxWidth: "540px",
                  margin: "0 auto",
                }}
              >
                <Stethoscope size={48} color="var(--gold)" style={{ margin: "0 auto 16px", opacity: 0.8 }} />
                <h3 style={{ fontSize: "1.3rem", marginBottom: "8px", color: "var(--green)" }}>
                  No doctors added yet.
                </h3>
                <p style={{ color: "var(--ink-light)", fontSize: "0.95rem", lineHeight: 1.6 }}>
                  Our physician profiles will be listed here shortly. You can still reach us directly for clinic enquiries.
                </p>
                <div style={{ marginTop: "24px" }}>
                  <Link href="/appointment" className="btn gold sm">
                    Book General Consultation
                  </Link>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                  gap: "32px",
                }}
              >
                {doctors.map((doctor) => {
                  const profileSlug = doctor.slug || doctor.id;

                  return (
                    <div
                      key={doctor.id}
                      style={{
                        background: "var(--cream-card)",
                        borderRadius: "20px",
                        border: "1px solid var(--border)",
                        boxShadow: "var(--shadow-sm)",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      }}
                    >
                      {/* Doctor Image */}
                      <div
                        style={{
                          position: "relative",
                          width: "100%",
                          height: "260px",
                          background: "rgba(24, 66, 50, 0.05)",
                        }}
                      >
                        {doctor.image ? (
                          <Image
                            src={doctor.image}
                            alt={`${doctor.name} - ${doctor.title}`}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            style={{ objectFit: "cover" }}
                            loading="lazy"
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "var(--green)",
                            }}
                          >
                            <UserCheck size={56} style={{ opacity: 0.4 }} />
                          </div>
                        )}
                      </div>

                      {/* Doctor Content */}
                      <div
                        style={{
                          padding: "24px",
                          display: "flex",
                          flexDirection: "column",
                          flexGrow: 1,
                        }}
                      >
                        <span
                          style={{
                            background: "rgba(194, 139, 56, 0.12)",
                            color: "var(--gold-hover)",
                            padding: "4px 12px",
                            borderRadius: "20px",
                            fontSize: "0.76rem",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.8px",
                            alignSelf: "flex-start",
                            marginBottom: "10px",
                          }}
                        >
                          {doctor.specialization || doctor.title}
                        </span>

                        <h2
                          style={{
                            fontSize: "1.35rem",
                            marginBottom: "6px",
                            color: "var(--green)",
                          }}
                        >
                          {doctor.name}
                        </h2>

                        <p
                          style={{
                            fontSize: "0.88rem",
                            color: "var(--terra)",
                            fontWeight: 500,
                            marginBottom: "12px",
                          }}
                        >
                          {doctor.qualifications} • {doctor.experience}
                        </p>

                        {doctor.bio && (
                          <p
                            style={{
                              fontSize: "0.92rem",
                              color: "var(--ink-light)",
                              lineHeight: 1.6,
                              marginBottom: "16px",
                              flexGrow: 1,
                            }}
                          >
                            {doctor.bio}
                          </p>
                        )}

                        {/* Availability & Timings */}
                        {(doctor.availability || doctor.timings) && (
                          <div
                            style={{
                              background: "rgba(24, 66, 50, 0.05)",
                              borderRadius: "12px",
                              padding: "10px 14px",
                              marginBottom: "16px",
                              fontSize: "0.82rem",
                              display: "flex",
                              flexDirection: "column",
                              gap: "5px",
                              border: "1px solid rgba(24, 66, 50, 0.08)",
                            }}
                          >
                            {doctor.availability && (
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--green)", fontWeight: 600 }}>
                                <Calendar size={13} color="var(--gold)" />
                                <span>Availability: <b style={{ color: "var(--green)" }}>{doctor.availability}</b></span>
                              </div>
                            )}
                            {doctor.timings && (
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--ink-light)" }}>
                                <Clock size={13} color="var(--gold)" />
                                <span>Timings: <b>{doctor.timings}</b></span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "10px",
                            paddingTop: "16px",
                            borderTop: "1px solid rgba(24, 66, 50, 0.08)",
                            marginTop: "auto",
                          }}
                        >
                          <Link
                            href={`/doctors/${profileSlug}`}
                            style={{
                              fontSize: "0.88rem",
                              fontWeight: 600,
                              color: "var(--green)",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <span>View Profile</span>
                            <ArrowRight size={14} />
                          </Link>

                          <Link
                            href={`/appointment?doctor=${doctor.id}`}
                            className="btn gold sm"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "7px 14px",
                              fontSize: "0.84rem",
                            }}
                          >
                            <Calendar size={13} />
                            <span>Book Consultation</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <MobileBar />
    </>
  );
}
