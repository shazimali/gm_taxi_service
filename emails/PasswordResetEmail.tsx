import { Button, Heading, Section, Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/EmailLayout';

interface PasswordResetEmailProps {
  name: string;
  resetUrl: string;
  phoneDisplay?: string;
}

export function PasswordResetEmail({ name, resetUrl, phoneDisplay }: PasswordResetEmailProps) {
  return (
    <EmailLayout previewText="Reset your GM Limo Services password" phoneDisplay={phoneDisplay}>
      <Heading style={{ color: '#09090b', fontSize: '20px', marginTop: 0 }}>Password Reset Request</Heading>
      <Text>
        Hi {name}, we received a request to reset the password on your <strong>GM Limo Services</strong> account.
        Click the button below to choose a new password.
      </Text>

      <Section style={{ textAlign: 'center', margin: '30px 0' }}>
        <Button
          href={resetUrl}
          style={{ backgroundColor: '#bfa054', color: '#ffffff', padding: '12px 28px', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px' }}
        >
          Reset Your Password &rarr;
        </Button>
      </Section>

      <Text style={{ fontSize: '13px', color: '#71717a' }}>
        This link will expire in 1 hour. If you didn&apos;t request a password reset, you can safely ignore this
        email — your password will remain unchanged.
      </Text>
    </EmailLayout>
  );
}

export default PasswordResetEmail;
