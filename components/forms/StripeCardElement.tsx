'use client';

import React from 'react';
import { CardElement } from '@stripe/react-stripe-js';

interface StripeCardElementProps {
  error?: string;
  onChange?: (complete: boolean) => void;
}

export const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#0f172a',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      fontSmoothing: 'antialiased',
      fontSize: '15px',
      '::placeholder': {
        color: '#94a3b8',
      },
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
};

export default function StripeCardElement({ error, onChange }: StripeCardElementProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <label style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0f172a' }}>
        Credit / Debit Card Details (Stripe PCI-Compliant Elements)
      </label>

      <div
        style={{
          padding: '0.9rem 1rem',
          borderRadius: '12px',
          border: error ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
          transition: 'all 0.2s ease',
        }}
      >
        <CardElement
          options={CARD_ELEMENT_OPTIONS}
          onChange={(e) => {
            if (onChange) onChange(e.complete);
          }}
        />
      </div>

      {error && (
        <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}>
          ⚠️ {error}
        </span>
      )}
    </div>
  );
}
