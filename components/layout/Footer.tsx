'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return null;
  }
  return (
    <footer id="colophon" className="site-footer" role="contentinfo">
      <div className="container">
        {/* 4-column Grid */}
        <div className="footer-grid">
          {/* ── COLUMN 1: BRAND & SOCIALS ──────────────────────────── */}
          <div className="footer-col">
            <div className="footer-widget">
              <div className="site-branding" style={{ marginBottom: '1rem' }}>
                <Link href="/" className="custom-logo-link" rel="home">
                  <img
                    src="/images/gm-logo-1-1.png"
                    alt="GM Limo Services"
                    className="custom-logo"
                    style={{ maxHeight: '55px', width: 'auto', display: 'block' }}
                  />
                </Link>
              </div>

              <p className="footer-brand__text">
                Greater Boston’s premier luxury airport transportation and executive chauffeur service.
              </p>

              {/* Payment Badges */}
              <div className="footer-payments" aria-label="Accepted payments">
                <span className="footer-payment-icon">Visa</span>
                <span className="footer-payment-icon">MC</span>
                <span className="footer-payment-icon">Amex</span>
                <span className="footer-payment-icon">Disc</span>
                <span className="footer-payment-icon">Apple</span>
              </div>

              {/* Social Icons (7 platforms) */}
              <div className="footer-socials">
                <a href="#" className="footer-social-link" aria-label="Facebook">
                  <svg viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                </a>
                <a href="#" className="footer-social-link" aria-label="Twitter/X">
                  <svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="#" className="footer-social-link" aria-label="YouTube">
                  <svg viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
                <a href="#" className="footer-social-link" aria-label="Instagram">
                  <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="#" className="footer-social-link" aria-label="Pinterest">
                  <svg viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.886 1.406-5.886s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.204 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.622 0 11.988-5.367 11.988-11.987C24 5.368 18.64 0 12.017 0z"/></svg>
                </a>
                <a href="#" className="footer-social-link" aria-label="LinkedIn">
                  <svg viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
                <a href="#" className="footer-social-link" aria-label="Yelp">
                  <svg viewBox="0 0 24 24"><path d="M12.247 16.486c-.198-.052-.404-.002-.562.133a7.48 7.48 0 01-1.042.756 18.423 18.423 0 01-2.072 1.155c-.266.126-.358.46-.2.723a9.23 9.23 0 001.378 1.834c.189.186.496.195.698.02a18.232 18.232 0 002.359-2.548c.188-.242.062-.59-.228-.669l-.331-.054zm-2.096-7.857a.548.548 0 00-.737.071c-.347.377-.73.72-1.144 1.026a17.84 17.84 0 01-2.616 1.62c-.255.132-.338.455-.181.701a9.266 9.266 0 002.046 2.213c.2.164.502.131.666-.08A18.411 18.411 0 009.68 11.23c.15-.246.012-.577-.257-.69l-.272-.111zm7.843 3.633a18.396 18.396 0 00-3.553.535c-.276.069-.452.339-.402.622a7.1 7.1 0 01.041.748 18.498 18.498 0 01-.25 2.378c-.06.279.143.55.421.579a9.24 9.24 0 002.853-.748c.241-.112.354-.405.25-.662a18.318 18.318 0 00-1.216-2.75c-.116-.217-.4-.326-.642-.257l2.498-.705zm-1.895-7.794a9.243 9.243 0 00-2.482.72c-.22.102-.303.376-.188.59l1.196 2.235c.134.251.458.33.684.167A7.324 7.324 0 0116 8.5v3.136c0 .285.226.518.51.518h.81c.285 0 .518-.233.518-.518V8.5c0-1.895-.417-3.69-1.155-5.312a.542.542 0 00-.737-.256zM5.3 16.32a9.278 9.278 0 00-.28 3.52c.03.284.281.492.565.441a18.25 18.25 0 003.54-1.37c.23-.122.31-.417.18-.636A18.441 18.441 0 007.4 15.63a.543.543 0 00-.726-.2c-.44.24-.87.49-.9 1.09l-.474-.2z"/></svg>
                </a>
              </div>
            </div>
          </div>

          {/* ── COLUMN 2: QUICK LINKS ──────────────────────────────── */}
          <div className="footer-col">
            <div className="footer-widget">
              <h3 className="footer-widget__title">Quick Links</h3>
              <ul>
                <li><Link href="/">Home</Link></li>
                <li><Link href="/about-us">About</Link></li>
                <li><Link href="/fleet">Our Fleet</Link></li>
                <li><Link href="/contact">Contact Us</Link></li>
                <li><Link href="/book">Book Now</Link></li>
              </ul>
            </div>
          </div>

          {/* ── COLUMN 3: SERVICES LINKS ────────────────────────────── */}
          <div className="footer-col">
            <div className="footer-widget">
              <h3 className="footer-widget__title">Services</h3>
              <ul>
                <li><Link href="/services">Airport Transportation</Link></li>
                <li><Link href="/services">Hourly Private Chauffeur</Link></li>
                <li><Link href="/services">Long Distance City-to-City</Link></li>
                <li><Link href="/services">Luxury Chauffeur &amp; Limo</Link></li>
                <li><Link href="/services">Event Limo Service</Link></li>
                <li><Link href="/services">Private Wedding Limo</Link></li>
              </ul>
            </div>
          </div>

          {/* ── COLUMN 4: CONTACT & MAP ────────────────────────────── */}
          <div className="footer-col">
            <div className="footer-widget">
              <h3 className="footer-widget__title">Contact Us</h3>
              <ul className="footer-contact-list" style={{ marginBottom: '0.75rem' }}>
                <li className="footer-contact-item">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                  <a href="tel:16177840264">(617) 784-0264</a>
                </li>
                <li className="footer-contact-item">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span>Boston, Massachusetts, USA</span>
                </li>
              </ul>

              {/* Dark style Google Map */}
              <div className="footer-map-container">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d188582.47702812206!2d-71.12356598501258!3d42.31426467026526!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89e3652d0d3d1147%3A0x7dd23f16be19690!2sBoston%2C%20MA%2C%20USA!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="GM Limo Services Boston Map"
                ></iframe>
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM COPYRIGHT & LINKS ────────────────────────────── */}
        <div className="footer-bottom">
          <div className="footer-bottom__copy">
            &copy; {new Date().getFullYear()} GM Limo Services. All Rights Reserved.
          </div>
          <div className="footer-bottom__links">
            <Link href="/terms">Terms of Service</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/liability">Liability</Link>
          </div>
          <div className="footer-bottom__credits">
            Replicating <a href="https://bostonluxurychauffeur.com" target="_blank" rel="noopener noreferrer">bostonluxurychauffeur.com</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
