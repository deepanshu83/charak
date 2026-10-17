import Link from "next/link";
import { Lock } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer>
      <div className="wrap">
        <Link href="/" className="logo">
          Charak<em>Ayurveda</em>
        </Link>
        <p>Panchakarma, Skin Care, Joint Care &amp; Infertility Center</p>
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
