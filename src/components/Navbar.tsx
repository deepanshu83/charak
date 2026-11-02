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
  Sparkles,
  UserCheck,
  Package,
  Heart,
  Video,
  Image as ImageIcon,
  BookOpen,
  MapPin,
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
      icon: Sparkles,
    },
    {
      href: "/doctors",
      label: "Ayurvedic Doctors",
      icon: UserCheck,
    },
    {
      href: "/products",
      label: "Medicines & Formulations",
      icon: Package,
      badge: "Soon",
    },
    {
      href: "/our-approach",
      label: "Our Vedic Approach",
      icon: Heart,
    },
    {
      href: "/patient-stories",
      label: "Patient Stories & Reviews",
      icon: BookOpen,
    },
    {
      href: "/video-testimonials",
      label: "Video Testimonials",
      icon: Video,
    },
    {
      href: "/gallery",
      label: "Clinic & Suites Gallery",
      icon: ImageIcon,
    },
    {
      href: "/blog",
      label: "Ayurvedic Wisdom & Blog",
      icon: BookOpen,
    },
    {
      href: "/#contact",
      label: "Contact & Location",
      icon: MapPin,
    },
    {
      href: "/appointment",
      label: "Book Consultation",
      icon: Calendar,
      highlight: true,
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
              Charak <em>Ayurveda</em>
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

      {/* Mobile Slide-Over Drawer & Backdrop - clean & premium */}
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
                  <span className="drawer-brand-title">Charak <em>Ayurveda</em></span>
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

            {/* Clean & Elegant Scrollable Navigation Links */}
            <nav className="mobile-drawer-body" aria-label="Mobile Navigation Links">
              <div className="mobile-nav-links">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`mobile-nav-item ${isActive ? "is-current" : ""} ${
                        item.highlight ? "is-highlighted" : ""
                      }`}
                      onClick={closeMenu}
                    >
                      <div className="mobile-nav-item-icon">
                        <Icon size={18} />
                      </div>
                      <span className="mobile-nav-item-title">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="products-soon-badge">{item.badge}</span>
                      )}
                      <ChevronRight size={16} className="mobile-nav-item-arrow" />
                    </Link>
                  );
                })}
              </div>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
