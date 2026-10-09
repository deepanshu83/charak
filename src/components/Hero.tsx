import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="wrap hero-in">
        <div className="hero-t">
          <span className="tag">PANCHAKARMA · SKIN · JOINTS · FERTILITY</span>
          <h1>
            Ancient healing,<br />
            <em>personally</em> yours.
          </h1>
          <p>
            Charak Ayurveda brings classical, authentic Ayurvedic care to Vidyavihar, Pilani. We treat root causes through tailored Panchakarma detox, herbal medicine, and holistic lifestyle wisdom.
          </p>

          <div className="row">
            <Link href="/appointment" className="btn">
              Book Appointment
            </Link>
            <Link href="/products" className="btn gold" id="hero-shop-btn">
              Shop Formulations
            </Link>
            <a href="tel:+918852887717" className="btn ghost">
              📞 088528 87717
            </a>
          </div>
        </div>

        <div className="hero-media-wrapper">
          <div className="arch ph1">
            <video
              className="hero-video"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="Charak Ayurveda therapeutic sanctuary"
            >
              <source
                src="/Amal-Tamara-Ayurveda-Center-in-Kerala_Amal-Tamara_2.mp4"
                type="video/mp4"
              />
            </video>
          </div>

          <div className="hero-floating-badge">
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "rgba(192, 138, 62, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--gold)",
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--green)" }}>
                Authentic Ayurveda
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--ink-muted)" }}>
                Pilani, Rajasthan
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
