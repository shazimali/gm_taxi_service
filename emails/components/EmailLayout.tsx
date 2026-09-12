import { Body, Container, Head, Hr, Html, Img, Preview, Section, Text } from '@react-email/components';
import * as React from 'react';

interface EmailLayoutProps {
  previewText: string;
  phoneDisplay?: string;
  children: React.ReactNode;
}

export function EmailLayout({ previewText, phoneDisplay = '(617) 784-0264', children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src="https://gmlimoservices.com/images/logo.png"
              alt="GM Limo Services"
              width={140}
              style={{ margin: '0 auto', display: 'block' }}
            />
          </Section>

          <Section style={bodyContent}>{children}</Section>

          <Hr style={{ borderColor: '#e4e4e7', margin: 0 }} />
          <Section style={footer}>
            <Text style={{ margin: 0, fontSize: '12px', color: '#71717a' }}>
              24/7 Dispatch Hotline: <strong>{phoneDisplay}</strong> | Email: <strong>info@bostonluxurychauffeur.com</strong>
            </Text>
            <Text style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#71717a' }}>
              &copy; {new Date().getFullYear()} GM Limo Services Boston. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const body: React.CSSProperties = {
  backgroundColor: '#f4f4f5',
  fontFamily: 'Arial, sans-serif',
  margin: 0,
  padding: '20px',
  color: '#18181b',
};

const container: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  overflow: 'hidden',
  border: '1px solid #e4e4e7',
};

const header: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '30px',
  textAlign: 'center',
  borderBottom: '3px solid #bfa054',
};

const bodyContent: React.CSSProperties = {
  padding: '30px',
  lineHeight: 1.6,
};

const footer: React.CSSProperties = {
  backgroundColor: '#f4f4f5',
  padding: '20px',
  textAlign: 'center',
};
