'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { BookingSubmissionStatus, PassengerProfile } from './types';
import type { PriceCalculationResult } from '@/lib/services';
import type { FLEET_DATA } from '@/data/fleetData';

interface SuccessViewProps {
  status: BookingSubmissionStatus;
  currentVehiclePrice: PriceCalculationResult;
  passenger: PassengerProfile | null;
  passengerName: string;
  selectedService: string;
  chosenVehicleObj: (typeof FLEET_DATA)[0];
  pickup: string;
  dropoff: string;
  estimatedMiles: number;
  estimatedMinutes: number;
  onReset: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({
  status,
  currentVehiclePrice,
  passenger,
  passengerName,
  selectedService,
  chosenVehicleObj,
  pickup,
  dropoff,
  estimatedMiles,
  estimatedMinutes,
  onReset,
}) => {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '2.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #c5a46d 0%, #a88548 100%)',
          color: '#0b0f17',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 25px rgba(197, 164, 109, 0.3)',
        }}
      >
        <CheckCircle2 size={36} />
      </div>

      <h3
        style={{
          fontFamily: "'Cinzel', 'Playfair Display', serif",
          fontSize: '1.75rem',
          fontWeight: 800,
          color: '#ffffff',
          margin: 0,
        }}
      >
        Reservation Request Submitted!
      </h3>

      <p
        style={{
          color: '#cbd5e1',
          fontSize: '0.9rem',
          maxWidth: '440px',
          lineHeight: 1.6,
          margin: '0 auto',
        }}
      >
        {status.message}
      </p>

      <div
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid rgba(197, 164, 109, 0.3)',
          borderRadius: '14px',
          padding: '1.25rem',
          width: '100%',
          maxWidth: '460px',
          margin: '1rem 0',
          textAlign: 'left',
        }}
      >
        <div
          style={{
            color: '#c5a46d',
            fontSize: '0.8rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>Confirmation Code: {status.confirmationNumber}</span>
          <span
            style={{
              backgroundColor: '#c5a46d',
              color: '#0b0f17',
              padding: '0.2rem 0.6rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
            }}
          >
            Est. Total: ${currentVehiclePrice.totalPrice}
          </span>
        </div>

        <div
          style={{
            color: '#94a3b8',
            fontSize: '0.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
          }}
        >
          <div>
            <strong style={{ color: '#ffffff' }}>Passenger:</strong>{' '}
            {passengerName || passenger?.fullName}
          </div>
          <div>
            <strong style={{ color: '#ffffff' }}>Service:</strong> {selectedService}
          </div>
          <div>
            <strong style={{ color: '#ffffff' }}>Vehicle:</strong> {chosenVehicleObj.name}
          </div>
          <div>
            <strong style={{ color: '#ffffff' }}>Pickup (Start Point):</strong> {pickup}
          </div>
          <div>
            <strong style={{ color: '#ffffff' }}>Destination (End Point):</strong>{' '}
            {dropoff || 'City Centre'}
          </div>
          <div>
            <strong style={{ color: '#ffffff' }}>Distance &amp; Time:</strong> {estimatedMiles}{' '}
            miles ({estimatedMinutes} mins)
          </div>
          <div>
            <strong style={{ color: '#ffffff' }}>Payment Status:</strong> 🔒 Hold Placed (Manual
            Capture)
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="btn btn--gold"
        style={{ padding: '0.75rem 2rem', fontSize: '0.875rem' }}
      >
        Book Another Transfer
      </button>
    </div>
  );
};
