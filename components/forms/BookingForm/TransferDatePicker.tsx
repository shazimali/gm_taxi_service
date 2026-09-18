'use client';

import React, { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import { CalendarDays } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';
import './transfer-date-picker.css';

interface TransferDatePickerProps {
  value: string; // 'yyyy-MM-dd', matches the native <input type="date"> format this replaces
  onChange: (value: string) => void;
  error?: boolean;
}

interface DateInputButtonProps {
  value?: string;
  onClick?: () => void;
  error?: boolean;
}

const DateInputButton = forwardRef<HTMLButtonElement, DateInputButtonProps>(
  ({ value, onClick, error }, ref) => (
    <button
      type="button"
      ref={ref}
      onClick={onClick}
      className={`form-input booking-date-trigger${error ? ' booking-date-trigger--error' : ''}`}
    >
      <span className={value ? undefined : 'booking-date-trigger__placeholder'}>
        {value || 'Select transfer date'}
      </span>
      <CalendarDays size={17} strokeWidth={2} />
    </button>
  )
);
DateInputButton.displayName = 'DateInputButton';

function parseYMD(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function formatYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const today = new Date();
today.setHours(0, 0, 0, 0);

export const TransferDatePicker: React.FC<TransferDatePickerProps> = ({ value, onChange, error }) => {
  return (
    <DatePicker
      selected={parseYMD(value)}
      onChange={(date: Date | null) => date && onChange(formatYMD(date))}
      minDate={today}
      dateFormat="EEE, MMM d, yyyy"
      customInput={<DateInputButton error={error} />}
      calendarClassName="booking-datepicker"
      popperPlacement="bottom-start"
      showPopperArrow={false}
    />
  );
};
