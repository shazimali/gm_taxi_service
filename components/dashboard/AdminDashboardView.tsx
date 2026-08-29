'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Car, 
  Sparkles, 
  Plane, 
  CalendarCheck, 
  ArrowRight, 
  Search, 
  Moon, 
  Bell 
} from 'lucide-react';
import { UserSession } from '@/lib/auth';
import '@/app/admin/admin.css';
import AdminNav from '@/app/admin/AdminNav';
import LogoutButton from '@/app/admin/LogoutButton';

interface AdminStats {
  vehicleCount: number;
  serviceCount: number;
  airportCount: number;
  bookingCount: number;
  recentBookings: Array<{
    id: string;
    confirmationNumber: string;
    fullName: string;
    phone: string;
    serviceType: string;
    pickupDate: string;
    pickupTime: string;
    status: string;
    estimatedPrice?: number | null;
    paymentStatus?: string;
  }>;
}

export default function AdminDashboardView({
  user,
  stats,
}: {
  user: UserSession;
  stats: AdminStats;
}) {
  const initials = (user.name || 'Admin')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="admin-layout admin-body" style={{ minHeight: '100vh', width: '100%' }}>
      {/* ── TAILADMIN SIDEBAR ────────────────── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__header">
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <img
              src="/images/logo.png"
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
                <span className="admin-header__user-name">{user.name}</span>
                <span className="admin-header__user-role">{user.role || 'Administrator'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-main">
          {/* Header */}
          <div style={{ marginBottom: '2.25rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              System Dashboard
            </h1>
            <p style={{ color: '#64748b', marginTop: '0.35rem', margin: 0, fontSize: '0.925rem' }}>
              Welcome back, {user.name}. Here is an overview of your fleet, services, and reservations.
            </p>
          </div>

          {/* TailAdmin Stat Cards */}
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-card__icon-wrap">
                <Car size={24} />
              </div>
              <div className="admin-stat-card__value">{stats.vehicleCount}</div>
              <div className="admin-stat-card__label">Total Fleet Vehicles</div>
              <Link href="/admin/fleet" className="admin-stat-card__link">
                <span>Manage Fleet</span> <ArrowRight size={14} />
              </Link>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-card__icon-wrap">
                <Sparkles size={24} />
              </div>
              <div className="admin-stat-card__value">{stats.serviceCount}</div>
              <div className="admin-stat-card__label">Active Services</div>
              <Link href="/admin/services" className="admin-stat-card__link">
                <span>Services Catalog</span> <ArrowRight size={14} />
              </Link>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-card__icon-wrap">
                <Plane size={24} />
              </div>
              <div className="admin-stat-card__value">{stats.airportCount}</div>
              <div className="admin-stat-card__label">Airports &amp; Hubs</div>
              <Link href="/admin/airports" className="admin-stat-card__link">
                <span>Airport Locations</span> <ArrowRight size={14} />
              </Link>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-card__icon-wrap">
                <CalendarCheck size={24} />
              </div>
              <div className="admin-stat-card__value">{stats.bookingCount}</div>
              <div className="admin-stat-card__label">Total Reservations</div>
              <Link href="/admin/bookings" className="admin-stat-card__link">
                <span>View Bookings</span> <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Recent Reservations Table */}
          <div className="admin-content-card">
            <h2 className="admin-content-card__title">Recent Customer Reservations</h2>

            {stats.recentBookings.length === 0 ? (
              <p style={{ color: '#8a99ad' }}>No reservation submissions found in the database yet.</p>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead className="admin-table__head">
                    <tr>
                      <th className="admin-table__th">Ref #</th>
                      <th className="admin-table__th">Customer</th>
                      <th className="admin-table__th">Service Type</th>
                      <th className="admin-table__th">Pickup Date</th>
                      <th className="admin-table__th">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentBookings.map((b) => (
                      <tr key={b.id} className="admin-table__tr">
                        <td className="admin-table__td--gold">{b.confirmationNumber}</td>
                        <td className="admin-table__td">
                          <div style={{ fontWeight: 600 }}>{b.fullName}</div>
                          <div className="admin-table__td-sub">{b.phone}</div>
                        </td>
                        <td className="admin-table__td">{b.serviceType}</td>
                        <td className="admin-table__td">
                          {b.pickupDate} {b.pickupTime}
                        </td>
                        <td className="admin-table__td">
                          <span className={`admin-badge admin-badge--${b.status.toLowerCase()}`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
