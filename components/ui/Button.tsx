'use client';

import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'gold',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      style,
      disabled,
      ...props
    },
    ref
  ) => {
    // Base size styles
    const sizeStyles: Record<'sm' | 'md' | 'lg', React.CSSProperties> = {
      sm: { padding: '0.45rem 0.85rem', fontSize: '0.8rem', height: '36px' },
      md: { padding: '0.65rem 1.25rem', fontSize: '0.875rem', height: '46px' },
      lg: { padding: '0.85rem 1.75rem', fontSize: '0.95rem', height: '54px' },
    };

    // Variant styles
    const variantStyles: Record<
      'gold' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger',
      React.CSSProperties
    > = {
      gold: {
        background: 'linear-gradient(135deg, #c5a46d 0%, #a88548 100%)',
        color: '#0b0f17',
        border: 'none',
        boxShadow: '0 4px 14px rgba(197, 164, 109, 0.25)',
      },
      primary: {
        background: '#0f172a',
        color: '#ffffff',
        border: '1px solid #334155',
      },
      secondary: {
        background: 'rgba(255, 255, 255, 0.08)',
        color: '#ffffff',
        border: '1px solid rgba(255, 255, 255, 0.15)',
      },
      outline: {
        background: 'transparent',
        color: '#c5a46d',
        border: '1px solid #c5a46d',
      },
      ghost: {
        background: 'transparent',
        color: '#94a3b8',
        border: 'none',
      },
      danger: {
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        color: '#ffffff',
        border: 'none',
        boxShadow: '0 4px 14px rgba(239, 68, 68, 0.25)',
      },
    };

    const combinedStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      fontWeight: 700,
      borderRadius: '10px',
      cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
      opacity: disabled || isLoading ? 0.7 : 1,
      transition: 'all 0.2s ease',
      textDecoration: 'none',
      width: fullWidth ? '100%' : 'auto',
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...style,
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        style={combinedStyle}
        className={`btn-atom ${className}`}
        {...props}
      >
        {isLoading && <Loader2 size={16} className="animate-spin" />}
        {!isLoading && leftIcon && leftIcon}
        <span>{children}</span>
        {!isLoading && rightIcon && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
