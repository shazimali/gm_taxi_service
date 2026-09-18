'use client';

import React from 'react';

interface StepIndicatorProps {
  step: number;
}

const STEPS = [
  { n: 1, label: '1. Service' },
  { n: 2, label: '2. Vehicle' },
  { n: 3, label: '3. Confirmation' },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({ step }) => {
  return (
    <div className="booking-step-indicator">
      {STEPS.map((s, i) => (
        <React.Fragment key={s.n}>
          <div
            className="booking-step-indicator__step"
            style={{ color: step >= s.n ? '#c5a46d' : '#64748b' }}
          >
            <div
              className="booking-step-indicator__circle"
              style={{
                background:
                  step >= s.n
                    ? 'linear-gradient(135deg, #c5a46d 0%, #a88548 100%)'
                    : '#1e293b',
                color: step >= s.n ? '#0b0f17' : '#94a3b8',
              }}
            >
              {s.n}
            </div>
            <span>{s.label}</span>
          </div>

          {i < STEPS.length - 1 && (
            <div className="booking-step-indicator__bar">
              <div
                className="booking-step-indicator__bar-fill"
                style={{ width: step > s.n ? '100%' : step === s.n ? '50%' : '0%' }}
              ></div>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
