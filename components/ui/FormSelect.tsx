'use client';

import React, { forwardRef } from 'react';

export interface FormSelectOption {
  value: string | number;
  label: string;
}

export interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  options?: FormSelectOption[];
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      options,
      children,
      className = '',
      style,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {label && (
          <label
            htmlFor={selectId}
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

        <select
          ref={ref}
          id={selectId}
          required={required}
          className={`form-select ${className}`}
          style={{
            width: '100%',
            height: '46px',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            borderRadius: '10px',
            border: error ? '1px solid #ef4444' : '1px solid #cbd5e1',
            padding: '0 1rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            outline: 'none',
            cursor: 'pointer',
            ...style,
          }}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        {error ? (
          <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}>{error}</span>
        ) : helperText ? (
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{helperText}</span>
        ) : null}
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';
