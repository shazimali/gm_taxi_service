'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Car, 
  Sparkles, 
  Plane, 
  CalendarCheck, 
  Settings, 
  ExternalLink,
  MapPin
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin',           label: 'Dashboard',         icon: LayoutDashboard },
  { href: '/admin/fleet',     label: 'Fleet Management',  icon: Car },
  { href: '/admin/services',  label: 'Services Catalog',  icon: Sparkles },
  { href: '/admin/airports',  label: 'Airports & Rates',  icon: Plane },
  { href: '/admin/locations', label: 'Locations',         icon: MapPin },
  { href: '/admin/bookings',  label: 'Customer Bookings', icon: CalendarCheck },
  { href: '/admin/settings',  label: 'Site Settings',     icon: Settings },
];

export default function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <nav className="admin-nav">
      <div className="admin-sidebar__nav-section">Menu</div>
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={`admin-nav__link${isActive(href) ? ' admin-nav__link--active' : ''}`}
        >
          <span className="admin-nav__icon">
            <Icon size={19} />
          </span>
          <span>{label}</span>
        </Link>
      ))}

      <div className="admin-sidebar__nav-section" style={{ marginTop: '1.5rem' }}>Others</div>
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="admin-nav__link"
      >
        <span className="admin-nav__icon">
          <ExternalLink size={19} />
        </span>
        <span>Public Website</span>
      </a>
    </nav>
  );
}
