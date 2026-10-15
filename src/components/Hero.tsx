import Link from "next/link";

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
            <Link href="/treatments" className="btn gold" id="hero-treatments-btn">
              View Treatments
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
        </div>
      </div>
    </section>
  );
}
