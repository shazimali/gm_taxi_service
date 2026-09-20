import { Button, Heading, Section, Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/EmailLayout';

interface RideRescheduledEmailProps {
  booking: any;
  previousPickupDate: string;
  previousPickupTime: string;
  phoneDisplay?: string;
}

export function RideRescheduledEmail({
  booking,
  previousPickupDate,
  previousPickupTime,
  phoneDisplay,
}: RideRescheduledEmailProps) {
  return (
    <EmailLayout previewText={`Reservation Rescheduled #${booking.confirmationNumber}`} phoneDisplay={phoneDisplay}>
      <Section style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '15px', marginBottom: '20px', textAlign: 'center' }}>
        <Text style={{ fontSize: '13px', fontWeight: 'bold', color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
          Reservation Rescheduled
        </Text>
        <Heading style={{ color: '#78350f', fontSize: '24px', margin: '5px 0 0 0', fontFamily: 'monospace' }}>
          #{booking.confirmationNumber}
        </Heading>
      </Section>

      <Text style={{ marginTop: 0 }}>
        Dear <strong>{booking.fullName || 'Valued Passenger'}</strong>,
      </Text>
      <Text>
        The pickup date &amp; time for your <strong>GM Limo Services</strong> reservation below has been updated.
      </Text>

      <Section style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '18px', margin: '20px 0' }}>
        <Text style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 12px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
          Updated Reservation Details
        </Text>

        <table style={{ width: '100%', fontSize: '13px', color: '#334155', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '6px 0', fontWeight: 'bold', width: 140 }}>Service:</td>
              <td style={{ padding: '6px 0' }}>{booking.serviceType || 'Chauffeur Transfer'}</td>
            </tr>
            <tr>
              <td style={{ padding: '6px 0', fontWeight: 'bold' }}>Previous Pickup:</td>
              <td style={{ padding: '6px 0', color: '#94a3b8', textDecoration: 'line-through' }}>
                {previousPickupDate} at {previousPickupTime}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '6px 0', fontWeight: 'bold' }}>New Pickup:</td>
              <td style={{ padding: '6px 0', fontWeight: 600, color: '#0f172a' }}>
                {booking.pickupDate} at {booking.pickupTime}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '6px 0', fontWeight: 'bold' }}>Pickup Location:</td>
              <td style={{ padding: '6px 0' }}>{booking.pickupLocation}</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Text style={{ fontSize: '13px', color: '#64748b' }}>
        All other reservation details remain unchanged. If this new time doesn&apos;t work for you, please contact
        our 24/7 dispatch desk.
      </Text>

      <Section style={{ textAlign: 'center', marginTop: '25px' }}>
        <Button
          href="https://gmlimoservices.com/dashboard"
          style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px' }}
        >
          View My Reservation &rarr;
        </Button>
      </Section>
    </EmailLayout>
  );
}

export default RideRescheduledEmail;
