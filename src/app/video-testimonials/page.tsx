import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBar from "@/components/MobileBar";
import VideoTestimonials from "@/components/VideoTestimonials";
import { Calendar, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Patient Video Testimonials | Charak Ayurveda Pilani",
  description:
    "Watch real patient recovery video stories, Panchakarma milestones, and natural healing experiences at Charak Ayurveda in Vidyavihar, Pilani.",
  alternates: {
    canonical: "https://charakayurvedapilani.com/video-testimonials",
  },
  openGraph: {
    title: "Patient Video Testimonials | Charak Ayurveda Pilani",
    description: "Real patient recovery videos — Panchakarma milestones and natural healing experiences at Charak Ayurveda, Vidyavihar, Pilani.",
    url: "https://charakayurvedapilani.com/video-testimonials",
    type: "website",
  },
};

export default function VideoTestimonialsPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "80vh", paddingTop: "20px" }}>
        {/* Video Testimonials Coming Soon Content */}
        <VideoTestimonials />

        {/* CTA Banner */}
        <section style={{ padding: "20px 0 80px" }}>
          <div className="wrap">
            <div
              style={{
                background: "var(--deep)",
                color: "#ffffff",
                padding: "44px 32px",
                borderRadius: "24px",
                textAlign: "center",
                backgroundImage: "radial-gradient(circle at 20% 80%, rgba(194, 139, 56, 0.25), transparent 45%)",
              }}
            >
              <h2 style={{ color: "#ffffff", fontSize: "2rem", marginBottom: "12px" }}>
                Ready to Experience Real Healing?
              </h2>
              <p
                style={{
                  color: "rgba(255,255,255,0.85)",
                  maxWidth: "540px",
                  margin: "0 auto 28px",
                  fontSize: "1.02rem",
                  lineHeight: "1.6",
                }}
              >
                Schedule your consultation with senior Ayurvedic Vaidyas at Charak Ayurveda, Pilani. Nadi Pariksha and personalized Panchakarma care.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
                <Link
                  href="/appointment"
                  className="btn btn-primary"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "var(--gold)",
                    color: "var(--deep)",
                    fontWeight: 700,
                    padding: "14px 28px",
                    borderRadius: "999px",
                    textDecoration: "none",
                  }}
                >
                  <Calendar size={18} /> Book Consultation
                </Link>
                <a
                  href="tel:08852887717"
                  className="btn btn-ghost"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    border: "1.5px solid rgba(255,255,255,0.4)",
                    color: "#ffffff",
                    fontWeight: 600,
                    padding: "14px 28px",
                    borderRadius: "999px",
                    textDecoration: "none",
                  }}
                >
                  <Phone size={18} /> Call Hospital
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
