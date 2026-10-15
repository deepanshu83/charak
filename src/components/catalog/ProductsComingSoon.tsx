"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BellRing,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Eye,
  Boxes,
} from "lucide-react";

interface ProductsComingSoonProps {
  isAdmin?: boolean;
  onSwitchToCatalog?: () => void;
  productCount?: number;
}

export default function ProductsComingSoon({
  isAdmin = false,
  onSwitchToCatalog,
  productCount = 0,
}: ProductsComingSoonProps) {
  const [contactInput, setContactInput] = useState("");
  const [notified, setNotified] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactInput.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      setNotified(true);
      setSubmitting(false);
    }, 500);
  };

  return (
    <div className="products-coming-soon-wrapper">
      {/* Admin Mode Floating Notice if logged in */}
      {isAdmin && (
        <div className="admin-preview-banner">
          <div className="admin-preview-content">
            <div className="admin-preview-badge">
              <ShieldCheck size={16} />
              <span>Admin Preview Mode</span>
            </div>
            <p className="admin-preview-text">
              Public visitors see <strong>Coming Soon</strong>.
              You have <strong>{productCount}</strong> product{productCount === 1 ? "" : "s"} in database.
            </p>
          </div>
          <div className="admin-preview-actions">
            {onSwitchToCatalog && (
              <button
                type="button"
                onClick={onSwitchToCatalog}
                className="btn sm"
                style={{
                  background: "#184232",
                  color: "#ffffff",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Eye size={15} />
                <span>Preview Live Catalog</span>
              </button>
            )}
            <Link
              href="/admin/products"
              className="btn ghost sm"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Boxes size={15} />
              <span>Admin Console</span>
            </Link>
          </div>
        </div>
      )}

      {/* Main Centered Coming Soon Section */}
      <section className="coming-soon-center">
        <div className="coming-soon-box">
          <div className="coming-soon-tag">Charak Ayurveda Products</div>

          <h1 className="coming-soon-title">Coming Soon</h1>

          <p className="coming-soon-text">
            Our authentic Ayurvedic products will be available here soon.
            Leave your contact to get notified on launch.
          </p>

          {/* Minimal Notify Me Box */}
          <div className="notify-container">
            {notified ? (
              <div className="notify-success">
                <CheckCircle2 size={22} className="notify-success-icon" />
                <span>Thank you! We will notify you as soon as products launch.</span>
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit} className="notify-form">
                <div className="notify-input-wrapper">
                  <BellRing size={18} className="notify-bell-icon" />
                  <input
                    type="text"
                    placeholder="Enter WhatsApp number or Email"
                    value={contactInput}
                    onChange={(e) => setContactInput(e.target.value)}
                    disabled={submitting}
                    required
                    aria-label="WhatsApp number or Email for notifications"
                  />
                </div>
                <button type="submit" disabled={submitting} className="btn gold notify-btn">
                  <span>{submitting ? "Saving..." : "Notify Me"}</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <style jsx>{`
        .products-coming-soon-wrapper {
          min-height: calc(85vh - 80px);
          display: flex;
          flex-direction: column;
          background: linear-gradient(180deg, #fdfbf7 0%, #f7f4ec 100%);
          padding: 24px 16px 80px;
        }

        .admin-preview-banner {
          max-width: 900px;
          margin: 0 auto 30px;
          width: 100%;
          background: #ffffff;
          border: 1px solid rgba(197, 160, 89, 0.45);
          border-left: 4px solid #c5a059;
          border-radius: 12px;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          box-shadow: 0 4px 16px rgba(24, 66, 50, 0.05);
        }

        .admin-preview-content {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .admin-preview-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #eef7f2;
          color: #184232;
          font-weight: 700;
          font-size: 0.78rem;
          padding: 4px 10px;
          border-radius: 999px;
        }

        .admin-preview-text {
          margin: 0;
          color: #334155;
          font-size: 0.86rem;
        }

        .admin-preview-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .coming-soon-center {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 12px;
        }

        .coming-soon-box {
          max-width: 580px;
          width: 100%;
          text-align: center;
          background: #ffffff;
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 24px;
          padding: 56px 36px;
          box-shadow: 0 10px 30px rgba(24, 66, 50, 0.06);
        }

        @media (max-width: 640px) {
          .coming-soon-box {
            padding: 38px 20px;
          }
        }

        .coming-soon-tag {
          display: inline-block;
          font-size: 0.76rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          background: rgba(197, 160, 89, 0.16);
          color: #996515;
          padding: 4px 14px;
          border-radius: 999px;
          margin-bottom: 20px;
          border: 1px solid rgba(197, 160, 89, 0.3);
        }

        .coming-soon-title {
          font-family: var(--font-heading, "Playfair Display", Georgia, serif);
          font-size: clamp(2.4rem, 5vw, 3.8rem);
          line-height: 1.15;
          color: #184232;
          margin: 0 0 16px;
          font-weight: 700;
          letter-spacing: -0.01em;
        }

        .coming-soon-text {
          font-size: 1.05rem;
          line-height: 1.6;
          color: #4b5563;
          margin: 0 auto 36px;
          max-width: 440px;
        }

        .notify-container {
          max-width: 480px;
          margin: 0 auto;
        }

        .notify-form {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .notify-input-wrapper {
          flex: 1;
          min-width: 240px;
          display: flex;
          align-items: center;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          padding: 0 14px;
          transition: border-color 0.2s, background 0.2s;
        }

        .notify-input-wrapper:focus-within {
          border-color: #c5a059;
          background: #ffffff;
        }

        .notify-bell-icon {
          color: #94a3b8;
          margin-right: 10px;
          flex-shrink: 0;
        }

        .notify-input-wrapper input {
          width: 100%;
          padding: 13px 0;
          border: none;
          background: transparent;
          font-size: 0.95rem;
          color: #0f172a;
          outline: none;
        }

        .notify-input-wrapper input::placeholder {
          color: #94a3b8;
        }

        .notify-btn {
          padding: 13px 22px;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex-shrink: 0;
        }

        @media (max-width: 500px) {
          .notify-btn {
            width: 100%;
          }
        }

        .notify-success {
          background: #f0fdf4;
          border: 1.5px solid #86efac;
          border-radius: 12px;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #166534;
          font-size: 0.92rem;
          font-weight: 600;
        }

        .notify-success-icon {
          color: #16a34a;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
