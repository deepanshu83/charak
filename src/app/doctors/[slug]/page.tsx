import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBar from "@/components/MobileBar";
import { fetchDoctorBySlug, fetchDoctors } from "@/lib/doctorService";
import {
  Stethoscope,
  Calendar,
  Clock,
  ArrowLeft,
  UserCheck,
  MapPin,
  ShieldCheck,
  Award,
} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;

export async function generateStaticParams() {
  const doctors = await fetchDoctors().catch(() => []);
  return doctors.map((doc) => ({
    slug: doc.slug || doc.id,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doctor = await fetchDoctorBySlug(slug);

  if (!doctor) {
    return {
      title: "Doctor Not Found | Charak Ayurveda Pilani",
    };
  }

  return {
    title: `${doctor.name} - ${doctor.title} | Charak Ayurveda Pilani`,
    description: doctor.bio || `${doctor.name}, ${doctor.title} at Charak Ayurveda Pilani. Expert in classical Ayurvedic treatments.`,
    alternates: {
      canonical: `https://charakayurvedapilani.com/doctors/${slug}`,
    },
    openGraph: {
      title: `${doctor.name} | Charak Ayurveda Pilani`,
      description: doctor.bio || `${doctor.name}, ${doctor.title}`,
      url: `https://charakayurvedapilani.com/doctors/${slug}`,
      images: doctor.image ? [{ url: doctor.image, alt: doctor.name }] : [],
    },
  };
}

export default async function DoctorDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const doctor = await fetchDoctorBySlug(slug);

  if (!doctor) {
    notFound();
  }

  const physicianJsonLd = {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: doctor.name,
    medicalSpecialty: [doctor.specialization || "Ayurvedic Medicine"],
    hospitalAffiliation: {
      "@type": "MedicalBusiness",
      name: "Charak Ayurveda",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Birla Hospital Road, Vidyavihar",
        addressLocality: "Pilani",
        addressRegion: "Rajasthan",
        postalCode: "333031",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(physicianJsonLd) }}
      />
      <Navbar />
      <style>{`
        .doctor-profile-grid {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 36px;
          align-items: start;
        }
        .doctor-photo-card {
          width: 100%;
          max-width: 320px;
          height: 320px;
          border-radius: 20px;
          background: #ffffff;
          border: 1px solid rgba(24, 66, 50, 0.12);
          overflow: hidden;
          position: relative;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 14px;
          margin: 0 auto;
        }
        .doctor-photo-container {
          position: relative;
          width: 100%;
          height: 100%;
        }
        @media (max-width: 880px) {
          .doctor-profile-grid {
            grid-template-columns: 1fr;
            gap: 28px;
          }
          .doctor-photo-card {
            max-width: 280px;
            height: 290px;
          }
        }
      `}</style>
      <main style={{ minHeight: "80vh", paddingTop: "20px" }}>
        {/* Breadcrumb Header */}
        <section style={{ padding: "30px 0 16px" }}>
          <div className="wrap">
            <Link
              href="/doctors"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.88rem",
                color: "var(--terra)",
                fontWeight: 600,
                marginBottom: "14px",
                textDecoration: "none",
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to All Physicians</span>
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span
                style={{
                  background: "rgba(194, 139, 56, 0.15)",
                  color: "var(--gold-hover)",
                  padding: "4px 14px",
                  borderRadius: "20px",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                }}
              >
                {doctor.specialization || doctor.title}
              </span>
              <span
                style={{
                  fontSize: "0.85rem",
                  color: "var(--ink-muted)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <MapPin size={13} /> {doctor.location || "Pilani, Rajasthan"}
              </span>
            </div>
          </div>
        </section>

        {/* Doctor Detail Section */}
        <section style={{ padding: "16px 0 80px" }}>
          <div className="wrap">
            <div className="doctor-profile-grid">
              {/* Left Column: Photo & Booking Card */}
              <div>
                <div className="doctor-photo-card">
                  {doctor.image ? (
                    <div className="doctor-photo-container">
                      <Image
                        src={doctor.image}
                        alt={`${doctor.name} - ${doctor.title}`}
                        fill
                        sizes="(max-width: 880px) 280px, 320px"
                        style={{ objectFit: "contain" }}
                        priority
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--green)",
                        gap: "8px",
                      }}
                    >
                      <UserCheck size={64} style={{ opacity: 0.35 }} />
                      <span style={{ fontSize: "0.85rem", color: "var(--ink-muted)" }}>
                        Charak Ayurveda Vaidya
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "center", marginTop: "12px" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "0.78rem",
                      color: "#166534",
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontWeight: 600,
                    }}
                  >
                    <span
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        background: "#16a34a",
                        display: "inline-block",
                      }}
                    />
                    Accepting In-Clinic Patients
                  </span>
                </div>

                {/* Consultation Card */}
                <div
                  style={{
                    background: "var(--cream-card)",
                    borderRadius: "18px",
                    border: "1px solid var(--border)",
                    padding: "22px",
                    marginTop: "16px",
                    boxShadow: "var(--shadow-sm)",
                    maxWidth: "340px",
                    margin: "16px auto 0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "14px",
                      borderBottom: "1px solid rgba(24, 66, 50, 0.08)",
                      paddingBottom: "12px",
                    }}
                  >
                    <span style={{ fontSize: "0.88rem", color: "var(--ink-light)" }}>
                      Consultation Fee:
                    </span>
                    <strong style={{ fontSize: "1.35rem", color: "var(--green)" }}>
                      ₹{(doctor.consultationFee ?? 500).toLocaleString("en-IN")}
                    </strong>
                  </div>

                  {(doctor.availability || doctor.timings) && (
                    <div
                      style={{
                        background: "rgba(24, 66, 50, 0.05)",
                        borderRadius: "12px",
                        padding: "12px 14px",
                        marginBottom: "16px",
                        fontSize: "0.85rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        border: "1px solid rgba(24, 66, 50, 0.08)",
                      }}
                    >
                      {doctor.availability && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            color: "var(--green)",
                            fontWeight: 600,
                          }}
                        >
                          <Calendar size={14} color="var(--gold)" />
                          <span>
                            Availability:{" "}
                            <b style={{ color: "var(--green)" }}>{doctor.availability}</b>
                          </span>
                        </div>
                      )}
                      {doctor.timings && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            color: "var(--ink-light)",
                          }}
                        >
                          <Clock size={14} color="var(--gold)" />
                          <span>
                            Timings: <b>{doctor.timings}</b>
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <Link
                    href={`/appointment?doctor=${doctor.id}`}
                    className="btn gold"
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "8px",
                      padding: "12px",
                      borderRadius: "10px",
                      fontSize: "0.92rem",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    <Calendar size={16} />
                    <span>
                      Book Appointment with {doctor.name ? doctor.name.split(" ")[0] : "Doctor"}
                    </span>
                  </Link>

                  <div
                    style={{
                      marginTop: "12px",
                      textAlign: "center",
                      fontSize: "0.76rem",
                      color: "var(--ink-muted)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "5px",
                    }}
                  >
                    <ShieldCheck size={13} color="var(--gold)" />
                    <span>Instant confirmation • In-Clinic Consultation</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Doctor Info */}
              <div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(24, 66, 50, 0.08)",
                    padding: "5px 14px",
                    borderRadius: "20px",
                    fontSize: "0.82rem",
                    color: "var(--green)",
                    fontWeight: 600,
                    marginBottom: "10px",
                  }}
                >
                  <Stethoscope size={15} />
                  <span>{doctor.designation || doctor.title}</span>
                </div>

                <h1
                  style={{
                    fontFamily: "var(--font-heading, Playfair Display, serif)",
                    fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
                    marginBottom: "6px",
                    color: "var(--green)",
                    lineHeight: 1.2,
                  }}
                >
                  {doctor.name}
                </h1>

                <p
                  style={{
                    color: "var(--terra)",
                    fontWeight: 600,
                    fontSize: "1.08rem",
                    marginBottom: "20px",
                  }}
                >
                  {doctor.qualifications} {doctor.experience ? `• ${doctor.experience}` : ""}
                </p>

                {/* Quick Highlights Row */}
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginBottom: "24px",
                  }}
                >
                  <span
                    style={{
                      background: "#f8f9fa",
                      border: "1px solid #e2e8f0",
                      padding: "6px 14px",
                      borderRadius: "8px",
                      fontSize: "0.82rem",
                      color: "#334155",
                      fontWeight: 500,
                    }}
                  >
                    🌿 Nadi Pariksha &amp; Dosha Diagnosis
                  </span>
                  <span
                    style={{
                      background: "#f8f9fa",
                      border: "1px solid #e2e8f0",
                      padding: "6px 14px",
                      borderRadius: "8px",
                      fontSize: "0.82rem",
                      color: "#334155",
                      fontWeight: 500,
                    }}
                  >
                    🩺 Classical Ayurvedic Protocols
                  </span>
                  <span
                    style={{
                      background: "#f8f9fa",
                      border: "1px solid #e2e8f0",
                      padding: "6px 14px",
                      borderRadius: "8px",
                      fontSize: "0.82rem",
                      color: "#334155",
                      fontWeight: 500,
                    }}
                  >
                    📍 In-Clinic Consultation (Pilani)
                  </span>
                </div>

                {doctor.bio && (
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1px solid rgba(24, 66, 50, 0.08)",
                      borderRadius: "16px",
                      padding: "22px 24px",
                      marginBottom: "24px",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "1.1rem",
                        marginBottom: "10px",
                        color: "var(--green)",
                        fontFamily: "var(--font-heading, Playfair Display, serif)",
                      }}
                    >
                      About the Vaidya
                    </h3>
                    <p style={{ color: "var(--ink)", fontSize: "1rem", lineHeight: 1.75, margin: 0 }}>
                      {doctor.bio}
                    </p>
                  </div>
                )}

                {doctor.detailedBio && doctor.detailedBio !== doctor.bio && (
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1px solid rgba(24, 66, 50, 0.08)",
                      borderRadius: "16px",
                      padding: "22px 24px",
                      marginBottom: "28px",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "1.15rem",
                        marginBottom: "12px",
                        color: "var(--green)",
                        fontFamily: "var(--font-heading, Playfair Display, serif)",
                      }}
                    >
                      Clinical Expertise &amp; Care Protocols
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {doctor.detailedBio.split("\n\n").map((para, i) => (
                        <p
                          key={i}
                          style={{
                            color: "var(--ink-light)",
                            fontSize: "0.96rem",
                            lineHeight: 1.75,
                            margin: 0,
                          }}
                        >
                          {para}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assurances & Credentials */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "16px",
                    marginTop: "20px",
                    padding: "18px 20px",
                    background: "var(--cream-card)",
                    borderRadius: "16px",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <ShieldCheck size={24} color="var(--gold)" />
                    <div>
                      <strong style={{ display: "block", fontSize: "0.92rem", color: "var(--green)" }}>
                        Classical Diagnosis
                      </strong>
                      <span style={{ fontSize: "0.8rem", color: "var(--ink-muted)" }}>
                        Nadi Pariksha &amp; Prakriti Imbalance
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Award size={24} color="var(--gold)" />
                    <div>
                      <strong style={{ display: "block", fontSize: "0.92rem", color: "var(--green)" }}>
                        Verified Credentials
                      </strong>
                      <span style={{ fontSize: "0.8rem", color: "var(--ink-muted)" }}>
                        State Council Registered BAMS / MD
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <MobileBar />
    </>
  );
}
