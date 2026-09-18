'use client';

import React, { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import { Clock } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';
import './transfer-date-picker.css';

interface TransferTimePickerProps {
  value: string; // 'HH:mm', matches the native <input type="time"> format this replaces
  onChange: (value: string) => void;
  error?: boolean;
}

interface TimeInputButtonProps {
  value?: string;
  onClick?: () => void;
  error?: boolean;
}

const TimeInputButton = forwardRef<HTMLButtonElement, TimeInputButtonProps>(
  ({ value, onClick, error }, ref) => (
    <button
      type="button"
      ref={ref}
      onClick={onClick}
      className={`form-input booking-date-trigger${error ? ' booking-date-trigger--error' : ''}`}
    >
      <span className={value ? undefined : 'booking-date-trigger__placeholder'}>
        {value || 'Select pickup time'}
      </span>
      <Clock size={17} strokeWidth={2} />
    </button>
  )
);
TimeInputButton.displayName = 'TimeInputButton';

function parseHHmm(value: string): Date | null {
  if (!value) return null;
  const [h, m] = value.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date;
}

function formatHHmm(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export const TransferTimePicker: React.FC<TransferTimePickerProps> = ({ value, onChange, error }) => {
  return (
    <DatePicker
      selected={parseHHmm(value)}
      onChange={(date: Date | null) => date && onChange(formatHHmm(date))}
      showTimeSelect
      showTimeSelectOnly
      timeIntervals={15}
      timeCaption="Pickup Time"
      dateFormat="h:mm aa"
      customInput={<TimeInputButton error={error} />}
      calendarClassName="booking-datepicker booking-datepicker--time-only"
      popperPlacement="bottom-start"
      showPopperArrow={false}
    />
  );
};
