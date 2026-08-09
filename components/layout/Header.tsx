'use client';

import { Car, ChevronDown, CreditCard, LayoutDashboard, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface PassengerUser {
  id: string;
  fullName: string;
  email: string;
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [passenger, setPassenger] = useState<PassengerUser | null>(null);
  const dropdownRef = useRef<HTMLLIElement>(null);

  const pathname = usePathname();
  const router = useRouter();

  // Hide main header on Admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  useEffect(() => {
    fetch('/api/passenger/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.passenger) {
          setPassenger(data.passenger);
        } else {
          setPassenger(null);
        }
      })
      .catch(() => setPassenger(null));
  }, [pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePassengerLogout = async () => {
    await fetch('/api/passenger/auth/logout', { method: 'POST' });
    setPassenger(null);
    setUserDropdownOpen(false);
    router.push('/passenger/login');
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  // Helper to extract passenger initials
  const getInitials = (name: string) => {
    if (!name) return 'P';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0][0].toUpperCase();
  };

  return (
    <header id="masthead" className="site-header" role="banner">
      <div className="site-header__inner container">
        {/* ── Logo / Brand ─────────────────────────────────────────── */}
        <div className="site-branding">
          <Link href="/" className="custom-logo-link" rel="home">
            <img
              src="/images/logo.jpeg"
              alt="GM Limo Services"
              className="custom-logo"
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
              <Link href="/" className={isActive('/') ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
            </li>
            <li className="menu-item">
              <Link href="/about-us" className={isActive('/about-us') ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>
                About
              </Link>
            </li>
            <li className="menu-item">
              <Link href="/services" className={isActive('/services') ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>
                Services
              </Link>
            </li>
            <li className="menu-item">
              <Link href="/fleet" className={isActive('/fleet') ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>
                Our Fleet
              </Link>
            </li>
            <li className="menu-item">
              <Link href="/contact" className={isActive('/contact') ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>
                Contact Us
              </Link>
            </li>



            <li className="menu-item">
              <Link href="/book" className={isActive('/book') ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>
                Book Now
              </Link>
            </li>
            {/* Dynamic Passenger Auth / Profile Picture Dropdown */}
            {passenger ? (
              <li className="menu-item" style={{ position: 'relative' }} ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    background: 'rgba(15, 23, 42, 0.05)',
                    border: '1px solid #e2e8f0',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '30px',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #c5a46d 0%, #a88548 100%)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                    }}
                  >
                    {getInitials(passenger.fullName)}
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#000000' }}>
                    {passenger.fullName.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} style={{ color: '#64748b', transform: userDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      width: '230px',
                      backgroundColor: '#ffffff',
                      borderRadius: '14px',
                      boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
                      border: '1px solid #e2e8f0',
                      padding: '0.5rem 0',
                      zIndex: 1100,
                      animation: 'fadeIn 0.2s ease',
                    }}
                  >
                    {/* User Profile Header */}
                    <div style={{ padding: '0.75rem 1.15rem', borderBottom: '1px solid #f1f5f9' }}>
                      <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 800, color: '#0f172a' }}>
                        {passenger.fullName}
                      </p>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {passenger.email}
                      </p>
                    </div>

                    {/* Navigation Items */}
                    <Link
                      href="/passenger/dashboard"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setMobileMenuOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.65rem 1.15rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        textDecoration: 'none',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <LayoutDashboard size={16} style={{ color: '#c5a46d' }} />
                      <span>Dashboard</span>
                    </Link>

                    <Link
                      href="/passenger/dashboard"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setMobileMenuOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.65rem 1.15rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        textDecoration: 'none',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Car size={16} style={{ color: '#c5a46d' }} />
                      <span>My Rides &amp; Orders</span>
                    </Link>

                    <Link
                      href="/passenger/dashboard"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setMobileMenuOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.65rem 1.15rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        textDecoration: 'none',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <CreditCard size={16} style={{ color: '#c5a46d' }} />
                      <span>Saved Payment Cards</span>
                    </Link>

                    <div style={{ borderTop: '1px solid #f1f5f9', margin: '0.35rem 0' }} />

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setMobileMenuOpen(false);
                        handlePassengerLogout();
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.65rem 1.15rem',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        color: '#dc2626',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </li>
            ) : (
              <li className="menu-item">
                <Link href="/passenger/login" className={isActive('/passenger/login') || isActive('/passenger/register') ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>
                  Login
                </Link>
              </li>
            )}
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
