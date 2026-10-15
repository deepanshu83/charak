import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Gallery from "@/components/Gallery";
import Footer from "@/components/Footer";
import MobileBar from "@/components/MobileBar";
import { Calendar, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Gallery | Charak Ayurveda Pilani",
  description:
    "Explore photo glimpses of Charak Ayurveda clinic in Vidyavihar Pilani, traditional Panchakarma suites, herbal preparations, and peaceful consultation chambers.",
};

export default function GalleryPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "80vh", paddingTop: "20px" }}>
        {/* Page Hero Banner */}
        <section style={{ padding: "60px 0 30px" }}>
          <div className="wrap">
            <div className="head">
              <span className="tag">Sanctuary &amp; Therapies</span>
              <h1>Clinic Gallery</h1>
              <p>
                Take a visual tour of our healing spaces, time-honored Panchakarma therapies, and sacred medicinal herbs at Charak Ayurveda in Vidyavihar, Pilani.
              </p>
            </div>
          </div>
        </section>

        {/* Interactive Gallery */}
        <Gallery />

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
                Experience Our Sanctuary in Person
              </h2>
              <p style={{ color: "#cfc9bb", maxWidth: "620px", margin: "0 auto 24px", fontSize: "1.05rem" }}>
                Located beside Birla Hospital in Shyam Vatika, Vidyavihar, Pilani. Visit us for an authentic consultation with our Vaidya.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
                <Link href="/appointment" className="btn gold">
                  <Calendar size={18} />
                  Book Your Visit
                </Link>
                <a href="tel:+918852887717" className="btn ghost" style={{ color: "#ffffff", borderColor: "rgba(255, 255, 255, 0.4)" }}>
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
