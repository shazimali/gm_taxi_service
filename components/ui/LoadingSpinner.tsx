'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingSpinnerProps {
  size?: number;
  label?: string;
  color?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 24,
  label,
  color = '#c5a46d',
  className = '',
}) => {
  return (
    <div
      className={`flex items-center justify-center gap-2 ${className}`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
    >
      <Loader2 size={size} className="animate-spin" style={{ color }} />
      {label && <span style={{ color, fontSize: '0.875rem', fontWeight: 600 }}>{label}</span>}
    </div>
  );
};
