'use client';

import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      leftIcon,
      rightIcon,
      isLoading = false,
      className = '',
      style,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {label && (
          <label
            htmlFor={inputId}
            className="form-label"
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#e2e8f0',
              marginBottom: 0,
            }}
          >
            {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
          </label>
        )}

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {leftIcon && (
            <div
              style={{
                position: 'absolute',
                left: '12px',
                display: 'flex',
                alignItems: 'center',
                color: '#94a3b8',
                pointerEvents: 'none',
              }}
            >
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            required={required}
            className={`form-input ${className}`}
            style={{
              width: '100%',
              height: '46px',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              borderRadius: '10px',
              border: error ? '1px solid #ef4444' : '1px solid #cbd5e1',
              padding: leftIcon ? '0 2.5rem' : rightIcon || isLoading ? '0 2.5rem 0 1rem' : '0 1rem',
              fontSize: '0.9rem',
              outline: 'none',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              ...style,
            }}
            {...props}
          />

          {isLoading ? (
            <div style={{ position: 'absolute', right: '12px', color: '#c5a46d' }}>
              <Loader2 size={16} className="animate-spin" />
            </div>
          ) : rightIcon ? (
            <div style={{ position: 'absolute', right: '12px', color: '#94a3b8' }}>
              {rightIcon}
            </div>
          ) : null}
        </div>

        {error ? (
          <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}>{error}</span>
        ) : helperText ? (
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{helperText}</span>
        ) : null}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
