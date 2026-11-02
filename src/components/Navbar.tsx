"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ChevronRight,
  Calendar,
  Phone,
  MessageCircle,
  Sparkles,
  UserCheck,
  Package,
  Heart,
  Video,
  Image as ImageIcon,
  BookOpen,
  MapPin,
  Clock,
} from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const closeMenu = () => setIsOpen(false);

  // Automatically close mobile menu when navigating to a new route
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock background scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Support closing menu with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navLinks = [
    {
      href: "/treatments",
      label: "Treatments & Therapies",
      sublabel: "Authentic Panchakarma & Holistic Care",
      icon: Sparkles,
    },
    {
      href: "/doctors",
      label: "Our Ayurvedic Doctors",
      sublabel: "Senior Vaidyas & Nadi Pariksha Experts",
      icon: UserCheck,
    },
    {
      href: "/products",
      label: "Medicinal Formulations",
      sublabel: "Herbal Oils, Rasayanas & Wellness Kits",
      icon: Package,
      badge: "Soon",
    },
    {
      href: "/our-approach",
      label: "Our Vedic Approach",
      sublabel: "Root-Cause Healing Philosophy",
      icon: Heart,
    },
    {
      href: "/patient-stories",
      label: "Patient Stories & Reviews",
      sublabel: "Real Recovery & Healing Experiences",
      icon: BookOpen,
    },
    {
      href: "/video-testimonials",
      label: "Video Testimonials",
      sublabel: "Patient Journeys on Video",
      icon: Video,
    },
    {
      href: "/gallery",
      label: "Clinic & Suites Gallery",
      sublabel: "Explore Our Modern Ayurvedic Center",
      icon: ImageIcon,
    },
    {
      href: "/blog",
      label: "Ayurvedic Wisdom & Blog",
      sublabel: "Health Articles & Daily Wellness Tips",
      icon: BookOpen,
    },
    {
      href: "/#contact",
      label: "Contact & Location",
      sublabel: "Beside Birla Hospital, Vidyavihar, Pilani",
      icon: MapPin,
    },
  ];

  return (
    <>
      <header id="top">
        <div className="wrap nav">
          <Link href="/" className="logo" onClick={closeMenu} aria-label="Charak Ayurveda Home">
            <Image
              src="/logo.png"
              alt="Charak Ayurveda Logo"
              width={40}
              height={40}
              priority
              className="logo-img"
            />
            <span className="logo-brand-text">
              Charak<em>Ayurveda</em>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav id="menu" className="nav-menu-desktop hide-m">
            <Link href="/treatments">Treatments</Link>
            <Link href="/doctors">Doctors</Link>
            <Link
              href="/products"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <span>Products</span>
              <span className="products-soon-badge">Soon</span>
            </Link>
            <Link href="/patient-stories">Stories</Link>
            <Link href="/gallery">Gallery</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/#contact">Contact</Link>
          </nav>

          {/* Desktop Right CTAs */}
          <div className="nav-cta hide-m">
            <Link href="/appointment" className="btn sm">
              Book Consultation
            </Link>
          </div>

          {/* Mobile Right Controls: Modern Animated Hamburger Button */}
          <div className="mobile-header-actions">
            <button
              type="button"
              className={`mobile-menu-toggle-btn ${isOpen ? "is-active" : ""}`}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              onClick={() => setIsOpen((prev) => !prev)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Over Drawer & Backdrop - rendered outside header to avoid stacking context clipping */}
      {isOpen && (
        <div className="mobile-nav-portal-wrapper">
          <div
            className="mobile-nav-backdrop"
            onClick={closeMenu}
            aria-hidden="true"
          />
          <aside
            className="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
          >
            {/* Drawer Top Bar with Brand & Close */}
            <div className="mobile-drawer-header">
              <Link href="/" className="drawer-logo" onClick={closeMenu}>
                <Image
                  src="/logo.png"
                  alt="Charak Ayurveda"
                  width={34}
                  height={34}
                  className="drawer-logo-img"
                />
                <div className="drawer-brand-col">
                  <span className="drawer-brand-title">Charak<em>Ayurveda</em></span>
                  <span className="drawer-brand-sub">Pilani, Rajasthan</span>
                </div>
              </Link>
              <button
                type="button"
                className="mobile-drawer-close-btn"
                onClick={closeMenu}
                aria-label="Close navigation menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Status Pill */}
            <div className="mobile-drawer-banner">
              <span className="banner-pulse" />
              <span>Ayurvedic Panchakarma &amp; Wellness Center</span>
            </div>

            {/* Scrollable Links Container */}
            <nav className="mobile-drawer-body" aria-label="Mobile Navigation Links">
              <div className="mobile-nav-links">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`mobile-nav-item ${isActive ? "is-current" : ""}`}
                      onClick={closeMenu}
                    >
                      <div className="mobile-nav-item-icon">
                        <Icon size={18} />
                      </div>
                      <div className="mobile-nav-item-text">
                        <div className="mobile-nav-item-title">
                          <span>{item.label}</span>
                          {item.badge && (
                            <span className="products-soon-badge">{item.badge}</span>
                          )}
                        </div>
                        <span className="mobile-nav-item-sub">{item.sublabel}</span>
                      </div>
                      <ChevronRight size={16} className="mobile-nav-item-arrow" />
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Drawer Footer with High-Impact CTAs & Clinic Info */}
            <div className="mobile-drawer-footer">
              <Link
                href="/appointment"
                className="mobile-drawer-consult-btn"
                onClick={closeMenu}
              >
                <Calendar size={18} />
                <span>Book Doctor Consultation</span>
              </Link>

              <div className="mobile-drawer-contact-chips">
                <a href="tel:+918852887717" className="mobile-drawer-chip call-chip">
                  <Phone size={15} />
                  <span>Call Clinic</span>
                </a>
                <a
                  href="https://wa.me/918852887717"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mobile-drawer-chip wa-chip"
                >
                  <MessageCircle size={15} />
                  <span>WhatsApp</span>
                </a>
              </div>

              <div className="mobile-drawer-meta">
                <div className="drawer-meta-row">
                  <MapPin size={13} />
                  <span>Beside Birla Hospital, Vidyavihar, Pilani</span>
                </div>
                <div className="drawer-meta-row">
                  <Clock size={13} />
                  <span>Mon – Sat: 9:00 AM – 7:30 PM</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
