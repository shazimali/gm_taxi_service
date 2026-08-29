'use client';

import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'gold' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gold',
  size = 'md',
  className = '',
  style,
  ...props
}) => {
  const variantStyles: Record<
    'gold' | 'success' | 'warning' | 'danger' | 'neutral',
    React.CSSProperties
  > = {
    gold: {
      backgroundColor: 'rgba(197, 164, 109, 0.15)',
      color: '#c5a46d',
      border: '1px solid rgba(197, 164, 109, 0.35)',
    },
    success: {
      backgroundColor: '#dcfce7',
      color: '#15803d',
      border: '1px solid #bbf7d0',
    },
    warning: {
      backgroundColor: '#fefce8',
      color: '#a16207',
      border: '1px solid #fef08a',
    },
    danger: {
      backgroundColor: '#fef2f2',
      color: '#b91c1c',
      border: '1px solid #fecaca',
    },
    neutral: {
      backgroundColor: '#1e293b',
      color: '#94a3b8',
      border: '1px solid #334155',
    },
  };

  const sizeStyles: Record<'sm' | 'md', React.CSSProperties> = {
    sm: { padding: '0.15rem 0.5rem', fontSize: '0.7rem' },
    md: { padding: '0.25rem 0.65rem', fontSize: '0.75rem' },
  };

  return (
    <span
      className={`badge-atom ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        borderRadius: '9999px',
        fontWeight: 700,
        lineHeight: 1,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
};
