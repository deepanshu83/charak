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
} from "lucide-react";
import type { JobVacancy } from "@/lib/careersService";

export default function CareersPageClient() {
  const [vacancies, setVacancies] = useState<JobVacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/careers")
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
                salaryRange: row.salary_range ?? null,
                applyEmail: row.apply_email ?? null,
                active: row.active,
                displayOrder: row.display_order ?? 0,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
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
                padding: "60px 24px",
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
              }}
            >
              <Briefcase size={40} style={{ color: "#cbd5e1", marginBottom: "16px" }} />
              <h2 style={{ fontSize: "1.3rem", color: "#1e293b", marginBottom: "10px" }}>
                No openings at the moment
              </h2>
              <p style={{ color: "#64748b", marginBottom: "20px" }}>
                We don&apos;t have any active listings right now, but we&apos;re always keen to meet
                talented people.
              </p>
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
                  fontSize: "0.95rem",
                  textDecoration: "none",
                }}
              >
                <Mail size={15} />
                Send us your CV
              </a>
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
                            href={`https://wa.me/918852887717?text=${encodeURIComponent(`Hi, I would like to apply for the position of ${v.title} at Charak Ayurveda.`)}`}
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
                            <Clock size={14} />
                            WhatsApp Us
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
                careers@charakayurvedapilani.com
              </a>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
