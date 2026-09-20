import { Button, Heading, Section, Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/EmailLayout';

interface CancellationRequestedEmailProps {
  booking: any;
  reason?: string;
  phoneDisplay?: string;
}

export function CancellationRequestedEmail({ booking, reason, phoneDisplay }: CancellationRequestedEmailProps) {
  return (
    <EmailLayout previewText={`Cancellation Requested #${booking.confirmationNumber}`} phoneDisplay={phoneDisplay}>
      <Section style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '15px', marginBottom: '20px', textAlign: 'center' }}>
        <Text style={{ fontSize: '13px', fontWeight: 'bold', color: '#b91c1c', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
          Passenger Requested Cancellation
        </Text>
        <Heading style={{ color: '#991b1b', fontSize: '24px', margin: '5px 0 0 0', fontFamily: 'monospace' }}>
          #{booking.confirmationNumber}
        </Heading>
      </Section>

      <Text style={{ marginTop: 0 }}>
        <strong>{booking.fullName}</strong> has requested to cancel the reservation below. No hold has been
        released and the booking has not been changed — please review and action this from the admin dashboard.
      </Text>

      <Section style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '18px', margin: '20px 0' }}>
        <Text style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 12px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
          Reservation Details
        </Text>

        <table style={{ width: '100%', fontSize: '13px', color: '#334155', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '6px 0', fontWeight: 'bold', width: 140 }}>Passenger:</td>
              <td style={{ padding: '6px 0' }}>{booking.fullName} ({booking.email})</td>
            </tr>
            <tr>
              <td style={{ padding: '6px 0', fontWeight: 'bold' }}>Service:</td>
              <td style={{ padding: '6px 0' }}>{booking.serviceType || 'Chauffeur Transfer'}</td>
            </tr>
            <tr>
              <td style={{ padding: '6px 0', fontWeight: 'bold' }}>Pickup Date:</td>
              <td style={{ padding: '6px 0', fontWeight: 600, color: '#0f172a' }}>
                {booking.pickupDate} at {booking.pickupTime}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '6px 0', fontWeight: 'bold' }}>Pickup Location:</td>
              <td style={{ padding: '6px 0' }}>{booking.pickupLocation}</td>
            </tr>
            <tr>
              <td style={{ padding: '6px 0', fontWeight: 'bold' }}>Estimated Fare:</td>
              <td style={{ padding: '6px 0' }}>${booking.estimatedPrice ?? 'N/A'}</td>
            </tr>
          </tbody>
        </table>
      </Section>

      {reason && (
        <Section style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '14px 18px', margin: '20px 0' }}>
          <Text style={{ fontSize: '13px', fontWeight: 'bold', color: '#92400e', margin: '0 0 6px 0' }}>
            Passenger&apos;s Reason
          </Text>
          <Text style={{ fontSize: '13px', color: '#334155', margin: 0 }}>{reason}</Text>
        </Section>
      )}

      <Text style={{ fontSize: '13px', color: '#64748b' }}>
        🔒 <em>The card authorization hold remains active until an admin cancels this booking from the dashboard.</em>
      </Text>

      <Section style={{ textAlign: 'center', marginTop: '25px' }}>
        <Button
          href="https://gmlimoservices.com/admin/bookings"
          style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px' }}
        >
          Review in Admin Dashboard &rarr;
        </Button>
      </Section>
    </EmailLayout>
  );
}

export default CancellationRequestedEmail;
