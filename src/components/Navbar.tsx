"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, ShieldCheck } from "lucide-react";
import { useCart } from "@/lib/cart-store";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { itemCount } = useCart();

  const closeMenu = () => setIsOpen(false);

  return (
    <header id="top">
      <div className="wrap nav">
        <Link href="/" className="logo" onClick={closeMenu}>
          Charak<em>Ayurveda</em>
        </Link>

        <nav id="menu" className={`nav-menu ${isOpen ? "open" : ""}`}>
          <Link href="/treatments" onClick={closeMenu}>
            Treatments
          </Link>
          <Link href="/doctors" onClick={closeMenu}>
            Doctors
          </Link>
          <Link href="/products" onClick={closeMenu}>
            Products
          </Link>
          <Link href="/patient-stories" onClick={closeMenu}>
            Stories
          </Link>
          <Link href="/gallery" onClick={closeMenu}>
            Gallery
          </Link>
          <Link href="/blog" onClick={closeMenu}>
            Blog
          </Link>
          <Link href="/#contact" onClick={closeMenu}>
            Contact
          </Link>

          {/* Mobile-only additional shortcuts inside drawer */}
          <div className="mobile-only-ctas">
            <Link href="/cart" className="btn ghost sm" onClick={closeMenu}>
              <ShoppingBag size={15} />
              <span>Cart ({itemCount})</span>
            </Link>
            <Link href="/appointment" className="btn sm" onClick={closeMenu}>
              Book Consultation
            </Link>
            <Link href="/admin" className="btn ghost sm" onClick={closeMenu}>
              <ShieldCheck size={14} />
              <span>Admin Portal</span>
            </Link>
          </div>
        </nav>

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

          <Link
            href="/admin"
            className="nav-admin-btn"
            id="nav-admin-btn"
            title="Admin Portal"
          >
            Admin
          </Link>
        </div>

        <button
          id="burger"
          aria-label="Menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>
    </header>
  );
}
