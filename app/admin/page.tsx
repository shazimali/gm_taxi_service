import React from 'react';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Car, Sparkles, Plane, CalendarCheck, ArrowRight } from 'lucide-react';

export default async function AdminDashboardPage() {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    redirect('/admin/login');
  }

  const [vehicleCount, serviceCount, airportCount, bookingCount, recentBookings] =
    await Promise.all([
      prisma.vehicle.count(),
      prisma.service.count(),
      prisma.airport.count(),
      prisma.booking.count(),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2.25rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
          System Dashboard
        </h1>
        <p style={{ color: '#8a99ad', marginTop: '0.35rem', margin: 0, fontSize: '0.925rem' }}>
          Welcome back, {admin.name}. Here is an overview of your fleet, services, and reservations.
        </p>
      </div>

      {/* TailAdmin Stat Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon-wrap">
            <Car size={24} />
          </div>
          <div className="admin-stat-card__value">{vehicleCount}</div>
          <div className="admin-stat-card__label">Total Fleet Vehicles</div>
          <Link href="/admin/fleet" className="admin-stat-card__link">
            <span>Manage Fleet</span> <ArrowRight size={14} />
          </Link>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon-wrap">
            <Sparkles size={24} />
          </div>
          <div className="admin-stat-card__value">{serviceCount}</div>
          <div className="admin-stat-card__label">Active Services</div>
          <Link href="/admin/services" className="admin-stat-card__link">
            <span>Services Catalog</span> <ArrowRight size={14} />
          </Link>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon-wrap">
            <Plane size={24} />
          </div>
          <div className="admin-stat-card__value">{airportCount}</div>
          <div className="admin-stat-card__label">Airports &amp; Hubs</div>
          <Link href="/admin/airports" className="admin-stat-card__link">
            <span>Airport Locations</span> <ArrowRight size={14} />
          </Link>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon-wrap">
            <CalendarCheck size={24} />
          </div>
          <div className="admin-stat-card__value">{bookingCount}</div>
          <div className="admin-stat-card__label">Total Reservations</div>
          <Link href="/admin/bookings" className="admin-stat-card__link">
            <span>View Bookings</span> <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Recent Reservations Table */}
      <div className="admin-content-card">
        <h2 className="admin-content-card__title">Recent Customer Reservations</h2>

        {recentBookings.length === 0 ? (
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
                {recentBookings.map((b) => (
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
    </div>
  );
}
