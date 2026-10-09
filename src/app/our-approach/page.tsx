import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBar from "@/components/MobileBar";
import { Sparkles, CheckCircle2, ShieldCheck, HeartHandshake, Compass, Leaf, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Our Approach | Charak Ayurveda Pilani",
  description:
    "Learn about our classical Ayurvedic medical philosophy, rooted in the teachings of Acharya Charak, focused on root-cause healing and natural harmony.",
};

export default function OurApproachPage() {
  const pillars = [
    {
      icon: Compass,
      title: "1. Classical Nadi Pariksha (Pulse Diagnosis)",
      desc: "Before prescribing a single herb, we examine your radial pulse to identify micro-imbalances in Vata, Pitta, and Kapha, cellular toxicity (Ama), and organ stress.",
    },
    {
      icon: Leaf,
      title: "2. Kindling Agni (Digestive Fire)",
      desc: "In Charaka Samhita, almost all diseases originate from impaired Agni (Mandagni). We restore your metabolic power so food nourishes your tissues rather than generating toxins.",
    },
    {
      icon: ShieldCheck,
      title: "3. Pure & Unadulterated Herbal Formulations",
      desc: "All medicated oils, decoctions, and herbal churnas used at our center are authentic classical preparations, completely free from steroids, heavy metal adulterants, or chemical additives.",
    },
    {
      icon: HeartHandshake,
      title: "4. Mind-Body Integration (Satvavajaya)",
      desc: "Physical ailments frequently have emotional and stress triggers. Our doctor provides compassionate counsel, stress-calming therapies, and lifestyle balance.",
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
                <span>Philosophy & Tradition</span>
              </div>
              <h1 style={{ fontSize: "clamp(2.4rem, 5vw, 3.8rem)", marginBottom: "16px" }}>
                Our Approach to Healing
              </h1>
              <p style={{ color: "var(--ink-light)", fontSize: "1.15rem", lineHeight: 1.7 }}>
                Named with deep reverence after Acharya Charak, our clinic adheres strictly to classical Ayurvedic principles — treating the individual, not just the disease.
              </p>
            </div>
          </div>
        </section>

        {/* Philosophy Intro */}
        <section style={{ padding: "60px 0" }}>
          <div className="wrap split-grid">
            <div className="approach-frame">
              <Image
                src="/images/ourApproach.jpeg"
                alt="Charak Ayurveda Sanctuary Vidyavihar"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                style={{ objectFit: "cover" }}
              />
            </div>

            <div>
              <span className="tag-badge">Vedic Heritage</span>
              <h2 style={{ fontSize: "2.4rem", marginBottom: "16px" }}>
                Root Cause Healing Over Symptom Suppression
              </h2>
              <p style={{ color: "var(--ink-light)", fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "16px" }}>
                Conventional modern treatments often focus on suppressing outward discomfort through painkillers or steroids, leaving the underlying imbalance dormant.
              </p>
              <p style={{ color: "var(--ink-light)", fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "24px" }}>
                In <em>Charaka Samhita</em>, healing is defined as the restoration of <strong>Dhatu Samya</strong> (tissue equilibrium). When we remove deep-seated metabolic toxins through Panchakarma and nourish the body with natural herbs, the body naturally awakens its own innate power to heal.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--ink)" }}>
                  <CheckCircle2 size={18} color="var(--gold)" />
                  <span>No unnecessary medicines or polypharmacy</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--ink)" }}>
                  <CheckCircle2 size={18} color="var(--gold)" />
                  <span>Personalized diet and lifestyle (Dinacharya & Ritucharya)</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--ink)" }}>
                  <CheckCircle2 size={18} color="var(--gold)" />
                  <span>Hygienic, serene, and private therapy chambers</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The 4 Clinical Pillars */}
        <section style={{ background: "rgba(24, 66, 50, 0.02)", padding: "60px 0" }}>
          <div className="wrap">
            <div className="sec-head">
              <span className="tag-badge">Methodology</span>
              <h2>Four Pillars of Our Clinical Practice</h2>
              <p>Every consultation and treatment protocol is guided by these four foundational standards.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
              {pillars.map((p, i) => {
                const Icon = p.icon;
                return (
                  <div
                    key={i}
                    style={{
                      background: "#ffffff",
                      borderRadius: "16px",
                      padding: "32px 24px",
                      border: "1px solid var(--border)",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "12px",
                        background: "rgba(194, 139, 56, 0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--gold)",
                        marginBottom: "16px",
                      }}
                    >
                      <Icon size={24} />
                    </div>
                    <h3 style={{ fontSize: "1.3rem", color: "var(--green)", marginBottom: "8px" }}>
                      {p.title}
                    </h3>
                    <p style={{ color: "var(--ink-light)", fontSize: "0.92rem", lineHeight: 1.6, margin: 0 }}>
                      {p.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div style={{ textAlign: "center", marginTop: "48px" }}>
              <Link href="/#contact" className="btn gold">
                <Calendar size={18} />
                Experience Classical Ayurvedic Healing
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <MobileBar />
    </>
  );
}
