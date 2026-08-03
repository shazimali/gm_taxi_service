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
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  stripePaymentIntentId?: string | null;
  paymentStatus?: string | null;
  estimatedPrice?: number | null;
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

  const handleCapturePayment = async (bookingId: string) => {
    if (!confirm('Passenger has reached destination? Confirm capturing held funds now.')) return;
    try {
      const res = await fetch('/api/admin/bookings/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });
      if (res.ok) {
        alert('Payment captured successfully!');
        fetchBookings();
      } else {
        alert('Failed to capture payment');
      }
    } catch {
      alert('Error capturing payment');
    }
  };

  const handleReleaseHold = async (bookingId: string) => {
    if (!confirm('Are you sure you want to release the card hold and cancel this payment?')) return;
    try {
      const res = await fetch('/api/admin/bookings/cancel-hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });
      if (res.ok) {
        alert('Card hold released successfully!');
        fetchBookings();
      } else {
        alert('Failed to release hold');
      }
    } catch {
      alert('Error releasing hold');
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
          <h1 className="admin-page-header__title">Customer Bookings &amp; Payment Holds</h1>
          <p className="admin-page-header__desc">
            Review incoming reservations, track card holds, and capture payment upon ride completion.
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
          {filteredBookings.map((b) => {
            const isHold = b.paymentStatus === 'HOLD_PLACED';
            const isCaptured = b.paymentStatus === 'CAPTURED';
            const isCancelled = b.paymentStatus === 'CANCELLED_RELEASED' || b.status === 'CANCELLED';

            return (
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

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.65rem' }}>
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

                    {/* Stripe Hold & Capture Actions */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {isHold && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleCapturePayment(b.id)}
                            style={{ padding: '0.4rem 0.85rem', backgroundColor: '#166534', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}
                          >
                            💳 Capture Payment
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReleaseHold(b.id)}
                            style={{ padding: '0.4rem 0.85rem', backgroundColor: '#991b1b', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            ❌ Release Hold
                          </button>
                        </>
                      )}

                      {isCaptured && (
                        <span style={{ fontSize: '0.785rem', fontWeight: 800, color: '#166534', backgroundColor: '#f0fdf4', padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                          ✅ Payment Captured
                        </span>
                      )}

                      {isCancelled && (
                        <span style={{ fontSize: '0.785rem', fontWeight: 700, color: '#64748b', backgroundColor: '#f8fafc', padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          ❌ Hold Released
                        </span>
                      )}
                    </div>
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
                  <div>
                    <strong className="admin-booking-card__detail-label">Payment Status:</strong>
                    <span style={{ fontWeight: 800, color: isHold ? '#b8860b' : isCaptured ? '#166534' : '#64748b' }}>
                      {b.paymentStatus || 'PENDING'}
                    </span>
                  </div>
                </div>

                {b.specialRequests && (
                  <div className="admin-booking-card__requests">
                    <span className="admin-booking-card__requests-label">Special Requests: </span>
                    {b.specialRequests}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
