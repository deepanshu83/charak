import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBar from "@/components/MobileBar";
import { FileText, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms and Conditions | Charak Ayurveda Pilani",
  description:
    "Terms and Conditions governing doctor consultations, therapies, and medicinal formulation orders at Charak Ayurveda Clinic, Pilani.",
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "80vh", padding: "40px 0 80px" }}>
        <div className="wrap" style={{ maxWidth: "860px" }}>
          <div style={{ marginBottom: "24px" }}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                color: "var(--green)",
                fontSize: "0.9rem",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              <ArrowLeft size={16} /> Back to Home
            </Link>
          </div>

          <header style={{ marginBottom: "32px", borderBottom: "1px solid var(--border)", paddingBottom: "20px" }}>
            <span className="tag" style={{ marginBottom: "12px", display: "inline-block" }}>
              <FileText size={14} style={{ verticalAlign: "-2px", marginRight: "4px" }} /> User Agreement
            </span>
            <h1 style={{ fontSize: "2.4rem", color: "var(--green)", marginBottom: "8px" }}>Terms &amp; Conditions</h1>
            <p style={{ color: "var(--ink-light)", fontSize: "0.95rem" }}>
              Last updated: October 2026 • Charak Ayurveda Clinic &amp; Panchakarma Center
            </p>
          </header>

          <article
            style={{
              lineHeight: "1.8",
              color: "var(--ink)",
              fontSize: "1.02rem",
              display: "flex",
              flexDirection: "column",
              gap: "28px",
            }}
          >
            <section>
              <h2 style={{ fontSize: "1.4rem", color: "var(--green)", marginBottom: "12px" }}>1. General Overview</h2>
              <p>
                By accessing or utilizing the online booking services, appointment system, and digital catalog of Charak Ayurveda Clinic (&quot;the Clinic&quot;), you acknowledge and agree to comply with these Terms and Conditions. If you disagree with any portion of these terms, please refrain from using our digital services.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "1.4rem", color: "var(--green)", marginBottom: "12px" }}>2. Medical Consultations &amp; Nature of Advice</h2>
              <p>
                Ayurvedic consultations provided by certified practitioners at Charak Ayurveda are holistic and personalized based on Tridosha assessment, Nadi Pariksha, and lifestyle diagnosis.
              </p>
              <ul style={{ paddingLeft: "24px", marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <li>Online consultations do not replace acute emergency medical treatment. In cases of acute life-threatening emergencies, patients must immediately visit an emergency trauma center.</li>
                <li>Patients agree to provide accurate and truthful medical history, including ongoing allopathic medications, allergies, and pre-existing conditions.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: "1.4rem", color: "var(--green)", marginBottom: "12px" }}>3. Appointment Booking &amp; Slot Confirmation</h2>
              <p>
                Consultation slots are reserved upon confirmation. When opting for online fee payment via Razorpay, your slot is confirmed instantly upon successful transaction verification. When opting for in-clinic payment, please arrive at least 10 minutes prior to your designated slot to complete registration.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "1.4rem", color: "var(--green)", marginBottom: "12px" }}>4. Pricing &amp; Payment Terms</h2>
              <p>
                All fees for consultations, diagnostic evaluations, and medicinal formulations are displayed in Indian Rupees (INR) and are inclusive of applicable taxes. Payments are securely processed via Razorpay. We reserve the right to revise consultation fees and medicine pricing with prior update on our website.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "1.4rem", color: "var(--green)", marginBottom: "12px" }}>5. Intellectual Property</h2>
              <p>
                All logos, texts, medical educational articles, photographs, and branding on charakayurvedapilani.com are the exclusive intellectual property of Charak Ayurveda Clinic. Unauthorized reproduction or commercial use is strictly prohibited.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "1.4rem", color: "var(--green)", marginBottom: "12px" }}>6. Jurisdiction</h2>
              <p>
                These terms are governed by the laws of India. Any disputes arising out of the services rendered shall be subject to the exclusive jurisdiction of the competent courts in Pilani / Jhunjhunu, Rajasthan.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "1.4rem", color: "var(--green)", marginBottom: "12px" }}>7. Contact Information</h2>
              <div
                style={{
                  background: "var(--cream-card)",
                  padding: "18px 22px",
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                  marginTop: "8px",
                }}
              >
                <p><strong>Charak Ayurveda Clinic &amp; Panchakarma Center</strong></p>
                <p>6A, Beside Birla Hospital, Shyam Vatika, Vidyavihar, Pilani, Rajasthan 333031</p>
                <p><strong>Phone:</strong> +91 88528 87717</p>
                <p><strong>Email:</strong> charakayurvedapilani@gmail.com</p>
              </div>
            </section>
          </article>
        </div>
      </main>
      <Footer />
      <MobileBar />
    </>
  );
}
