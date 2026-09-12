import { Button, Heading, Section, Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/EmailLayout';

interface RideCancelledEmailProps {
  booking: any;
  phoneDisplay?: string;
}

export function RideCancelledEmail({ booking, phoneDisplay }: RideCancelledEmailProps) {
  return (
    <EmailLayout previewText={`Reservation Cancelled #${booking.confirmationNumber}`} phoneDisplay={phoneDisplay}>
      <Section style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '15px', marginBottom: '20px', textAlign: 'center' }}>
        <Text style={{ fontSize: '13px', fontWeight: 'bold', color: '#b91c1c', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
          Reservation Cancelled
        </Text>
        <Heading style={{ color: '#991b1b', fontSize: '24px', margin: '5px 0 0 0', fontFamily: 'monospace' }}>
          #{booking.confirmationNumber}
        </Heading>
      </Section>

      <Text style={{ marginTop: 0 }}>
        Dear <strong>{booking.fullName || 'Valued Passenger'}</strong>,
      </Text>
      <Text>
        This confirms that your <strong>GM Limo Services</strong> reservation below has been cancelled and any card
        authorization hold has been released.
      </Text>

      <Section style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '18px', margin: '20px 0' }}>
        <Text style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 12px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
          Cancelled Reservation Details
        </Text>

        <table style={{ width: '100%', fontSize: '13px', color: '#334155', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '6px 0', fontWeight: 'bold', width: 140 }}>Service:</td>
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
          </tbody>
        </table>
      </Section>

      <Text style={{ fontSize: '13px', color: '#64748b' }}>
        🔓 <em>No charge has been made for this reservation. Any pre-authorization hold on your card has been fully
        released.</em>
      </Text>

      <Section style={{ textAlign: 'center', marginTop: '25px' }}>
        <Button
          href="https://gmlimoservices.com/book"
          style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px' }}
        >
          Book a New Ride &rarr;
        </Button>
      </Section>
    </EmailLayout>
  );
}

export default RideCancelledEmail;
