"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  Menu,
  X,
  ChevronRight,
  Calendar,
  Phone,
  MessageCircle,
} from "lucide-react";
import { useCart } from "@/lib/cart-store";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { itemCount } = useCart();
  const pathname = usePathname();

  const closeMenu = () => setIsOpen(false);

  // Automatically close mobile menu when navigating to a new route
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock background scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Support closing menu with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header id="top">
        <div className="wrap nav">
          <Link href="/" className="logo" onClick={closeMenu}>
            Charak<em>Ayurveda</em>
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
            <Link
              href="/cart"
              className="nav-cart-btn"
              id="nav-cart-btn"
              aria-label={`Shopping Cart (${itemCount})`}
            >
              <ShoppingBag size={15} />
              <span>Cart</span>
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </Link>

            <Link href="/appointment" className="btn sm">
              Book Consultation
            </Link>
          </div>

          {/* Mobile Right Controls: Quick Cart + Modern Toggle Button */}
          <div className="mobile-header-actions">
            <Link
              href="/cart"
              className="mobile-cart-icon-btn"
              aria-label={`Shopping Cart (${itemCount} items)`}
              onClick={closeMenu}
            >
              <ShoppingBag size={18} />
              {itemCount > 0 && (
                <span className="mobile-cart-badge">{itemCount}</span>
              )}
            </Link>

            <button
              type="button"
              className="mobile-menu-toggle-btn"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              onClick={() => setIsOpen((prev) => !prev)}
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Slide Drawer & Backdrop */}
        {isOpen && (
          <>
            <div
              className="mobile-nav-backdrop"
              onClick={closeMenu}
              aria-hidden="true"
            />
            <nav className="mobile-nav-drawer" aria-label="Mobile Navigation">
              <div className="mobile-nav-links">
                <Link
                  href="/treatments"
                  className="mobile-nav-link"
                  onClick={closeMenu}
                >
                  <span>Treatments &amp; Therapies</span>
                  <ChevronRight size={16} opacity={0.5} />
                </Link>
                <Link
                  href="/doctors"
                  className="mobile-nav-link"
                  onClick={closeMenu}
                >
                  <span>Our Ayurvedic Doctors</span>
                  <ChevronRight size={16} opacity={0.5} />
                </Link>
                <Link
                  href="/products"
                  className="mobile-nav-link"
                  onClick={closeMenu}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>Medicinal Formulations</span>
                    <span className="products-soon-badge">Soon</span>
                  </span>
                  <ChevronRight size={16} opacity={0.5} />
                </Link>
                <Link
                  href="/patient-stories"
                  className="mobile-nav-link"
                  onClick={closeMenu}
                >
                  <span>Patient Stories &amp; Reviews</span>
                  <ChevronRight size={16} opacity={0.5} />
                </Link>
                <Link
                  href="/gallery"
                  className="mobile-nav-link"
                  onClick={closeMenu}
                >
                  <span>Clinic &amp; Suite Gallery</span>
                  <ChevronRight size={16} opacity={0.5} />
                </Link>
                <Link
                  href="/blog"
                  className="mobile-nav-link"
                  onClick={closeMenu}
                >
                  <span>Ayurvedic Wisdom &amp; Blog</span>
                  <ChevronRight size={16} opacity={0.5} />
                </Link>
                <Link
                  href="/#contact"
                  className="mobile-nav-link"
                  onClick={closeMenu}
                >
                  <span>Contact &amp; Location</span>
                  <ChevronRight size={16} opacity={0.5} />
                </Link>
              </div>

              <div className="mobile-nav-footer">
                <Link
                  href="/appointment"
                  className="mobile-nav-consult-btn"
                  onClick={closeMenu}
                >
                  <Calendar size={17} />
                  <span>Book Consultation</span>
                </Link>

                <div className="mobile-nav-contact-chips">
                  <a href="tel:+918852887717" className="mobile-nav-chip">
                    <Phone size={15} />
                    <span>Call Clinic</span>
                  </a>
                  <a
                    href="https://wa.me/918852887717"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mobile-nav-chip"
                  >
                    <MessageCircle size={15} />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </nav>
          </>
        )}
      </header>
    </>
  );
}
