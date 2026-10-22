import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBar from "@/components/MobileBar";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Charak Ayurveda Pilani",
  description:
    "Privacy Policy for Charak Ayurveda Clinic. Learn how we collect, protect, and use patient consultation and order data in compliance with Indian privacy laws.",
};

export default function PrivacyPolicyPage() {
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
              <ShieldCheck size={14} style={{ verticalAlign: "-2px", marginRight: "4px" }} /> Legal &amp; Compliance
            </span>
            <h1 style={{ fontSize: "2.4rem", color: "var(--green)", marginBottom: "8px" }}>Privacy Policy</h1>
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
              <h2 style={{ fontSize: "1.4rem", color: "var(--green)", marginBottom: "12px" }}>1. Introduction</h2>
              <p>
                Charak Ayurveda Clinic (&quot;we&quot;, &quot;our&quot;, or &quot;the Clinic&quot;), situated at 6A, Beside Birla Hospital, Shyam Vatika, Vidyavihar, Pilani, Rajasthan 333031, respects your personal privacy. This Privacy Policy details our practices concerning the collection, storage, and handling of personal and medical data provided through our website (charakayurvedapilani.com), consultation booking system, and dispensary services.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "1.4rem", color: "var(--green)", marginBottom: "12px" }}>2. Information We Collect</h2>
              <p>When you book an appointment, purchase formulations, or contact our clinic, we may collect:</p>
              <ul style={{ paddingLeft: "24px", marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <li><strong>Personal Identity:</strong> Full Name, gender, age, and contact preferences.</li>
                <li><strong>Contact Data:</strong> Phone/WhatsApp number, email address, postal and shipping address with PIN code.</li>
                <li><strong>Clinical Consultation Data:</strong> Health concerns, symptoms, pulse analysis notes (Nadi Pariksha), and doctor consultation summaries.</li>
                <li><strong>Payment Transaction Data:</strong> Transaction identifiers, order IDs, and payment statuses provided via our secure payment gateway partner (Razorpay). <em>We never store credit card numbers, CVVs, or bank net banking credentials on our servers.</em></li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: "1.4rem", color: "var(--green)", marginBottom: "12px" }}>3. How We Use Your Information</h2>
              <p>We use your information strictly for legitimate medical and operational purposes:</p>
              <ul style={{ paddingLeft: "24px", marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <li>Scheduling, confirming, and managing your Ayurvedic doctor consultations.</li>
                <li>Dispensing authentic herbal formulations and coordinating courier deliveries.</li>
                <li>Sending SMS/WhatsApp consultation reminders and payment receipts.</li>
                <li>Maintaining confidential clinical records in accordance with Indian medical record ethics.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: "1.4rem", color: "var(--green)", marginBottom: "12px" }}>4. Payment Processing &amp; Security</h2>
              <p>
                All online payments on this website are processed securely via <strong>Razorpay Software Private Limited</strong>, a PCI-DSS Level 1 compliant payment aggregator. All transmissions between your browser, our servers, and Razorpay are encrypted with industry-standard 256-bit SSL/TLS encryption.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "1.4rem", color: "var(--green)", marginBottom: "12px" }}>5. Information Sharing &amp; Third Parties</h2>
              <p>
                We do not sell, rent, or trade your personal or health data to advertisers or third-party marketers. Data is only shared with:
              </p>
              <ul style={{ paddingLeft: "24px", marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <li>Our consulting doctors and certified Panchakarma therapists directly involved in your care.</li>
                <li>Payment gateway providers (Razorpay) solely to process authorized transactions.</li>
                <li>Logistics and courier partners (e.g. India Post, Blue Dart, Delhivery) strictly to deliver your medicinal parcels.</li>
                <li>Legal and regulatory authorities when mandated by applicable law or court order.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: "1.4rem", color: "var(--green)", marginBottom: "12px" }}>6. Patient Rights &amp; Grievance Redressal</h2>
              <p>
                You have the right to request a copy of your consultation records or request corrections to your contact information. For privacy queries or grievances, please contact:
              </p>
              <div
                style={{
                  background: "var(--cream-card)",
                  padding: "18px 22px",
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                  marginTop: "12px",
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
