import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBar from "@/components/MobileBar";
import { Truck, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy | Charak Ayurveda Pilani",
  description:
    "Shipping and delivery terms for classical Ayurvedic medicines and formulations dispatched from Charak Ayurveda Clinic, Pilani.",
};

export default function ShippingPolicyPage() {
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
              <Truck size={14} style={{ verticalAlign: "-2px", marginRight: "4px" }} /> Dispatch &amp; Logistics
            </span>
            <h1 style={{ fontSize: "2.4rem", color: "var(--green)", marginBottom: "8px" }}>
              Shipping &amp; Delivery Policy
            </h1>
            <p style={{ color: "var(--ink-light)", fontSize: "0.95rem" }}>
              Last updated: October 2026 • Charak Ayurveda Clinic Dispensary
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
              <h2 style={{ fontSize: "1.4rem", color: "var(--green)", marginBottom: "12px" }}>
                1. Order Processing &amp; Dispatch Timeline
              </h2>
              <p>
                All medicinal formulations, churnas, medicated oils, and rasayanas are hand-inspected and freshly packed at our dispensary in Pilani:
              </p>
              <ul style={{ paddingLeft: "24px", marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <li><strong>Processing Time:</strong> Orders are verified and dispatched within <strong>24 to 48 business hours</strong> following confirmation and clinical batch verification.</li>
                <li>Orders placed on Sundays or gazetted public holidays are processed on the subsequent working business day.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: "1.4rem", color: "var(--green)", marginBottom: "12px" }}>
                2. Estimated Delivery Duration
              </h2>
              <p>
                We deliver to all serviceable postal PIN codes across India through reputed courier partners (India Post Speed Post, Blue Dart, Delhivery):
              </p>
              <ul style={{ paddingLeft: "24px", marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <li><strong>Rajasthan &amp; NCR / Delhi:</strong> 2 to 4 business days.</li>
                <li><strong>Metro Cities (Mumbai, Bengaluru, Kolkata, Chennai, Hyderabad):</strong> 4 to 6 business days.</li>
                <li><strong>Rest of India:</strong> 5 to 7 business days.</li>
                <li><strong>Remote / Northeast regions:</strong> 7 to 10 business days.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: "1.4rem", color: "var(--green)", marginBottom: "12px" }}>
                3. Shipping Charges
              </h2>
              <p>
                Standard courier and secure prescription packaging is specified at checkout. For standard clinical dispatch, standard flat rates or complimentary delivery thresholds are shown transparently before order placement.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "1.4rem", color: "var(--green)", marginBottom: "12px" }}>
                4. Tracking Your Consignment
              </h2>
              <p>
                Upon dispatch from our dispensary, an SMS or WhatsApp notification with the courier tracking AWB number is sent to your registered phone number.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "1.4rem", color: "var(--green)", marginBottom: "12px" }}>
                5. In-Clinic Pick Up Option
              </h2>
              <p>
                Local patients in Pilani and surrounding towns may choose direct pickup at our hospital dispensary counter during regular clinic timings (10:00 AM to 7:00 PM) at zero shipping fee.
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
                <p><strong>Charak Ayurveda Dispensary Counter</strong></p>
                <p>6A, Beside Birla Hospital, Shyam Vatika, Vidyavihar, Pilani, Rajasthan 333031</p>
                <p><strong>Phone / Support:</strong> +91 88528 87717</p>
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
