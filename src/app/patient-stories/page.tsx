import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBar from "@/components/MobileBar";
import Reviews from "@/components/Reviews";
import VideoTestimonials from "@/components/VideoTestimonials";
import { Calendar, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Patient Stories & Testimonials | Charak Ayurveda Pilani",
  description:
    "Read authentic patient healing stories and reviews for Panchakarma detox, chronic skin care, joint pain, and fertility treatments at Charak Ayurveda.",
};

export default function PatientStoriesPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "80vh", paddingTop: "20px" }}>
        {/* Page Hero Banner */}
        <section style={{ paddingTop: "48px", paddingBottom: "0" }}>
          <div className="wrap">
            <div className="head" style={{ marginBottom: "24px" }}>
              <span className="tag">Real Healing Experiences</span>
              <h1>Patient Stories</h1>
              <p>
                Authentic testimonials and clinical recovery journeys from individuals who placed their faith in classical Ayurveda at Charak Ayurveda in Pilani.
              </p>
            </div>
          </div>
        </section>

        {/* Stories Section reading from Supabase */}
        <Reviews showHeader={false} style={{ paddingTop: "0px", paddingBottom: "50px" }} />

        {/* Video Testimonials Section */}
        <VideoTestimonials />

        {/* Bottom Banner */}
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
                Begin Your Healing Journey
              </h2>
              <p style={{ color: "#cfc9bb", maxWidth: "620px", margin: "0 auto 24px", fontSize: "1.05rem" }}>
                Speak directly with our senior Ayurvedic physician for a comprehensive pulse diagnosis and personalized therapy roadmap.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
                <Link href="/appointment" className="btn gold">
                  <Calendar size={18} />
                  Book Consultation
                </Link>
                <a href="tel:+918852887717" className="btn ghost" style={{ borderColor: "rgba(255,255,255,0.3)", color: "#ffffff" }}>
                  <Phone size={18} />
                  Call 088528 87717
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
