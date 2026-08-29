'use client';

import React from 'react';

interface StepIndicatorProps {
  step: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ step }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.75rem',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Step 1 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          color: step >= 1 ? '#c5a46d' : '#64748b',
          fontWeight: 700,
          fontSize: '0.875rem',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background:
              step >= 1
                ? 'linear-gradient(135deg, #c5a46d 0%, #a88548 100%)'
                : '#1e293b',
            color: step >= 1 ? '#0b0f17' : '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.85rem',
          }}
        >
          1
        </div>
        <span>1. Service</span>
      </div>

      {/* Bar 1-2 */}
      <div style={{ flex: 1, height: '2px', backgroundColor: '#1e293b', margin: '0 1rem' }}>
        <div
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #c5a46d 0%, #d4af37 100%)',
            width: step === 1 ? '0%' : step === 2 ? '50%' : '100%',
            transition: 'all 0.3s ease',
          }}
        ></div>
      </div>

      {/* Step 2 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          color: step >= 2 ? '#c5a46d' : '#64748b',
          fontWeight: 700,
          fontSize: '0.875rem',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background:
              step >= 2
                ? 'linear-gradient(135deg, #c5a46d 0%, #a88548 100%)'
                : '#1e293b',
            color: step >= 2 ? '#0b0f17' : '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.85rem',
          }}
        >
          2
        </div>
        <span>2. Vehicle</span>
      </div>

      {/* Bar 2-3 */}
      <div style={{ flex: 1, height: '2px', backgroundColor: '#1e293b', margin: '0 1rem' }}>
        <div
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #c5a46d 0%, #d4af37 100%)',
            width: step === 3 ? '100%' : '0%',
            transition: 'all 0.3s ease',
          }}
        ></div>
      </div>

      {/* Step 3 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          color: step >= 3 ? '#c5a46d' : '#64748b',
          fontWeight: 700,
          fontSize: '0.875rem',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background:
              step >= 3
                ? 'linear-gradient(135deg, #c5a46d 0%, #a88548 100%)'
                : '#1e293b',
            color: step >= 3 ? '#0b0f17' : '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.85rem',
          }}
        >
          3
        </div>
        <span>3. Confirmation</span>
      </div>
    </div>
  );
};
