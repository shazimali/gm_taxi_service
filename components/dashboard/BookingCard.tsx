// ── BookingCard: Single Responsibility — renders one booking record ─────────────
// and the passenger-initiated actions (cancel / update time) that apply to it.

'use client';

import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';
import { BookingRecord } from './usePassengerDashboard';
import { parseStops } from '@/lib/utils/stops';

const NON_RESCHEDULABLE_STATUSES = new Set(['IN_PROGRESS', 'COMPLETED', 'CANCELLED']);

interface Props {
  booking: BookingRecord;
}

function StatusBadge({ booking }: { booking: BookingRecord }) {
  const isHold      = booking.paymentStatus === 'HOLD_PLACED';
  const isCaptured  = booking.paymentStatus === 'CAPTURED';
  const isCancelled = booking.paymentStatus === 'CANCELLED_RELEASED' || booking.status === 'CANCELLED';

  if (isHold) return (
    <span style={{ backgroundColor: 'rgba(184, 134, 11, 0.12)', color: '#b8860b', border: '1px solid #b8860b', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
      🔒 Hold Placed (Pre-Authorized)
    </span>
  );

  if (isCaptured) return (
    <span style={{ backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
      <CheckCircle2 size={14} /> Completed &amp; Paid
    </span>
  );

  if (isCancelled) return (
    <span style={{ backgroundColor: '#f8fafc', color: '#64748b', border: '1px solid #cbd5e1', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
      ❌ Cancelled / Released
    </span>
  );

  return (
    <span style={{ backgroundColor: '#fefce8', color: '#854d0e', border: '1px solid #fef08a', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
      ⏳ Booking Received
    </span>
  );
}

export function BookingCard({ booking }: Props) {
  const [pendingAction, setPendingAction] = useState<'cancel-request' | 'reschedule' | null>(null);
  const [actionError, setActionError] = useState('');
  const [cancellationRequested, setCancellationRequested] = useState(false);

  const isFinal = booking.status === 'CANCELLED' || booking.status === 'COMPLETED';
  const canCancel = !isFinal;
  const canReschedule = !NON_RESCHEDULABLE_STATUSES.has(booking.status);

  async function requestCancellation() {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: 'Request Cancellation?',
      html:
        '<p style="font-size: 0.85rem; color: #475569; margin: 0 0 12px 0;">' +
        'This sends a cancellation request to our dispatch team for review — it does not cancel the ' +
        'booking or release your payment hold immediately. Our team will follow up shortly.' +
        '</p>' +
        '<textarea id="swal-cancel-reason" class="swal2-textarea" placeholder="Reason for cancelling (optional)" style="margin-top: 0;"></textarea>',
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Send Cancellation Request',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Go back',
      cancelButtonColor: '#64748b',
      reverseButtons: true,
      focusConfirm: false,
      preConfirm: () => (document.getElementById('swal-cancel-reason') as HTMLTextAreaElement)?.value?.trim(),
    });
    if (!isConfirmed) return;

    setActionError('');
    setPendingAction('cancel-request');
    try {
      const res = await fetch('/api/bookings/request-cancellation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id, reason: reason || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit cancellation request.');
      }
      setCancellationRequested(true);
      await Swal.fire({
        icon: 'success',
        title: 'Cancellation Requested',
        text: 'Our dispatch team has been notified and will review your request shortly.',
        confirmButtonColor: '#166534',
      });
    } catch (err: any) {
      setActionError(err.message || 'Failed to submit cancellation request.');
    } finally {
      setPendingAction(null);
    }
  }

  async function updateRideTime() {
    const { value: formValues } = await Swal.fire({
      title: 'Update Pickup Date & Time',
      html:
        `<input id="swal-pickup-date" type="date" class="swal2-input" value="${booking.pickupDate}">` +
        `<input id="swal-pickup-time" type="time" class="swal2-input" value="${booking.pickupTime}">`,
      focusConfirm: false,
      showCancelButton: true,
      cancelButtonText: 'Go back',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Update Time',
      confirmButtonColor: '#b8860b',
      reverseButtons: true,
      preConfirm: () => {
        const pickupDate = (document.getElementById('swal-pickup-date') as HTMLInputElement)?.value;
        const pickupTime = (document.getElementById('swal-pickup-time') as HTMLInputElement)?.value;
        if (!pickupDate || !pickupTime) {
          Swal.showValidationMessage('Please select both a date and a time.');
          return;
        }
        return { pickupDate, pickupTime };
      },
    });
    if (!formValues) return;

    setActionError('');
    setPendingAction('reschedule');
    try {
      const res = await fetch('/api/bookings/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id, ...formValues }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update ride time.');
      }
      await Swal.fire({
        icon: 'success',
        title: 'Pickup Time Updated',
        text: 'Your ride has been rescheduled to the new date and time.',
        confirmButtonColor: '#166534',
      });
      window.location.reload();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update ride time.');
      setPendingAction(null);
    }
  }

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b8860b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Ref: {booking.confirmationNumber}
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0 0 0' }}>
            {booking.serviceType}
          </h3>
        </div>
        <StatusBadge booking={booking} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', fontSize: '0.875rem' }}>
        {[
          { label: 'Pickup Location', value: booking.pickupLocation },
          ...(parseStops(booking.stops).length > 0
            ? [{ label: 'Stops', value: parseStops(booking.stops).map((s, i) => `${i + 1}. ${s}`).join('  ') }]
            : []),
          { label: 'Destination',     value: booking.dropoffLocation || 'City Centre' },
          { label: 'Date & Time',     value: `${booking.pickupDate} at ${booking.pickupTime}` },
        ].map(({ label, value }) => (
          <div key={label}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>{label}</span>
            <strong style={{ color: '#0f172a' }}>{value}</strong>
          </div>
        ))}
        <div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Estimated Fare</span>
          <strong style={{ color: '#b8860b', fontSize: '1.1rem', fontWeight: 800 }}>
            ${booking.estimatedPrice ? booking.estimatedPrice.toFixed(2) : '127.50'}
          </strong>
        </div>
      </div>

      {(canCancel || canReschedule) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
          {canReschedule && (
            <button
              type="button"
              disabled={pendingAction !== null}
              onClick={() => updateRideTime()}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: '#b8860b',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: pendingAction ? 'not-allowed' : 'pointer',
                opacity: pendingAction && pendingAction !== 'reschedule' ? 0.6 : 1,
              }}
            >
              {pendingAction === 'reschedule' ? 'Processing…' : 'Update Time'}
            </button>
          )}
          {canCancel && (
            <button
              type="button"
              disabled={pendingAction !== null || cancellationRequested}
              onClick={() => requestCancellation()}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '10px',
                border: '1px solid #dc2626',
                backgroundColor: '#ffffff',
                color: '#dc2626',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: pendingAction || cancellationRequested ? 'not-allowed' : 'pointer',
                opacity: (pendingAction && pendingAction !== 'cancel-request') || cancellationRequested ? 0.6 : 1,
              }}
            >
              {pendingAction === 'cancel-request'
                ? 'Sending…'
                : cancellationRequested
                ? 'Cancellation Requested'
                : 'Request Cancellation'}
            </button>
          )}
        </div>
      )}

      {actionError && (
        <p style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: 700, marginTop: '0.75rem', marginBottom: 0 }}>
          {actionError}
        </p>
      )}
    </div>
  );
}
