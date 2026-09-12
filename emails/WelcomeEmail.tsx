import { Button, Heading, Hr, Section, Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/EmailLayout';

interface WelcomeEmailProps {
  passengerName: string;
  email?: string;
  tempPassword?: string;
  phoneDisplay?: string;
}

export function WelcomeEmail({ passengerName, email, tempPassword, phoneDisplay }: WelcomeEmailProps) {
  return (
    <EmailLayout previewText={`Welcome to GM Limo Services, ${passengerName}!`} phoneDisplay={phoneDisplay}>
      <Heading style={{ color: '#09090b', fontSize: '20px', marginTop: 0 }}>Welcome, {passengerName}!</Heading>
      <Text>
        Thank you for choosing <strong>GM Limo Services</strong>. Your passenger account is now active, giving you
        access to reservations, live chauffeur dispatch tracking, and saved ride receipts.
      </Text>

      {tempPassword && (
        <Section style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '18px', margin: '25px 0' }}>
          <Text style={{ color: '#166534', fontSize: '15px', margin: '0 0 10px 0', fontWeight: 'bold' }}>
            🔑 Your Account Login Credentials
          </Text>
          <Text style={{ fontSize: '13px', color: '#15803d', margin: '0 0 12px 0' }}>
            An account has been automatically created for you so you can review your rides, download receipts, and
            track your chauffeur.
          </Text>
          <table style={{ width: '100%', fontSize: '13px', color: '#1e293b', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px 0', fontWeight: 'bold', width: 120 }}>Email / Login:</td>
                <td style={{ padding: '4px 0', fontFamily: 'monospace', fontSize: '14px' }}>{email || ''}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', fontWeight: 'bold' }}>Temp Password:</td>
                <td style={{ padding: '4px 0', fontFamily: 'monospace', fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>
                  {tempPassword}
                </td>
              </tr>
            </tbody>
          </table>
          <Text style={{ fontSize: '11px', color: '#64748b', margin: '10px 0 0 0' }}>
            * We recommend changing your password after your first login via your Passenger Dashboard.
          </Text>
        </Section>
      )}

      <Section style={{ backgroundColor: '#fafafa', borderLeft: '4px solid #bfa054', padding: '15px', margin: '25px 0' }}>
        <Text style={{ margin: 0, fontSize: '14px' }}>
          <strong>Your Chauffeur Perks:</strong>
        </Text>
        <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '13px', color: '#3f3f46' }}>
          <li>Instant flat-rate price quotes for Logan BOS transfers</li>
          <li>Secure card checkout &amp; automated receipt delivery</li>
          <li>Dedicated executive flight delay &amp; early arrival monitoring</li>
        </ul>
      </Section>

      <Hr style={{ borderColor: '#e4e4e7' }} />

      <Section style={{ textAlign: 'center', marginTop: '25px' }}>
        <Button
          href="https://gmlimoservices.com/dashboard"
          style={{ backgroundColor: '#bfa054', color: '#ffffff', padding: '12px 28px', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px' }}
        >
          Access Passenger Dashboard &rarr;
        </Button>
      </Section>
    </EmailLayout>
  );
}

export default WelcomeEmail;
