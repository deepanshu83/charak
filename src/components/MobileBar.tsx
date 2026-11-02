"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Phone, MessageCircle } from "lucide-react";

export default function MobileBar() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only track scroll on the home page
    if (pathname !== "/") return;

    const handleScroll = () => {
      const treatmentSection = document.getElementById("treatments");
      if (treatmentSection) {
        const rect = treatmentSection.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.8) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      } else {
        if (window.scrollY > 250) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

  // Only render on the main homepage (never on /blog, /doctors, or other subpages)
  if (pathname !== "/") {
    return null;
  }

  return (
    <div
      className={`mbar ${isVisible ? "is-visible" : ""}`}
      role="region"
      aria-label="Quick contact actions"
    >
      <a href="tel:+918852887717" className="mbar-btn mbar-call" aria-label="Call Charak Clinic">
        <Phone size={15} />
        <span>Call</span>
      </a>
      <a
        href="https://wa.me/918852887717"
        target="_blank"
        rel="noopener noreferrer"
        className="mbar-btn mbar-wa"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={16} />
        <span>WhatsApp</span>
      </a>
    </div>
  );
}
