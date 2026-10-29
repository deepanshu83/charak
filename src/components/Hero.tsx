"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Hero() {
  const [showOverlay, setShowOverlay] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Start fade-out at 8.5s, fully gone at 10s
    const fadeTimer = setTimeout(() => setFading(true), 8500);
    const hideTimer = setTimeout(() => setShowOverlay(false), 10000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

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
          <div className="arch ph1" style={{ position: "relative" }}>
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

            {/* 10-second branded text overlay */}
            {showOverlay && (
              <div
                className={`video-brand-overlay ${fading ? "video-brand-fade-out" : "video-brand-fade-in"}`}
              >
                <div className="video-brand-inner">
                  <span className="video-brand-leaf">☘</span>
                  <p className="video-brand-name">Charak Ayurveda</p>
                  <p className="video-brand-city">Pilani</p>
                  <span className="video-brand-line" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
