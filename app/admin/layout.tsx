import React from 'react';
import { getAuthenticatedAdmin } from '@/lib/auth';
import AdminNav from './AdminNav';
import LogoutButton from './LogoutButton';
import Link from 'next/link';
import { Search, Bell, Moon } from 'lucide-react';
import './admin.css';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAuthenticatedAdmin();

  // If unauthenticated (e.g. login page), render child without top header and sidebar
  if (!admin) {
    return <div className="admin-body">{children}</div>;
  }

  const initials = admin.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="admin-layout admin-body">
      {/* ── TAILADMIN SIDEBAR ────────────────── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__header">
          <Link href="/admin" style={{ textDecoration: 'none' }}>
            <img
              src="/images/gm-logo-1-1.png"
              alt="GM Limo"
              className="admin-sidebar__logo"
            />
            <span className="admin-sidebar__brand-title">GM Executive Portal</span>
          </Link>
        </div>

        <div className="admin-sidebar__body">
          <AdminNav />
        </div>

        <div style={{ padding: '1.25rem' }}>
          <LogoutButton />
        </div>
      </aside>

      {/* ── TAILADMIN MAIN WRAPPER ───────────── */}
      <div className="admin-main-wrapper">
        {/* Top Header */}
        <header className="admin-header">
          <div className="admin-header__search">
            <Search size={18} color="#64748b" />
            <input
              type="text"
              placeholder="Type to search..."
              className="admin-header__search-input"
            />
          </div>

          <div className="admin-header__right">
            <button className="admin-header__icon-btn" aria-label="Theme toggle">
              <Moon size={18} />
            </button>
            <button className="admin-header__icon-btn" aria-label="Notifications">
              <Bell size={18} />
              <span
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#f43f5e',
                }}
              />
            </button>

            {/* Profile Dropdown Badge */}
            <div className="admin-header__user-profile">
              <div className="admin-header__avatar">{initials}</div>
              <div className="admin-header__user-info">
                <span className="admin-header__user-name">{admin.name}</span>
                <span className="admin-header__user-role">{admin.role || 'Administrator'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
