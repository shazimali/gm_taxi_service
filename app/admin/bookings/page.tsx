'use client';

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { parseStops } from '@/lib/utils/stops';

interface Booking {
  id: string;
  confirmationNumber: string;
  fullName: string;
  email: string;
  phone: string;
  serviceType: string;
  pickupLocation: string;
  dropoffLocation: string | null;
  stops: string | null;
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
  capturedAmount?: number | null;
  createdAt: string;
}

const STATUSES = ['ALL', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const;

// Mirrors DELETABLE_PAYMENT_STATUSES in app/api/admin/bookings/route.ts — a booking
// can only be deleted once any held/captured funds are back with the passenger.
const DELETABLE_PAYMENT_STATUSES = new Set(['PENDING', 'CANCELLED_RELEASED', 'FAILED']);

type RowAction = 'capture' | 'release' | 'delete';

function formatYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function currentMonthRange(): { from: string; to: string } {
  const now = new Date();
  return {
    from: formatYMD(new Date(now.getFullYear(), now.getMonth(), 1)),
    to: formatYMD(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
  };
}

export default function BookingsAdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [rowActions, setRowActions] = useState<Record<string, RowAction>>({});
  const [dateFrom, setDateFrom] = useState<string>(() => currentMonthRange().from);
  const [dateTo, setDateTo] = useState<string>(() => currentMonthRange().to);

  const setRowAction = (id: string, action: RowAction | null) => {
    setRowActions((prev) => {
      const next = { ...prev };
      if (action) next[id] = action;
      else delete next[id];
      return next;
    });
  };

  const fetchBookings = async (from: string, to: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set('dateFrom', from);
      if (to) params.set('dateTo', to);
      const res = await fetch(`/api/admin/bookings?${params.toString()}`, { cache: 'no-store' });
      const data = await res.json();
      if (res.ok) setBookings(data.bookings || []);
    } catch (e) {
      console.error('Failed to load bookings', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(dateFrom, dateTo); }, [dateFrom, dateTo]);

  const applyUpdatedBooking = (updated: Booking) => {
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? { ...b, ...updated } : b)));
  };

  const readErrorMessage = async (res: Response, fallback: string) => {
    try {
      const data = await res.json();
      return data?.error || fallback;
    } catch {
      return fallback;
    }
  };

  const handleCapturePayment = async (bookingId: string) => {
    const result = await Swal.fire({
      icon: 'question',
      title: 'Capture Payment',
      text: 'Passenger has reached destination? Enter what percentage of the held amount to capture — the rest is released back to the passenger.',
      input: 'number',
      inputLabel: 'Capture percentage (%)',
      inputValue: 100,
      inputAttributes: { min: '1', max: '100', step: '1' },
      showCancelButton: true,
      confirmButtonText: 'Capture Payment',
      cancelButtonText: 'Go back',
      confirmButtonColor: '#166534',
      cancelButtonColor: '#64748b',
      reverseButtons: true,
      inputValidator: (value) => {
        const num = Number(value);
        if (!value || !Number.isFinite(num) || num < 1 || num > 100) {
          return 'Enter a percentage between 1 and 100.';
        }
        return undefined;
      },
    });
    if (!result.isConfirmed) return;

    const capturePercent = Number(result.value);

    setRowAction(bookingId, 'capture');
    try {
      const res = await fetch('/api/admin/bookings/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, capturePercent }),
      });
      if (res.ok) {
        const data = await res.json();
        applyUpdatedBooking(data.booking);
        Swal.fire({
          icon: 'success',
          title: 'Payment Captured',
          text: capturePercent < 100
            ? `Captured ${capturePercent}% of the held amount; the remainder was released to the passenger.`
            : 'Payment captured successfully!',
          confirmButtonColor: '#166534',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Capture Failed',
          text: await readErrorMessage(res, 'Failed to capture payment'),
          confirmButtonColor: '#c5a46d',
        });
      }
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Error capturing payment', confirmButtonColor: '#c5a46d' });
    } finally {
      setRowAction(bookingId, null);
    }
  };

  const handleReleaseHold = async (bookingId: string) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Release Hold?',
      text: 'Are you sure you want to release the card hold and cancel this payment?',
      showCancelButton: true,
      confirmButtonText: 'Yes, release hold',
      cancelButtonText: 'Go back',
      confirmButtonColor: '#991b1b',
      cancelButtonColor: '#64748b',
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;

    setRowAction(bookingId, 'release');
    try {
      const res = await fetch('/api/admin/bookings/cancel-hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });
      if (res.ok) {
        const data = await res.json();
        applyUpdatedBooking(data.booking);
        Swal.fire({
          icon: 'success',
          title: 'Hold Released',
          text: 'Card hold released successfully!',
          confirmButtonColor: '#166534',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Release Failed',
          text: await readErrorMessage(res, 'Failed to release hold'),
          confirmButtonColor: '#c5a46d',
        });
      }
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Error releasing hold', confirmButtonColor: '#c5a46d' });
    } finally {
      setRowAction(bookingId, null);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Delete Booking?',
      text: 'Are you sure you want to delete this booking record? This cannot be undone.',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Go back',
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;

    setRowAction(id, 'delete');
    try {
      const res = await fetch(`/api/admin/bookings?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBookings((prev) => prev.filter((b) => b.id !== id));
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Delete Failed',
          text: await readErrorMessage(res, 'Failed to delete booking'),
          confirmButtonColor: '#c5a46d',
        });
      }
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Error deleting booking', confirmButtonColor: '#c5a46d' });
    } finally {
      setRowAction(id, null);
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
          <label className="admin-filter-date">
            From
            <input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </label>
          <label className="admin-filter-date">
            To
            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </label>
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
            const isCaptured = b.paymentStatus === 'CAPTURED';
            const isCancelled = b.paymentStatus === 'CANCELLED_RELEASED' || b.status === 'CANCELLED';
            const isFinal = b.status === 'COMPLETED' || b.status === 'CANCELLED';
            const activeAction = rowActions[b.id];
            const isBusy = Boolean(activeAction);
            const canDelete = DELETABLE_PAYMENT_STATUSES.has(b.paymentStatus || 'PENDING');

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

                  <div className="admin-booking-card__side">
                    {canDelete && (
                      <div className="admin-booking-card__actions">
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="admin-btn--danger"
                          disabled={isBusy}
                        >
                          {activeAction === 'delete' ? <><span className="admin-spinner admin-spinner--dark" /> Deleting…</> : 'Delete'}
                        </button>
                      </div>
                    )}

                    {/* Ride Completion / Cancellation Actions */}
                    <div className="admin-booking-card__payment-actions">
                      {!isFinal && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleCapturePayment(b.id)}
                            className="admin-btn--capture"
                            disabled={isBusy}
                          >
                            {activeAction === 'capture' ? <><span className="admin-spinner" /> Completing…</> : <>✅ Completed</>}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReleaseHold(b.id)}
                            className="admin-btn--release"
                            disabled={isBusy}
                          >
                            {activeAction === 'release' ? <><span className="admin-spinner admin-spinner--dark" /> Cancelling…</> : <>❌ Cancelled</>}
                          </button>
                        </>
                      )}

                      {isCaptured && (
                        <span className="admin-payment-badge admin-payment-badge--captured">
                          ✅ Payment Captured{b.capturedAmount != null ? ` — $${b.capturedAmount.toFixed(2)}` : ''}
                        </span>
                      )}

                      {isCancelled && (
                        <span className="admin-payment-badge admin-payment-badge--cancelled">
                          ❌ Hold Released
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details grid */}
                <div className="admin-booking-card__details">
                  <div>
                    <strong className="admin-booking-card__detail-label">Service Type</strong>
                    {b.serviceType}
                  </div>
                  <div>
                    <strong className="admin-booking-card__detail-label">Pickup Date &amp; Time</strong>
                    {b.pickupDate} at {b.pickupTime}
                  </div>
                  <div>
                    <strong className="admin-booking-card__detail-label">Pickup Location</strong>
                    {b.pickupLocation}
                  </div>
                  {parseStops(b.stops).length > 0 && (
                    <div>
                      <strong className="admin-booking-card__detail-label">Stops</strong>
                      {parseStops(b.stops).map((s, i) => `${i + 1}. ${s}`).join('  ')}
                    </div>
                  )}
                  {b.dropoffLocation && (
                    <div>
                      <strong className="admin-booking-card__detail-label">Drop-off Location</strong>
                      {b.dropoffLocation}
                    </div>
                  )}
                  <div>
                    <strong className="admin-booking-card__detail-label">Passengers / Luggage</strong>
                    {b.passengers} Pax, {b.luggage} Luggage
                  </div>
                  <div>
                    <strong className="admin-booking-card__detail-label">Payment Status</strong>
                    <span style={{ fontWeight: 800, color: b.paymentStatus === 'HOLD_PLACED' ? '#b8860b' : isCaptured ? '#166534' : '#64748b' }}>
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
