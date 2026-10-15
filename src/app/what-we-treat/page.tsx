import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBar from "@/components/MobileBar";
import { ArrowRight, CheckCircle2, Calendar } from "lucide-react";

import { treatmentCategories } from "@/data/site";

export const metadata: Metadata = {
  title: "Services & Clinical Specialities | Charak Ayurvedic Chikitsalya, Pilani",
  description:
    "Explore authentic Ayurvedic services: Therapies, Body Pain & Spine, Skin, Women's Health, Stomach & Digestion, and Stress & Lifestyle at Charak Ayurveda Pilani.",
  alternates: {
    canonical: "https://charakayurvedapilani.com/what-we-treat",
  },
  openGraph: {
    title: "Services | Charak Ayurvedic Chikitsalya, Pilani",
    description:
      "Comprehensive classical Ayurvedic treatments and therapies in Pilani, Rajasthan.",
    url: "https://charakayurvedapilani.com/what-we-treat",
    images: [{ url: "/images/panchkaram.jpeg", alt: "Ayurvedic Treatments Charak" }],
  },
};

export default function WhatWeTreatPage() {
  const categories = treatmentCategories;

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "80vh", paddingTop: "20px" }}>
        {/* Page Hero Banner */}
        <section style={{ padding: "60px 0 30px" }}>
          <div className="wrap">
            <div className="head">
              <span className="tag">Charak Ayurvedic Chikitsalya, Pilani</span>
              <h1>Our Services &amp; Treatments</h1>
              <p>
                Comprehensive classical Ayurvedic care diagnosing the root imbalances of Doshas, Dhatus, and Agni to bring lasting healing to your body and mind.
              </p>
            </div>
          </div>
        </section>

        {/* Treatment Details */}
        <section style={{ padding: "40px 0 80px" }}>
          <div className="wrap">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "28px" }}>
              {categories.map((cat, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "var(--cream-card)",
                    borderRadius: "18px",
                    padding: "32px 28px",
                    border: "1px solid var(--border)",
                    boxShadow: "var(--shadow-sm)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: "1.45rem", color: "var(--green)", marginBottom: "10px" }}>
                      {cat.title}
                    </h3>
                    <p style={{ color: "var(--ink-light)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "18px" }}>
                      {cat.summary}
                    </p>

                    <div style={{ marginBottom: "16px" }}>
                      <div style={{ fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--gold)", fontWeight: 600, marginBottom: "8px" }}>
                        Common Conditions Addressed:
                      </div>
                      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "6px" }}>
                        {cat.conditions.map((cond, i) => (
                          <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "0.9rem", color: "var(--ink)" }}>
                            <CheckCircle2 size={16} color="var(--gold)" style={{ flexShrink: 0, marginTop: "3px" }} />
                            <span>{cond}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid rgba(24, 66, 50, 0.08)", paddingTop: "16px", marginTop: "16px" }}>
                    <div style={{ fontSize: "0.82rem", color: "var(--ink-muted)", marginBottom: "12px" }}>
                      <b>Therapies:</b> {cat.treatments}
                    </div>
                    <Link
                      href="/appointment"
                      className="treatment-card-btn"
                      style={{ display: "inline-flex" }}
                    >
                      <span>Book Consultation for this condition</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom CTA Card */}
            <div
              style={{
                marginTop: "60px",
                background: "var(--deep)",
                color: "#ffffff",
                padding: "40px",
                borderRadius: "24px",
                textAlign: "center",
                backgroundImage: "radial-gradient(circle at 80% 20%, rgba(194, 139, 56, 0.25), transparent 45%)",
              }}
            >
              <h2 style={{ color: "#ffffff", fontSize: "2.2rem", marginBottom: "12px" }}>
                Unsure Which Treatment You Need?
              </h2>
              <p style={{ color: "#cfc9bb", maxWidth: "620px", margin: "0 auto 24px", fontSize: "1.05rem" }}>
                Schedule a 1-on-1 Nadi Pariksha consultation with our Ayurvedic doctor. We will assess your pulse and design a customized recovery roadmap.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
                <Link href="/appointment" className="btn gold">
                  <Calendar size={18} />
                  Book Doctor Consultation
                </Link>
                <a href="tel:+918852887717" className="btn ghost" style={{ color: "#ffffff", borderColor: "rgba(255, 255, 255, 0.4)" }}>
                  Call: 088528 87717
                </a>
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
