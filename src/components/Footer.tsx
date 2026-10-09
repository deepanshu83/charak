import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer>
      <div className="wrap">
        <Link href="/" className="logo">
          Charak<em>Ayurveda</em>
        </Link>
        <p>Panchakarma, Skin Care, Joint Care &amp; Infertility Center</p>
        <small>© {year} Charak Ayurveda. All rights reserved.</small>
      </div>
    </footer>
  );
}
