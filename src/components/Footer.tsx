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
          <Link
            href="/admin"
            title="Clinic Staff Portal"
            aria-label="Staff Portal"
            className="footer-staff-lock"
          >
            <Lock size={11} strokeWidth={1.8} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
