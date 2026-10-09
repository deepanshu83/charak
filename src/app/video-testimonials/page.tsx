import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBar from "@/components/MobileBar";
import VideoTestimonials from "@/components/VideoTestimonials";
import { Sparkles, Calendar, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Patient Video Testimonials | Charak Ayurveda Pilani",
  description:
    "Watch real patient recovery video stories, Panchakarma milestones, and natural healing experiences at Charak Ayurveda in Vidyavihar, Pilani.",
};

export default function VideoTestimonialsPage() {
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
                <span>Verified Patient Accounts</span>
              </div>
              <h1 style={{ fontSize: "clamp(2.4rem, 5vw, 3.8rem)", marginBottom: "16px" }}>
                Video Testimonials
              </h1>
              <p style={{ color: "var(--ink-light)", fontSize: "1.15rem", lineHeight: 1.7 }}>
                Hear directly from our patients about their path from chronic ailment to restored vitality with personalized Ayurvedic therapy.
              </p>
            </div>
          </div>
        </section>

        {/* Video Testimonials Content */}
        <VideoTestimonials />

        {/* CTA Banner */}
        <section style={{ padding: "40px 0 80px" }}>
          <div className="wrap">
            <div
              style={{
                background: "var(--deep)",
                color: "#ffffff",
                padding: "40px",
                borderRadius: "24px",
                textAlign: "center",
                backgroundImage: "radial-gradient(circle at 20% 80%, rgba(194, 139, 56, 0.25), transparent 45%)",
              }}
            >
              <h2 style={{ color: "#ffffff", fontSize: "2.2rem", marginBottom: "12px" }}>
                Ready to Experience Real Healing?
              </h2>
              <p style={{ color: "#cfc9bb", maxWidth: "620px", margin: "0 auto 24px", fontSize: "1.05rem" }}>
                Book a one-on-one pulse diagnosis with our Ayurvedic physician in Vidyavihar, Pilani.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
                <Link href="/appointment" className="btn gold">
                  <Calendar size={18} />
                  Book Consultation
                </Link>
                <a href="tel:+918852887717" className="btn ghost" style={{ borderColor: "rgba(255,255,255,0.3)", color: "#ffffff" }}>
                  <Phone size={18} />
                  088528 87717
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
