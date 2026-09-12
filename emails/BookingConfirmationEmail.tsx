import { Button, Heading, Section, Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/EmailLayout';

interface BookingConfirmationEmailProps {
  booking: any;
  phoneDisplay?: string;
}

export function BookingConfirmationEmail({ booking, phoneDisplay }: BookingConfirmationEmailProps) {
  const priceDisplay = booking.estimatedPrice != null ? `$${Number(booking.estimatedPrice).toFixed(2)}` : 'Flat Rate / Pending';

  return (
    <EmailLayout previewText={`Reservation Confirmed #${booking.confirmationNumber}`} phoneDisplay={phoneDisplay}>
      <Section style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '15px', marginBottom: '20px', textAlign: 'center' }}>
        <Text style={{ fontSize: '13px', fontWeight: 'bold', color: '#047857', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
          Reservation Confirmed
        </Text>
        <Heading style={{ color: '#065f46', fontSize: '24px', margin: '5px 0 0 0', fontFamily: 'monospace' }}>
          #{booking.confirmationNumber}
        </Heading>
      </Section>

      <Text style={{ marginTop: 0 }}>
        Dear <strong>{booking.fullName || 'Valued Passenger'}</strong>,
      </Text>
      <Text>
        Thank you for booking with <strong>GM Limo Services</strong>. Your luxury chauffeur reservation has been
        received and our 24/7 dispatch desk is managing your itinerary.
      </Text>

      <Section style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '18px', margin: '20px 0' }}>
        <Text style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 12px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
          Trip Itinerary &amp; Details
        </Text>

        <table style={{ width: '100%', fontSize: '13px', color: '#334155', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '6px 0', fontWeight: 'bold', width: 140 }}>Service:</td>
              <td style={{ padding: '6px 0' }}>{booking.serviceType || 'Chauffeur Transfer'}</td>
            </tr>
            {booking.vehicleSlug && (
              <tr>
                <td style={{ padding: '6px 0', fontWeight: 'bold' }}>Fleet Tier:</td>
                <td style={{ padding: '6px 0', textTransform: 'capitalize' }}>{String(booking.vehicleSlug).replace(/-/g, ' ')}</td>
              </tr>
            )}
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
            {booking.dropoffLocation && (
              <tr>
                <td style={{ padding: '6px 0', fontWeight: 'bold' }}>Drop-off:</td>
                <td style={{ padding: '6px 0' }}>{booking.dropoffLocation}</td>
              </tr>
            )}
            {booking.flightNumber && (
              <tr>
                <td style={{ padding: '6px 0', fontWeight: 'bold' }}>Flight Tail #:</td>
                <td style={{ padding: '6px 0' }}>{booking.flightNumber}</td>
              </tr>
            )}
            <tr>
              <td style={{ padding: '6px 0', fontWeight: 'bold' }}>Passengers / Bags:</td>
              <td style={{ padding: '6px 0' }}>
                {booking.passengers ?? 1} Passengers, {booking.luggage ?? 1} Luggage
              </td>
            </tr>
            <tr style={{ borderTop: '1px dashed #cbd5e1' }}>
              <td style={{ padding: '10px 0 4px 0', fontWeight: 'bold', fontSize: '14px', color: '#0f172a' }}>Authorized Hold / Total:</td>
              <td style={{ padding: '10px 0 4px 0', fontWeight: 800, fontSize: '16px', color: '#b8860b' }}>{priceDisplay}</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Text style={{ fontSize: '13px', color: '#64748b' }}>
        🔒 <em>Note: Your card authorization hold secures your vehicle and dedicated chauffeur. Payment is only
        finalized once your journey is safely completed.</em>
      </Text>

      <Section style={{ textAlign: 'center', marginTop: '25px' }}>
        <Button
          href="https://gmlimoservices.com/dashboard"
          style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px' }}
        >
          View Reservation in Portal &rarr;
        </Button>
      </Section>
    </EmailLayout>
  );
}

export default BookingConfirmationEmail;
