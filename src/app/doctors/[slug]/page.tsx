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
      <main style={{ minHeight: "80vh", paddingTop: "20px" }}>
        {/* Breadcrumb Header */}
        <section style={{ padding: "40px 0 20px" }}>
          <div className="wrap">
            <Link
              href="/doctors"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.88rem",
                color: "var(--terra)",
                fontWeight: 500,
                marginBottom: "16px",
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
              <span style={{ fontSize: "0.85rem", color: "var(--ink-muted)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <MapPin size={13} /> {doctor.location}
              </span>
            </div>
          </div>
        </section>

        {/* Doctor Detail Section */}
        <section style={{ padding: "30px 0 80px" }}>
          <div className="wrap split-grid">
            {/* Doctor Photo */}
            <div>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "460px",
                  borderRadius: "24px",
                  overflow: "hidden",
                  boxShadow: "var(--shadow-md)",
                  border: "1px solid var(--border)",
                  background: "rgba(24, 66, 50, 0.04)",
                }}
              >
                {doctor.image ? (
                  <Image
                    src={doctor.image}
                    alt={`${doctor.name} - ${doctor.title}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    style={{ objectFit: "cover" }}
                    priority
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
                    <UserCheck size={80} style={{ opacity: 0.3 }} />
                  </div>
                )}
              </div>

              {/* Consultation Card */}
              <div
                style={{
                  background: "var(--cream-card)",
                  borderRadius: "18px",
                  border: "1px solid var(--border)",
                  padding: "24px",
                  marginTop: "24px",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <span style={{ fontSize: "0.9rem", color: "var(--ink-light)" }}>Consultation Fee:</span>
                  <strong style={{ fontSize: "1.4rem", color: "var(--green)" }}>
                    ₹{(doctor.consultationFee ?? 1200).toLocaleString("en-IN")}
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
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--green)", fontWeight: 600 }}>
                        <Calendar size={14} color="var(--gold)" />
                        <span>Availability: <b style={{ color: "var(--green)" }}>{doctor.availability}</b></span>
                      </div>
                    )}
                    {doctor.timings && (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--ink-light)" }}>
                        <Clock size={14} color="var(--gold)" />
                        <span>Timings: <b>{doctor.timings}</b></span>
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
                  }}
                >
                  <Calendar size={16} />
                  <span>Book Appointment with {doctor.name ? doctor.name.split(" ")[0] : "Doctor"}</span>
                </Link>
              </div>
            </div>

            {/* Doctor Info */}
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
                  marginBottom: "12px",
                }}
              >
                <Stethoscope size={15} />
                <span>{doctor.designation || doctor.title}</span>
              </div>

              <h1 style={{ fontSize: "clamp(2.2rem, 4vw, 3rem)", marginBottom: "8px", color: "var(--green)" }}>
                {doctor.name}
              </h1>

              <p style={{ color: "var(--terra)", fontWeight: 500, fontSize: "1.1rem", marginBottom: "20px" }}>
                {doctor.qualifications} • {doctor.experience}
              </p>

              {doctor.bio && (
                <div style={{ marginBottom: "24px" }}>
                  <p style={{ color: "var(--ink)", fontSize: "1.05rem", lineHeight: 1.7 }}>
                    {doctor.bio}
                  </p>
                </div>
              )}

              {doctor.detailedBio && doctor.detailedBio !== doctor.bio && (
                <div
                  style={{
                    marginBottom: "32px",
                    paddingTop: "20px",
                    borderTop: "1px solid rgba(24, 66, 50, 0.08)",
                  }}
                >
                  <h3 style={{ fontSize: "1.2rem", marginBottom: "12px", color: "var(--green)" }}>
                    Clinical Expertise &amp; Background
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {doctor.detailedBio.split("\n\n").map((para, i) => (
                      <p key={i} style={{ color: "var(--ink-light)", fontSize: "1rem", lineHeight: 1.7 }}>
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Assurances */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "16px",
                  marginTop: "28px",
                  padding: "20px",
                  background: "var(--cream-card)",
                  borderRadius: "16px",
                  border: "1px solid var(--border)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <ShieldCheck size={22} color="var(--gold)" />
                  <div>
                    <strong style={{ display: "block", fontSize: "0.9rem" }}>Classical Diagnosis</strong>
                    <span style={{ fontSize: "0.8rem", color: "var(--ink-muted)" }}>Nadi Pariksha &amp; Prakriti</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Award size={22} color="var(--gold)" />
                  <div>
                    <strong style={{ display: "block", fontSize: "0.9rem" }}>Verified Credentials</strong>
                    <span style={{ fontSize: "0.8rem", color: "var(--ink-muted)" }}>Licensed BAMS / MD</span>
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
