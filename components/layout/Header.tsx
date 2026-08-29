'use client';

import { Car, CreditCard, LayoutDashboard, LogOut, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'PASSENGER';
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const dropdownRef = useRef<HTMLLIElement>(null);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
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

  // Hide main header on Admin management subpages and Admin dashboard
  // NOTE: this guard must stay AFTER all hooks to satisfy the Rules of Hooks
  if (pathname?.startsWith('/admin') || (pathname === '/dashboard' && user?.role === 'ADMIN')) {
    return null;
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setUserDropdownOpen(false);
    router.push('/login');
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  // Helper to extract initials
  const getInitials = (name: string) => {
    if (!name) return 'U';
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
              src="/images/logo.png"
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
              <Link href="/locations" className={isActive('/locations') ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>
                Locations
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

            {/* Dynamic Unified Auth / Profile Picture Dropdown */}
            {user ? (
              <li className="menu-item" style={{ position: 'relative' }} ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-label="Open user menu"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  {/* Initials-only avatar circle */}
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #c5a46d 0%, #a88548 100%)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      letterSpacing: '0.03em',
                      userSelect: 'none',
                    }}
                  >
                    {getInitials(user.name)}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      width: '240px',
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
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 800, color: '#0f172a' }}>
                          {user.name}
                        </p>
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            backgroundColor: user.role === 'ADMIN' ? 'rgba(197, 164, 109, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                            color: user.role === 'ADMIN' ? '#b8860b' : '#2563eb',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '6px',
                          }}
                        >
                          {user.role}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.email}
                      </p>
                    </div>

                    {/* Dashboard link */}
                    <Link
                      href="/dashboard"
                      onClick={() => { setUserDropdownOpen(false); setMobileMenuOpen(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 1.15rem', fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', textDecoration: 'none', transition: 'background 0.15s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <LayoutDashboard size={16} style={{ color: '#c5a46d' }} />
                      <span>{user.role === 'ADMIN' ? 'Admin Dashboard' : 'Passenger Dashboard'}</span>
                    </Link>

                    {/* Role-specific links */}
                    {user.role === 'PASSENGER' ? (
                      <>
                        <Link
                          href="/dashboard"
                          onClick={() => { setUserDropdownOpen(false); setMobileMenuOpen(false); }}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 1.15rem', fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', textDecoration: 'none', transition: 'background 0.15s ease' }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <Car size={16} style={{ color: '#c5a46d' }} />
                          <span>My Rides &amp; Orders</span>
                        </Link>
                        <Link
                          href="/dashboard"
                          onClick={() => { setUserDropdownOpen(false); setMobileMenuOpen(false); }}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 1.15rem', fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', textDecoration: 'none', transition: 'background 0.15s ease' }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <CreditCard size={16} style={{ color: '#c5a46d' }} />
                          <span>Saved Payment Cards</span>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/admin/fleet"
                          onClick={() => { setUserDropdownOpen(false); setMobileMenuOpen(false); }}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 1.15rem', fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', textDecoration: 'none', transition: 'background 0.15s ease' }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <Car size={16} style={{ color: '#c5a46d' }} />
                          <span>Fleet Management</span>
                        </Link>
                        <Link
                          href="/admin/bookings"
                          onClick={() => { setUserDropdownOpen(false); setMobileMenuOpen(false); }}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 1.15rem', fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', textDecoration: 'none', transition: 'background 0.15s ease' }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <Sparkles size={16} style={{ color: '#c5a46d' }} />
                          <span>Customer Bookings</span>
                        </Link>
                      </>
                    )}

                    <div style={{ borderTop: '1px solid #f1f5f9', margin: '0.35rem 0' }} />

                    {/* Sign Out */}
                    <button
                      type="button"
                      onClick={() => { setUserDropdownOpen(false); setMobileMenuOpen(false); handleLogout(); }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 1.15rem', fontSize: '0.875rem', fontWeight: 700, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s ease' }}
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
                <Link href="/login" className={isActive('/login') || isActive('/register') ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>
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
