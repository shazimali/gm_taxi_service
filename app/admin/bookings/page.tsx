'use client';

import React, { useState, useEffect } from 'react';

interface Booking {
  id: string;
  confirmationNumber: string;
  fullName: string;
  email: string;
  phone: string;
  serviceType: string;
  pickupLocation: string;
  dropoffLocation: string | null;
  pickupDate: string;
  pickupTime: string;
  passengers: number;
  luggage: number;
  flightNumber: string | null;
  specialRequests: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

const STATUSES = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const;

export default function BookingsAdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/admin/bookings');
      const data = await res.json();
      if (res.ok) setBookings(data.bookings || []);
    } catch (e) {
      console.error('Failed to load bookings', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        fetchBookings();
      } else {
        alert('Failed to update booking status');
      }
    } catch {
      alert('Error updating status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this booking record?')) return;
    try {
      const res = await fetch(`/api/admin/bookings?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchBookings();
    } catch {
      alert('Error deleting booking');
    }
  };

  const filteredBookings = bookings.filter((b) =>
    filterStatus === 'ALL' ? true : b.status === filterStatus
  );

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">Customer Bookings</h1>
          <p className="admin-page-header__desc">
            Review incoming quote requests, flight info, and manage dispatch status.
          </p>
        </div>

        <div className="admin-filter-bar">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`admin-filter-btn${filterStatus === s ? ' admin-filter-btn--active' : ''}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="admin-loading">Loading reservations…</p>
      ) : filteredBookings.length === 0 ? (
        <div className="admin-empty-state">
          No reservations found for status &quot;{filterStatus}&quot;.
        </div>
      ) : (
        <div className="admin-booking-list">
          {filteredBookings.map((b) => (
            <div key={b.id} className="admin-booking-card">
              <div className="admin-booking-card__top">
                <div>
                  <div className="admin-booking-card__ref-row">
                    <span className="admin-booking-card__ref">{b.confirmationNumber}</span>
                    <span className="admin-booking-card__created">
                      {new Date(b.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="admin-booking-card__name">{b.fullName}</h3>
                  <div className="admin-booking-card__contact">
                    <span>📞 {b.phone}</span>
                    <span>✉️ {b.email}</span>
                  </div>
                </div>

                <div className="admin-booking-card__actions">
                  <select
                    value={b.status}
                    data-status={b.status}
                    onChange={(e) => handleStatusChange(b.id, e.target.value)}
                    className="admin-status-select"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>

                  <button
                    onClick={() => handleDelete(b.id)}
                    className="admin-btn--danger"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Details grid */}
              <div className="admin-booking-card__details">
                <div>
                  <strong className="admin-booking-card__detail-label">Service Type:</strong>
                  {b.serviceType}
                </div>
                <div>
                  <strong className="admin-booking-card__detail-label">Pickup Date &amp; Time:</strong>
                  {b.pickupDate} at {b.pickupTime}
                </div>
                <div>
                  <strong className="admin-booking-card__detail-label">Pickup Location:</strong>
                  {b.pickupLocation}
                </div>
                {b.dropoffLocation && (
                  <div>
                    <strong className="admin-booking-card__detail-label">Drop-off Location:</strong>
                    {b.dropoffLocation}
                  </div>
                )}
                <div>
                  <strong className="admin-booking-card__detail-label">Passengers / Luggage:</strong>
                  {b.passengers} Pax, {b.luggage} Luggage
                </div>
                {b.flightNumber && (
                  <div>
                    <strong className="admin-booking-card__detail-label">Flight Tail/No:</strong>
                    {b.flightNumber}
                  </div>
                )}
              </div>

              {b.specialRequests && (
                <div className="admin-booking-card__requests">
                  <span className="admin-booking-card__requests-label">Special Requests: </span>
                  {b.specialRequests}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
