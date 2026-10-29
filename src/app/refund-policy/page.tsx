import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBar from "@/components/MobileBar";
import { RefreshCw, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy | Charak Ayurveda Pilani",
  description:
    "Cancellation and Refund Policy for doctor consultations and authentic herbal orders at Charak Ayurveda Clinic, Pilani.",
};

export default function RefundPolicyPage() {
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
              <RefreshCw size={14} style={{ verticalAlign: "-2px", marginRight: "4px" }} /> Fair Consumer Policy
            </span>
            <h1 style={{ fontSize: "2.4rem", color: "var(--green)", marginBottom: "8px" }}>
              Cancellation &amp; Refund Policy
            </h1>
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
              <h2 style={{ fontSize: "1.4rem", color: "var(--green)", marginBottom: "12px" }}>
                1. Doctor Consultation Fee &amp; Non-Refundable Policy
              </h2>
              <p>
                All doctor consultations at Charak Ayurveda are booked with confirmed dedicated one-on-one time slots for Nadi Pariksha and personalized clinical assessment:
              </p>
              <ul style={{ paddingLeft: "24px", marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <li><strong>Strictly Non-Refundable (परामर्श शुल्क वापस नहीं होगा):</strong> The doctor consultation fee of <strong>₹500</strong> is completely non-refundable once an appointment slot is reserved and paid online via Razorpay.</li>
                <li><strong>Rescheduling Policy:</strong> If you are unable to attend your appointment due to genuine personal emergencies, you may request to reschedule your consultation to any mutually available date/time by contacting our front desk at least 2 hours in advance. No cancellation refund will be issued.</li>
                <li><strong>Doctor Unavailability:</strong> In the rare event that a doctor is called away for emergency medical duties or is unavailable, you will receive priority rescheduling to your preferred date and time, or an exception refund processed back to your original payment method.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: "1.4rem", color: "var(--green)", marginBottom: "12px" }}>
                2. Medicinal Formulations &amp; Product Returns
              </h2>
              <p>
                Due to strict medical hygiene, Ayurvedic safety standards, and pharmaceutical guidelines:
              </p>
              <ul style={{ paddingLeft: "24px", marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <li><strong>Damaged / Incorrect Item in Transit:</strong> If your medicine package is damaged, tampered with, or contains an incorrect item upon delivery, notify us within <strong>48 hours</strong> of receipt with a photo/video. We will arrange a free replacement or a 100% refund.</li>
                <li><strong>Unopened Formulations:</strong> Unopened, sealed herbal preparations in their original outer packaging can be returned within <strong>7 days</strong> of delivery. Return courier charges will be borne by the customer unless the return is due to a clinic dispatch error.</li>
                <li><strong>Non-Returnable Items:</strong> Customized classical decoctions (Kashayams), opened oils, or personalized churnas prepared specifically for individual patient Dosha constitutions cannot be returned once unsealed.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: "1.4rem", color: "var(--green)", marginBottom: "12px" }}>
                3. Refund Processing Timeline
              </h2>
              <p>
                Once a refund is approved by our administration:
              </p>
              <ul style={{ paddingLeft: "24px", marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <li>Refunds are credited directly back to the original payment source (UPI account, Net Banking, Credit/Debit Card) via Razorpay.</li>
                <li>Standard processing turnaround time is typically <strong>5 to 7 business days</strong>, depending on your issuing bank&apos;s settlement cycle.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: "1.4rem", color: "var(--green)", marginBottom: "12px" }}>
                4. How to Request a Cancellation or Refund
              </h2>
              <p>
                To initiate a cancellation or refund request, please provide your appointment reference ID or order ID to our clinic desk:
              </p>
              <div
                style={{
                  background: "var(--cream-card)",
                  padding: "18px 22px",
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                  marginTop: "8px",
                }}
              >
                <p><strong>Charak Ayurveda Clinic Desk</strong></p>
                <p><strong>Phone / WhatsApp:</strong> +91 88528 87717 (10:00 AM – 7:00 PM IST)</p>
                <p><strong>Email:</strong> charakayurvedapilani@gmail.com</p>
                <p><strong>Address:</strong> 6A, Beside Birla Hospital, Shyam Vatika, Vidyavihar, Pilani, Rajasthan 333031</p>
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
