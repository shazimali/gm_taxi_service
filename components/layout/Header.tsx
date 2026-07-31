'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <header id="masthead" className="site-header" role="banner">
      <div className="site-header__inner container">
        {/* ── Logo / Brand ─────────────────────────────────────────── */}
        <div className="site-branding">
          <Link href="/" className="custom-logo-link" rel="home">
            <img
              src="/images/gm-logo-1-1.png"
              alt="GM Limo Services"
              className="custom-logo"
              style={{ maxHeight: '55px', width: 'auto', display: 'block' }}
            />
          </Link>
        </div>

        {/* ── Primary Navigation ───────────────────────────────────── */}
        <nav id="site-navigation" className="main-navigation" aria-label="Main menu">
          {/* Hamburger toggle (mobile) */}
          <button
            className={`menu-toggle ${mobileMenuOpen ? 'is-active' : ''}`}
            id="menu-toggle-btn"
            aria-controls="primary-menu"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="menu-toggle__bar"></span>
            <span className="menu-toggle__bar"></span>
            <span className="menu-toggle__bar"></span>
          </button>

          <ul id="primary-menu" className={`nav-menu ${mobileMenuOpen ? 'toggled-on' : ''}`}>
            <li className="menu-item">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            </li>
            <li className="menu-item">
              <Link href="/about-us" onClick={() => setMobileMenuOpen(false)}>About</Link>
            </li>
            <li className="menu-item">
              <Link href="/services" onClick={() => setMobileMenuOpen(false)}>Services</Link>
            </li>
            <li className="menu-item">
              <Link href="/fleet" onClick={() => setMobileMenuOpen(false)}>Our Fleet</Link>
            </li>
            <li className="menu-item">
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>Contact Us</Link>
            </li>
            <li className="menu-item">
              <Link href="/book" onClick={() => setMobileMenuOpen(false)}>Book Now</Link>
            </li>
          </ul>
        </nav>

        {/* ── Header CTA ───────────────────────────────────────────── */}
        <a href="tel:16177840264" className="btn btn--gold btn--two-lines header-cta" id="header-call-btn">
          <span className="btn-subtext">CALL FOR A QUICK QUOTE</span>
          <span className="btn-maintext">(617) 784-0264</span>
        </a>
      </div>
    </header>
  );
}
