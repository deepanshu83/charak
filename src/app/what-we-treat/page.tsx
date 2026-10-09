import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBar from "@/components/MobileBar";
import { Sparkles, ArrowRight, CheckCircle2, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "What We Treat | Charak Ayurveda Pilani",
  description:
    "Comprehensive classical Ayurvedic treatments for chronic skin conditions, joint disorders, Panchakarma detox, and fertility care in Pilani, Rajasthan.",
  alternates: {
    canonical: "https://charakayurvedapilani.com/treatments",
  },
  openGraph: {
    title: "Classical Ayurvedic Treatments | Charak Ayurveda Pilani",
    description:
      "Comprehensive Ayurvedic therapies for skin, joint care, Panchakarma detox, and fertility in Pilani, Rajasthan.",
    url: "https://charakayurvedapilani.com/treatments",
    images: [{ url: "/images/panchkaram.jpeg", alt: "Ayurvedic Treatments Charak" }],
  },
};

export default function WhatWeTreatPage() {
  const categories = [
    {
      title: "1. Panchakarma & Deep Body Detoxification",
      summary: "Classical five-fold purificatory therapies to expel deep accumulated metabolic toxins.",
      conditions: [
        "Metabolic sluggishness & chronic fatigue",
        "Seasonal body detoxification & immunity boost",
        "Cellular toxin (Ama) accumulation",
        "Rejuvenation & rasayana preparation",
      ],
      treatments: "Vamana, Virechana, Basti, Nasya, Raktamokshana, Abhyanga & Swedana.",
    },
    {
      title: "2. Chronic Skin Disorders (Twak Roga)",
      summary: "Treating the internal root cause by cooling Rakta-Pitta and detoxifying liver and blood.",
      conditions: [
        "Psoriasis (Kitibha Kushta) & scalp flaking",
        "Chronic eczema, dermatitis & dry rashes",
        "Acne vulgaris & stubborn facial pigmentation",
        "Urticaria (Sheetapitta) & persistent skin allergies",
      ],
      treatments: "Blood purification decoctions, herbal lepa, Takradhara, and strict Pathya diet.",
    },
    {
      title: "3. Joint, Spine & Musculoskeletal Care (Sandhivata)",
      summary: "Restoring joint lubrication, easing stiffness, and strengthening degenerated cartilage.",
      conditions: [
        "Osteoarthritis & knee joint stiffness",
        "Rheumatoid arthritis (Amavata) & joint swelling",
        "Cervical spondylosis & neck shoulder pain",
        "Sciatica (Gridhrasi) & lumbar slip disc discomfort",
      ],
      treatments: "Janu Basti, Kati Basti, Greeva Basti, Patra Pinda Sweda, medicated anti-inflammatory oils.",
    },
    {
      title: "4. Infertility & Hormonal Wellness (Stri & Purusha Roga)",
      summary: "Natural preconception care, reproductive organ nourishment, and hormonal equilibrium.",
      conditions: [
        "PCOS / PCOD & irregular menstrual cycles",
        "Fallopian tube blockages & uterine weakness",
        "Unexplained female & male sub-fertility",
        "Low sperm motility, count & vitality",
      ],
      treatments: "Uttar Basti, hormonal balancing rasayanas, specialized detox, and Garbha Samskara guidance.",
    },
    {
      title: "5. Digestive & Metabolic Disorders (Annavaha Srotas)",
      summary: "Kindling the digestive fire (Jatharagni) to eliminate acid reflux and bowel dysfunctions.",
      conditions: [
        "Chronic acidity, GERD & heartburn",
        "Irritable Bowel Syndrome (IBS / Grahani)",
        "Chronic constipation & bloating",
        "Metabolic sluggishness & weight imbalance",
      ],
      treatments: "Digestive herbs (Deepana-Pachana), custom dietary protocols, and stress reduction therapies.",
    },
    {
      title: "6. Stress, Sleep & Neurological Health (Manovaha Srotas)",
      summary: "Calming an overstimulated nervous system through classical herbal nourishment.",
      conditions: [
        "Chronic stress & generalized anxiety",
        "Insomnia & fragmented, restless sleep",
        "Migraine & tension headaches",
        "Mental fog, fatigue & lack of focus",
      ],
      treatments: "Shirodhara with medicated herbal oils, Nasya, Brahmi rasayanas, and pranayama guidance.",
    },
  ];

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "80vh", paddingTop: "20px" }}>
        {/* Page Hero Banner */}
        <section style={{ background: "rgba(24, 66, 50, 0.04)", padding: "60px 0 40px" }}>
          <div className="wrap">
            <div style={{ maxWidth: "760px", margin: "0 auto", textAlign: "center" }}>
              <div className="tag-badge">
                <Sparkles size={14} />
                <span>Clinical Specialities</span>
              </div>
              <h1 style={{ fontSize: "clamp(2.4rem, 5vw, 3.8rem)", marginBottom: "16px" }}>
                What We Treat
              </h1>
              <p style={{ color: "var(--ink-light)", fontSize: "1.15rem", lineHeight: 1.7 }}>
                At Charak Ayurveda, we do not suppress surface symptoms. We diagnose the root imbalances of Doshas, Dhatus, and Agni to bring lasting healing to your body and mind.
              </p>
            </div>
          </div>
        </section>

        {/* Treatment Details */}
        <section style={{ padding: "60px 0" }}>
          <div className="wrap">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "28px" }}>
              {categories.map((cat, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#ffffff",
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
