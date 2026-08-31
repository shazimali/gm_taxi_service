// ── BookingCard: Single Responsibility — renders one booking record ─────────────
// Closed for modification: extend by passing new props, not by editing internals.

import { CheckCircle2 } from 'lucide-react';
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
    </div>
  );
}
