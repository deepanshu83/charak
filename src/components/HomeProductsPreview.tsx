"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Leaf, FlaskConical, Stethoscope, Calendar } from "lucide-react";

export default function HomeProductsPreview() {
  return (
    <section id="pharmacy" style={{ padding: "80px 0", background: "linear-gradient(180deg, #fdfbf7 0%, #f7f4ec 100%)" }}>
      <div className="wrap">
        <div className="head" style={{ maxWidth: "780px", margin: "0 auto 40px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <span className="tag" style={{ margin: 0 }}>Ayurvedic Pharmacy</span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                background: "rgba(197, 160, 89, 0.16)",
                color: "#996515",
                fontSize: "0.74rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                padding: "3px 10px",
                borderRadius: "999px",
                border: "1px solid rgba(197, 160, 89, 0.35)",
              }}
            >
              <Sparkles size={12} />
              <span>Launching Soon</span>
            </span>
          </div>

          <h2>Classical Herbal Medicines &amp; Therapeutic Oils</h2>
          <p>
            Handcrafted classical rasayanas, medicated tailas (oils), and targeted herbal remedies
            prepared strictly per Charak Samhita treatises. Online dispatch is launching shortly,
            while in-person medicines are actively available at our Pilani hospital campus.
          </p>
        </div>

        {/* 3 Teaser Category Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              border: "1px solid rgba(226, 232, 240, 0.9)",
              borderRadius: "16px",
              padding: "28px 24px",
              boxShadow: "0 4px 18px rgba(15, 23, 42, 0.04)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "12px",
                background: "#f1f7f4",
                color: "#184232",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <Leaf size={22} />
            </div>
            <h3 style={{ fontFamily: "var(--font-heading, Playfair Display, serif)", fontSize: "1.18rem", color: "#184232", marginBottom: "8px" }}>
              Classical Rasayanas &amp; Churnas
            </h3>
            <p style={{ fontSize: "0.9rem", color: "#64748b", lineHeight: 1.55, margin: "0 0 16px", flex: 1 }}>
              Immunity enhancers, digestive deepana-pachana herbs, and rejuvenative preparations.
            </p>
            <span style={{ fontSize: "0.76rem", color: "#996515", fontWeight: 600 }}>
              Ashwagandha • Giloy • Triphala
            </span>
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid rgba(226, 232, 240, 0.9)",
              borderRadius: "16px",
              padding: "28px 24px",
              boxShadow: "0 4px 18px rgba(15, 23, 42, 0.04)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "12px",
                background: "#f1f7f4",
                color: "#184232",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <FlaskConical size={22} />
            </div>
            <h3 style={{ fontFamily: "var(--font-heading, Playfair Display, serif)", fontSize: "1.18rem", color: "#184232", marginBottom: "8px" }}>
              Medicated Therapeutic Oils
            </h3>
            <p style={{ fontSize: "0.9rem", color: "#64748b", lineHeight: 1.55, margin: "0 0 16px", flex: 1 }}>
              Herbal tailas for chronic joint pain, spine rejuvenation, and authentic Panchakarma therapies.
            </p>
            <span style={{ fontSize: "0.76rem", color: "#996515", fontWeight: 600 }}>
              Mahanarayan • Kshirabala • Dhanwantharam
            </span>
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid rgba(226, 232, 240, 0.9)",
              borderRadius: "16px",
              padding: "28px 24px",
              boxShadow: "0 4px 18px rgba(15, 23, 42, 0.04)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "12px",
                background: "#f1f7f4",
                color: "#184232",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <Stethoscope size={22} />
            </div>
            <h3 style={{ fontFamily: "var(--font-heading, Playfair Display, serif)", fontSize: "1.18rem", color: "#184232", marginBottom: "8px" }}>
              Doctor-Prescribed Care
            </h3>
            <p style={{ fontSize: "0.9rem", color: "#64748b", lineHeight: 1.55, margin: "0 0 16px", flex: 1 }}>
              Personalized remedies formulated under direct doctor diagnosis for skin, joints, and fertility.
            </p>
            <span style={{ fontSize: "0.76rem", color: "#996515", fontWeight: 600 }}>
              Clinical Dosha Diagnostics
            </span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div style={{ display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap" }}>
          <Link href="/products" className="btn gold" id="home-view-all-products-btn">
            <Sparkles size={16} />
            <span>Explore Upcoming Formulations (Coming Soon)</span>
          </Link>
          <Link href="/appointment" className="btn" id="home-book-consult-btn">
            <Calendar size={16} />
            <span>Consult Hospital Doctors</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
