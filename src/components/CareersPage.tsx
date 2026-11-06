"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  MapPin,
  Clock,
  IndianRupee,
  Mail,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import type { JobVacancy } from "@/lib/careersService";

export default function CareersPageClient() {
  const [vacancies, setVacancies] = useState<JobVacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/careers", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (json.ok && Array.isArray(json.data)) {
          setVacancies(
            json.data.map(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (row: any): JobVacancy => ({
                id: row.id,
                title: row.title,
                department: row.department,
                location: row.location,
                type: row.type,
                experience: row.experience,
                description: row.description,
                requirements: row.requirements ?? null,
                salaryRange: row.salary_range ?? row.salaryRange ?? null,
                applyEmail: row.apply_email ?? row.applyEmail ?? null,
                active: row.active,
                displayOrder: row.display_order ?? row.displayOrder ?? 0,
                createdAt: row.created_at ?? row.createdAt,
                updatedAt: row.updated_at ?? row.updatedAt,
              })
            )
          );
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id: string) => setExpanded((prev) => (prev === id ? null : id));

  return (
    <>
      {/* Hero */}
      <section
        style={{
          background: "linear-gradient(135deg, #0f2d1e 0%, #184232 60%, #22543d 100%)",
          padding: "80px 0 60px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: "680px", margin: "0 auto", textAlign: "center", color: "#fff" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(197,160,89,0.18)",
                border: "1px solid rgba(197,160,89,0.4)",
                color: "#e8c97e",
                fontSize: "0.78rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                padding: "5px 14px",
                borderRadius: "999px",
                marginBottom: "18px",
              }}
            >
              <Sparkles size={13} />
              <span>Join Our Team</span>
            </div>
            <h1
              style={{
                fontFamily: "var(--font-heading, Playfair Display, serif)",
                fontSize: "clamp(2rem, 4vw, 2.8rem)",
                fontWeight: 700,
                lineHeight: 1.2,
                color: "#fff",
                marginBottom: "16px",
              }}
            >
              Careers at Charak Ayurveda
            </h1>
            <p
              style={{
                fontSize: "1.05rem",
                color: "rgba(255,255,255,0.78)",
                lineHeight: 1.6,
                marginBottom: 0,
              }}
            >
              Be part of a mission-driven team healing lives through authentic Ayurveda at our
              Pilani hospital campus. We are always looking for passionate doctors, therapists, and
              staff.
            </p>
          </div>
        </div>
      </section>

      {/* Vacancies */}
      <section style={{ padding: "60px 0 80px", background: "#fdfbf7" }}>
        <div className="wrap" style={{ maxWidth: "820px" }}>
          {loading && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}>
              Loading vacancies…
            </div>
          )}

          {!loading && vacancies.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "64px 32px",
                background: "linear-gradient(145deg, #ffffff 0%, var(--cream-card, #fbf8f3) 100%)",
                border: "1.5px solid #e7dfd3",
                borderRadius: "24px",
                boxShadow: "0 10px 32px rgba(24, 66, 50, 0.04)",
                maxWidth: "760px",
                margin: "0 auto",
              }}
            >
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  background: "rgba(24, 66, 50, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  color: "var(--green, #184232)",
                }}
              >
                <Briefcase size={34} />
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(194, 139, 56, 0.12)",
                  color: "var(--gold-dark, #a87932)",
                  padding: "5px 14px",
                  borderRadius: "999px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  marginBottom: "14px",
                }}
              >
                <Sparkles size={13} />
                <span>Future Healthcare Talent Pool</span>
              </div>

              <h2
                style={{
                  fontSize: "1.75rem",
                  color: "var(--green, #184232)",
                  marginBottom: "12px",
                  fontWeight: 700,
                }}
              >
                No Open Vacancies Currently Listed
              </h2>

              <p
                style={{
                  color: "var(--ink-light, #5c6861)",
                  fontSize: "1.02rem",
                  maxWidth: "540px",
                  margin: "0 auto 28px",
                  lineHeight: "1.65",
                }}
              >
                All hospital positions at Charak Ayurveda are currently filled. However, we are continuously expanding our clinical and Panchakarma teams. If you are a qualified Ayurvedic Vaidya, Therapist, Staff Nurse, Pharmacist, or Hospital Support Staff, we warmly invite your profile for future roles.
              </p>

              {/* Roles we regularly hire for */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "16px",
                  padding: "18px 20px",
                  border: "1px solid #e7dfd3",
                  maxWidth: "580px",
                  margin: "0 auto 30px",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--gold-dark, #a87932)",
                    marginBottom: "10px",
                  }}
                >
                  Roles We Regularly Consider For Upcoming Openings:
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  {[
                    "Ayurvedic Consultant (Vaidya)",
                    "Ayurvedic Pharmacist",
                    "Panchakarma Therapist",
                    "Nursing Staff",
                    "MTS / Attendant",
                    "Front Desk / Receptionist",
                    "Security Guard",
                    "Hospital Satvik Cook",
                  ].map((role) => (
                    <span
                      key={role}
                      style={{
                        padding: "5px 11px",
                        background: "var(--cream, #f7f4ee)",
                        borderRadius: "8px",
                        fontSize: "0.82rem",
                        color: "var(--green, #184232)",
                        fontWeight: 600,
                        border: "1px solid #ebe4da",
                      }}
                    >
                      ✓ {role}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <a
                  href="mailto:careers@charakayurvedapilani.com?subject=Profile Submission for Future Hospital Opportunities - Charak Ayurveda"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "var(--green, #184232)",
                    color: "#ffffff",
                    padding: "12px 24px",
                    borderRadius: "999px",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    textDecoration: "none",
                    boxShadow: "0 4px 14px rgba(24, 66, 50, 0.2)",
                  }}
                >
                  <Mail size={16} />
                  Send Your Resume / CV
                </a>
                <a
                  href="https://wa.me/918852887717?text=Hello%20Charak%20Ayurveda,%20I%20am%20interested%20in%20career%20opportunities%20at%20your%20hospital%20and%20would%20like%20to%20submit%20my%20details."
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "#25D366",
                    color: "#ffffff",
                    padding: "12px 24px",
                    borderRadius: "999px",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    textDecoration: "none",
                  }}
                >
                  <MessageCircle size={16} />
                  WhatsApp HR Desk
                </a>
              </div>
            </div>
          )}

          {!loading && vacancies.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {vacancies.map((v) => {
                const isOpen = expanded === v.id;
                return (
                  <div
                    key={v.id}
                    style={{
                      background: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "14px",
                      overflow: "hidden",
                      boxShadow: isOpen
                        ? "0 4px 20px rgba(15,23,42,0.08)"
                        : "0 2px 8px rgba(15,23,42,0.04)",
                      transition: "box-shadow 0.2s ease",
                    }}
                  >
                    {/* Card header – always visible */}
                    <button
                      type="button"
                      onClick={() => toggle(v.id)}
                      style={{
                        width: "100%",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "22px 24px",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: "16px",
                      }}
                      aria-expanded={isOpen}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px",
                            marginBottom: "10px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.74rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              color: "#184232",
                              background: "#f0f7f3",
                              padding: "3px 10px",
                              borderRadius: "999px",
                              border: "1px solid #c8e0d3",
                            }}
                          >
                            {v.department}
                          </span>
                          <span
                            style={{
                              fontSize: "0.74rem",
                              fontWeight: 600,
                              color: "#64748b",
                              background: "#f8fafc",
                              padding: "3px 10px",
                              borderRadius: "999px",
                              border: "1px solid #e2e8f0",
                            }}
                          >
                            {v.type}
                          </span>
                        </div>

                        <h2
                          style={{
                            fontFamily: "var(--font-heading, Playfair Display, serif)",
                            fontSize: "1.18rem",
                            fontWeight: 700,
                            color: "#0f172a",
                            margin: "0 0 10px",
                            lineHeight: 1.3,
                          }}
                        >
                          {v.title}
                        </h2>

                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "14px",
                            fontSize: "0.85rem",
                            color: "#64748b",
                          }}
                        >
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                            <MapPin size={13} /> {v.location}
                          </span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                            <Layers size={13} /> {v.experience}
                          </span>
                          {v.salaryRange && (
                            <span
                              style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
                            >
                              <IndianRupee size={13} /> {v.salaryRange}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ flexShrink: 0, color: "#184232", marginTop: "4px" }}>
                        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </button>

                    {/* Expandable details */}
                    {isOpen && (
                      <div
                        style={{
                          borderTop: "1px solid #f1f5f9",
                          padding: "20px 24px 24px",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "0.95rem",
                            color: "#334155",
                            lineHeight: 1.65,
                            marginBottom: v.requirements ? "20px" : "24px",
                          }}
                        >
                          {v.description}
                        </p>

                        {v.requirements && (
                          <div style={{ marginBottom: "24px" }}>
                            <h3
                              style={{
                                fontSize: "0.9rem",
                                fontWeight: 700,
                                color: "#0f172a",
                                marginBottom: "10px",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                              }}
                            >
                              Requirements
                            </h3>
                            <div
                              style={{
                                fontSize: "0.9rem",
                                color: "#475569",
                                lineHeight: 1.7,
                                whiteSpace: "pre-line",
                              }}
                            >
                              {v.requirements}
                            </div>
                          </div>
                        )}

                        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                          <a
                            href={`mailto:${v.applyEmail || "careers@charakayurvedapilani.com"}?subject=Application for ${encodeURIComponent(v.title)}`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px",
                              background: "#184232",
                              color: "#fff",
                              padding: "10px 22px",
                              borderRadius: "8px",
                              fontWeight: 600,
                              fontSize: "0.9rem",
                              textDecoration: "none",
                            }}
                          >
                            <Mail size={14} />
                            Apply via Email
                          </a>
                          <a
                            href={`https://wa.me/918852887717?text=${encodeURIComponent(
                              `Hello Charak Ayurveda, I would like to apply for the position of "${v.title}" in the ${v.department} Department (${v.location}, ${v.type}). Please let me know the hiring process and where to submit my CV.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px",
                              background: "#25d366",
                              color: "#fff",
                              padding: "10px 22px",
                              borderRadius: "8px",
                              fontWeight: 600,
                              fontSize: "0.9rem",
                              textDecoration: "none",
                            }}
                          >
                            <MessageCircle size={15} />
                            Apply via WhatsApp
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* General application nudge */}
          {!loading && (
            <div
              style={{
                marginTop: "40px",
                background: "linear-gradient(135deg, #f0f7f3, #e8f4ee)",
                border: "1px solid #c8e0d3",
                borderRadius: "14px",
                padding: "28px 28px",
                textAlign: "center",
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-heading, Playfair Display, serif)",
                  fontSize: "1.15rem",
                  color: "#184232",
                  marginBottom: "8px",
                }}
              >
                Don&apos;t see a suitable role?
              </h3>
              <p style={{ color: "#475569", fontSize: "0.92rem", marginBottom: "16px" }}>
                Send us your CV anyway — we&apos;re always keen to meet passionate people who share
                our vision for holistic Ayurvedic healing.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <a
                  href="mailto:careers@charakayurvedapilani.com"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "#184232",
                    color: "#fff",
                    padding: "10px 22px",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    textDecoration: "none",
                  }}
                >
                  <Mail size={14} />
                  Email CV
                </a>
                <a
                  href={`https://wa.me/918852887717?text=${encodeURIComponent(
                    "Hello Charak Ayurveda, I am interested in career opportunities at your hospital. I would like to submit my profile and CV."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "#25d366",
                    color: "#fff",
                    padding: "10px 22px",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    textDecoration: "none",
                  }}
                >
                  <MessageCircle size={15} />
                  WhatsApp for Careers
                </a>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
