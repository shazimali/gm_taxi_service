// ── BookingCard: Single Responsibility — renders one booking record ─────────────
// and the passenger-initiated actions (cancel / complete) that apply to it.

'use client';

import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';
import { BookingRecord } from './usePassengerDashboard';

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
  const [pendingAction, setPendingAction] = useState<'cancel' | 'complete' | null>(null);
  const [actionError, setActionError] = useState('');

  const isFinal = booking.status === 'CANCELLED' || booking.status === 'COMPLETED';
  const canCancel = !isFinal;
  const canComplete = !isFinal && booking.paymentStatus === 'HOLD_PLACED';

  async function startStripeAction(action: 'cancel' | 'complete') {
    const confirmation =
      action === 'complete'
        ? {
            title: 'Complete this ride?',
            text: 'This will capture the pre-authorized hold and mark the ride as completed.',
            confirmButtonColor: '#166534',
            confirmButtonText: 'Yes, complete ride',
          }
        : {
            title: 'Cancel this ride?',
            text: 'This will release the pre-authorized hold and cancel the booking.',
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Yes, cancel ride',
          };

    const result = await Swal.fire({
      ...confirmation,
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Go back',
      cancelButtonColor: '#64748b',
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;

    setActionError('');
    setPendingAction(action);
    try {
      const res = await fetch(`/api/bookings/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Failed to ${action} ride.`);
      }
      await Swal.fire({
        icon: 'success',
        title: action === 'complete' ? 'Ride Completed' : 'Ride Cancelled',
        text:
          action === 'complete'
            ? 'The ride has been marked as completed and payment has been captured.'
            : 'The ride has been cancelled and the payment hold has been released.',
        confirmButtonColor: '#166534',
      });
      window.location.reload();
    } catch (err: any) {
      setActionError(err.message || `Failed to ${action} ride.`);
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

      {(canCancel || canComplete) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
          {canComplete && (
            <button
              type="button"
              disabled={pendingAction !== null}
              onClick={() => startStripeAction('complete')}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: '#166534',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: pendingAction ? 'not-allowed' : 'pointer',
                opacity: pendingAction && pendingAction !== 'complete' ? 0.6 : 1,
              }}
            >
              {pendingAction === 'complete' ? 'Processing…' : 'Complete Ride'}
            </button>
          )}
          {canCancel && (
            <button
              type="button"
              disabled={pendingAction !== null}
              onClick={() => startStripeAction('cancel')}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '10px',
                border: '1px solid #dc2626',
                backgroundColor: '#ffffff',
                color: '#dc2626',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: pendingAction ? 'not-allowed' : 'pointer',
                opacity: pendingAction && pendingAction !== 'cancel' ? 0.6 : 1,
              }}
            >
              {pendingAction === 'cancel' ? 'Processing…' : 'Cancel Ride'}
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
