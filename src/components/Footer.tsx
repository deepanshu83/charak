import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer>
      <div className="wrap">
        <Link href="/" className="logo footer-logo" aria-label="Charak Ayurveda Home">
          <Image
            src="/logo.png"
            alt="Charak Ayurveda Logo"
            width={44}
            height={44}
            className="footer-logo-img"
          />
          <span className="logo-brand-text">
            Charak<em>Ayurveda</em>
          </span>
        </Link>
        <p>Panchakarma, Skin Care, Joint Care &amp; Infertility Center</p>
        <p className="footer-address-line">
          6A, Beside Birla Hospital, Shyam Vatika, Vidyavihar, Pilani, Rajasthan 333031 • Ph: +91 88528 87717
        </p>

        <div className="footer-policy-row">
          <Link href="/privacy-policy">Privacy Policy</Link>
          <span className="footer-divider">•</span>
          <Link href="/terms">Terms &amp; Conditions</Link>
          <span className="footer-divider">•</span>
          <Link href="/refund-policy">Refund &amp; Cancellation</Link>
          <span className="footer-divider">•</span>
          <Link href="/shipping-policy">Shipping &amp; Delivery</Link>
          <span className="footer-divider">•</span>
          <Link href="/#contact">Contact</Link>
        </div>

        <div className="footer-bottom-row">
          <span>© {year} Charak Ayurveda. All rights reserved.</span>
          <span className="footer-divider">•</span>
          <Link
            href="/admin"
            title="Doctor & Clinic Admin Portal"
            className="footer-admin-link"
          >
            <Lock size={14} strokeWidth={2} />
            <span>Admin Login</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
