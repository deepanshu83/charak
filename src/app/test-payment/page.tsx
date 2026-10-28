"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ExternalLink,
  Lock,
  ArrowRight,
  Info,
  Sparkles,
} from "lucide-react";
import {
  launchRazorpayCheckout,
  type VerifyPaymentResponse,
  type RazorpaySuccessPayload,
} from "@/lib/razorpayClient";

export default function TestPaymentPage() {
  const [amountRupees, setAmountRupees] = useState<number>(1);
  const [customAmount, setCustomAmount] = useState<string>("1");
  const [customerName, setCustomerName] = useState<string>("Test Customer");
  const [customerEmail, setCustomerEmail] = useState<string>("test.patient@example.com");
  const [customerPhone, setCustomerPhone] = useState<string>("9876543210");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "idle" | "loading" | "success" | "error" | "dismissed";
    title: string;
    description: string;
  }>({
    type: "idle",
    title: "Ready to Test",
    description: "Select an amount and click 'Pay via Razorpay' to initiate checkout.",
  });

  const [verificationResult, setVerificationResult] = useState<{
    verify?: VerifyPaymentResponse;
    raw?: RazorpaySuccessPayload;
  } | null>(null);

  const presets = [
    { label: "₹1 (Min: 100 paise)", value: 1 },
    { label: "₹10", value: 10 },
    { label: "₹100", value: 100 },
    { label: "₹500 (Consultation)", value: 500 },
  ];

  const handlePresetClick = (val: number) => {
    setAmountRupees(val);
    setCustomAmount(val.toString());
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setAmountRupees(num);
    }
  };

  const handleStartPayment = async () => {
    const amountInPaise = Math.round(amountRupees * 100);

    if (amountInPaise < 100) {
      setStatusMessage({
        type: "error",
        title: "Invalid Amount",
        description: "Minimum payment amount is ₹1.00 (100 paise).",
      });
      return;
    }

    setIsLoading(true);
    setVerificationResult(null);
    setStatusMessage({
      type: "loading",
      title: "Creating Razorpay Order...",
      description: "Calling POST /api/create-order on the server...",
    });

    try {
      await launchRazorpayCheckout({
        amountPaise: amountInPaise,
        currency: "INR",
        description: `Test Payment for Charak Ayurveda (${amountRupees} INR)`,
        prefill: {
          name: customerName.trim() || "Test User",
          email: customerEmail.trim() || "test@example.com",
          contact: customerPhone.trim() || "9999999999",
        },
        notes: {
          testMode: "true",
          environment: "sandbox",
          purpose: "Razorpay Standard Checkout Verification",
          initiatedAt: new Date().toISOString(),
        },
        onSuccess: (verifyResult, raw) => {
          setIsLoading(false);
          setVerificationResult({ verify: verifyResult, raw });
          setStatusMessage({
            type: "success",
            title: "Payment Verified Successfully!",
            description: "Razorpay HMAC-SHA256 signature verified by server endpoint /api/verify-payment.",
          });
        },
        onError: (errMsg) => {
          setIsLoading(false);
          setStatusMessage({
            type: "error",
            title: "Payment Error",
            description: errMsg,
          });
        },
        onDismiss: () => {
          setIsLoading(false);
          setStatusMessage({
            type: "dismissed",
            title: "Checkout Modal Dismissed",
            description: "User closed the Razorpay payment window before completing payment.",
          });
        },
      });
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : "Failed to launch Razorpay.";
      setStatusMessage({
        type: "error",
        title: "Checkout Failure",
        description: msg,
      });
    }
  };

  const handleReset = () => {
    setVerificationResult(null);
    setStatusMessage({
      type: "idle",
      title: "Ready to Test",
      description: "Select an amount and click 'Pay via Razorpay' to initiate checkout.",
    });
  };

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "85vh", paddingTop: "40px", paddingBottom: "80px", background: "var(--cream, #fbf8f3)" }}>
        <div className="wrap" style={{ maxWidth: "880px", margin: "0 auto", padding: "0 20px" }}>
          
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                borderRadius: "9999px",
                background: "rgba(24, 66, 50, 0.08)",
                border: "1px solid rgba(24, 66, 50, 0.2)",
                color: "#184232",
                fontSize: "0.82rem",
                fontWeight: 700,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              <ShieldCheck size={16} />
              Razorpay Standard Web Checkout
            </div>
            <h1 style={{ fontSize: "2.4rem", color: "#184232", margin: "8px 0 12px", fontWeight: 700 }}>
              Payment Gateway Test Suite
            </h1>
            <p style={{ color: "var(--ink-light, #555)", fontSize: "1.05rem", maxWidth: "620px", margin: "0 auto", lineHeight: 1.6 }}>
              Verify end-to-end payment creation, checkout modal display, and server-side HMAC-SHA256 signature verification in real-time.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "28px" }}>
            
            {/* Card: Payment Config */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                border: "1px solid var(--border, #e5dfd5)",
                boxShadow: "0 8px 30px rgba(24, 66, 50, 0.06)",
                padding: "32px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <h2 style={{ fontSize: "1.25rem", color: "#184232", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                  <CreditCard size={20} color="#c59b27" />
                  Configure Test Transaction
                </h2>
                <span
                  style={{
                    fontSize: "0.75rem",
                    padding: "4px 10px",
                    background: "#ecfdf5",
                    color: "#065f46",
                    borderRadius: "6px",
                    fontWeight: 600,
                    border: "1px solid #a7f3d0",
                  }}
                >
                  Key: rzp_test_TtCarJLM4XMTit
                </span>
              </div>

              {/* Amount Selection */}
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "#184232", marginBottom: "10px" }}>
                  Select Test Amount (INR)
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "14px" }}>
                  {presets.map((p) => {
                    const isSelected = amountRupees === p.value;
                    return (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => handlePresetClick(p.value)}
                        style={{
                          padding: "10px 18px",
                          borderRadius: "10px",
                          border: isSelected ? "2px solid #184232" : "1px solid #dcd7ce",
                          background: isSelected ? "#184232" : "#fdfbf7",
                          color: isSelected ? "#ffffff" : "#184232",
                          fontWeight: 700,
                          fontSize: "0.92rem",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "0.9rem", color: "#666" }}>Or enter custom ₹:</span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={customAmount}
                    onChange={handleCustomChange}
                    style={{
                      width: "140px",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #dcd7ce",
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: "#184232",
                      outline: "none",
                    }}
                  />
                  <span style={{ fontSize: "0.85rem", color: "#888" }}>
                    = {Math.round(amountRupees * 100)} paise
                  </span>
                </div>
              </div>

              {/* Prefill Customer Details */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "16px",
                  marginBottom: "28px",
                  padding: "16px",
                  borderRadius: "12px",
                  background: "#f9f8f5",
                  border: "1px solid #ede8e0",
                }}
              >
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#555", marginBottom: "6px" }}>
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "1px solid #dcd7ce",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#555", marginBottom: "6px" }}>
                    Customer Email
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "1px solid #dcd7ce",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#555", marginBottom: "6px" }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "1px solid #dcd7ce",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>
              </div>

              {/* Action Button */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  id="razorpay-test-btn"
                  onClick={handleStartPayment}
                  disabled={isLoading}
                  style={{
                    flex: "1 1 240px",
                    padding: "16px 28px",
                    borderRadius: "12px",
                    border: "none",
                    background: isLoading
                      ? "#9ca3af"
                      : "linear-gradient(135deg, #184232 0%, #1f5742 100%)",
                    color: "#ffffff",
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    cursor: isLoading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    boxShadow: "0 4px 14px rgba(24, 66, 50, 0.25)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                >
                  <Lock size={18} />
                  {isLoading
                    ? "Processing Payment..."
                    : `Pay ₹${amountRupees.toLocaleString("en-IN")} via Razorpay`}
                </button>

                {verificationResult && (
                  <button
                    type="button"
                    onClick={handleReset}
                    style={{
                      padding: "16px 20px",
                      borderRadius: "12px",
                      border: "1px solid #dcd7ce",
                      background: "#ffffff",
                      color: "#184232",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <RotateCcw size={16} />
                    Test Again
                  </button>
                )}
              </div>
            </div>

            {/* Status / Output Feedback Panel */}
            <div
              style={{
                borderRadius: "20px",
                border: "1px solid var(--border, #e5dfd5)",
                background: "#ffffff",
                padding: "28px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
              }}
            >
              <h3 style={{ fontSize: "1.1rem", color: "#184232", marginTop: 0, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={18} color="#c59b27" />
                Live Execution Status
              </h3>

              {/* Status Box */}
              <div
                style={{
                  padding: "16px 20px",
                  borderRadius: "12px",
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                  background:
                    statusMessage.type === "success"
                      ? "#ecfdf5"
                      : statusMessage.type === "error"
                      ? "#fef2f2"
                      : statusMessage.type === "dismissed"
                      ? "#fffbeb"
                      : statusMessage.type === "loading"
                      ? "#eff6ff"
                      : "#f8fafc",
                  border:
                    statusMessage.type === "success"
                      ? "1px solid #a7f3d0"
                      : statusMessage.type === "error"
                      ? "1px solid #fecaca"
                      : statusMessage.type === "dismissed"
                      ? "1px solid #fde68a"
                      : statusMessage.type === "loading"
                      ? "1px solid #bfdbfe"
                      : "1px solid #e2e8f0",
                }}
              >
                {statusMessage.type === "success" ? (
                  <CheckCircle2 size={24} color="#059669" style={{ flexShrink: 0, marginTop: "2px" }} />
                ) : statusMessage.type === "error" ? (
                  <AlertCircle size={24} color="#dc2626" style={{ flexShrink: 0, marginTop: "2px" }} />
                ) : (
                  <Info size={24} color="#2563eb" style={{ flexShrink: 0, marginTop: "2px" }} />
                )}
                <div>
                  <strong style={{ display: "block", color: "#111827", fontSize: "0.98rem", marginBottom: "4px" }}>
                    {statusMessage.title}
                  </strong>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "#4b5563", lineHeight: 1.5 }}>
                    {statusMessage.description}
                  </p>
                </div>
              </div>

              {/* Verification Details Table if Success */}
              {verificationResult?.raw && (
                <div
                  style={{
                    background: "#0f231b",
                    color: "#e2f1ea",
                    padding: "20px",
                    borderRadius: "12px",
                    fontFamily: "monospace",
                    fontSize: "0.85rem",
                    overflowX: "auto",
                  }}
                >
                  <div style={{ color: "#74d4a8", fontWeight: 700, marginBottom: "10px" }}>
                    // Razorpay Signature Verified Payload
                  </div>
                  <div style={{ marginBottom: "6px" }}>
                    <span style={{ color: "#f3ba4b" }}>razorpay_payment_id: </span>
                    <span>&quot;{verificationResult.raw.razorpay_payment_id}&quot;</span>
                  </div>
                  <div style={{ marginBottom: "6px" }}>
                    <span style={{ color: "#f3ba4b" }}>razorpay_order_id: </span>
                    <span>&quot;{verificationResult.raw.razorpay_order_id}&quot;</span>
                  </div>
                  <div style={{ marginBottom: "6px" }}>
                    <span style={{ color: "#f3ba4b" }}>razorpay_signature: </span>
                    <span>&quot;{verificationResult.raw.razorpay_signature}&quot;</span>
                  </div>
                  <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.15)", color: "#34d399" }}>
                    ✓ Status: 200 OK | Authenticated via HMAC-SHA256
                  </div>
                </div>
              )}
            </div>

            {/* Test Payment Instructions Card */}
            <div
              style={{
                borderRadius: "16px",
                background: "#fdfbf7",
                border: "1px dashed #dcd7ce",
                padding: "24px",
              }}
            >
              <h3 style={{ fontSize: "1rem", color: "#184232", marginTop: 0, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Info size={16} />
                Razorpay Test Mode Helper:
              </h3>
              <ul style={{ margin: 0, paddingLeft: "20px", color: "#555", fontSize: "0.88rem", lineHeight: 1.8 }}>
                <li>
                  <strong>Cards:</strong> Any 16-digit card starting with <code>4012 0000 0000 0002</code>, any future expiry (e.g., <code>12/28</code>), CVV <code>111</code>, and OTP <code>123456</code>.
                </li>
                <li>
                  <strong>UPI:</strong> Use handle <code>success@razorpay</code> or simulate QR scanning.
                </li>
                <li>
                  <strong>Netbanking:</strong> Select any bank (SBI, HDFC, ICICI) and choose &quot;Success&quot; on the simulated bank screen.
                </li>
                <li>
                  <strong>Simulate Failure:</strong> Choose &quot;Failure&quot; on the bank screen or enter OTP <code>000000</code> to test error handling.
                </li>
              </ul>
            </div>

            <div style={{ textAlign: "center", marginTop: "12px" }}>
              <Link
                href="/appointment"
                style={{
                  color: "#184232",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  textDecoration: "underline",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                Go to Live Doctor Appointment Flow <ArrowRight size={16} />
              </Link>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
