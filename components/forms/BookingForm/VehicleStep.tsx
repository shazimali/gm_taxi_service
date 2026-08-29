'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { FLEET_DATA } from '@/data/fleetData';
import type { PriceCalculationResult } from '@/lib/services';

interface VehicleStepProps {
  selectedVehicle: string;
  setSelectedVehicle: (slug: string) => void;
  pickup: string;
  dropoff: string;
  estimatedMiles: number;
  estimatedMinutes: number;
  calculateVehiclePrice: (vehicle: (typeof FLEET_DATA)[0]) => PriceCalculationResult;
  currentVehiclePrice: PriceCalculationResult;
  onBack: () => void;
  onNext: () => void;
}

export const VehicleStep: React.FC<VehicleStepProps> = ({
  selectedVehicle,
  setSelectedVehicle,
  pickup,
  dropoff,
  estimatedMiles,
  estimatedMinutes,
  calculateVehiclePrice,
  currentVehiclePrice,
  onBack,
  onNext,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.5rem',
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            Select Vehicle &amp; System Calculated Price
          </h3>
          <p style={{ fontSize: '0.825rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>
            Calculated for {estimatedMiles} miles / {estimatedMinutes} mins route from {pickup} to{' '}
            {dropoff}
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          style={{
            color: '#c5a46d',
            fontSize: '0.8rem',
            fontWeight: 700,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          ← Edit Route
        </button>
      </div>

      <div
        className="booking-vehicles-grid"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}
      >
        {FLEET_DATA.map((vehicle) => {
          const isSelected = selectedVehicle === vehicle.slug;
          const priceInfo = calculateVehiclePrice(vehicle);

          return (
            <div
              key={vehicle.id}
              onClick={() => setSelectedVehicle(vehicle.slug)}
              style={{
                backgroundColor: '#ffffff',
                border: isSelected ? '2px solid #b8860b' : '1px solid #e2e8f0',
                borderRadius: '16px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isSelected
                  ? '0 10px 30px rgba(184, 134, 11, 0.22)'
                  : '0 4px 15px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div
                style={{
                  height: '155px',
                  overflow: 'hidden',
                  position: 'relative',
                  backgroundColor: '#0b0f17',
                }}
              >
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {/* Calculated Price Badge */}
                <span
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: 'rgba(11, 15, 23, 0.92)',
                    color: '#c5a46d',
                    border: '1px solid rgba(197, 164, 109, 0.5)',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    padding: '0.35rem 0.75rem',
                    borderRadius: '20px',
                    backdropFilter: 'blur(6px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                  }}
                >
                  ${priceInfo.totalPrice}
                </span>

                {isSelected && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      backgroundColor: '#b8860b',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '20px',
                      textTransform: 'uppercase',
                    }}
                  >
                    ✓ Selected
                  </span>
                )}
              </div>

              <div style={{ padding: '1.25rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.35rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      color: '#b8860b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {vehicle.category}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                    {priceInfo.formulaLabel}
                  </span>
                </div>

                <h4
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    margin: '0 0 0.25rem 0',
                  }}
                >
                  {vehicle.name}
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0 0 0.85rem 0' }}>
                  {vehicle.model}
                </p>

                <div
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    fontSize: '0.8rem',
                    color: '#334155',
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  <span>👥 {vehicle.passengerCapacity} Passengers</span>
                  <span>🧳 {vehicle.luggageCapacity} Bags</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            flex: 1,
            height: '50px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            borderRadius: '10px',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          Back
        </button>

        <button
          type="button"
          onClick={onNext}
          className="btn btn--gold"
          style={{ flex: 2, height: '50px', fontSize: '0.9rem' }}
        >
          <span>Proceed to Payment Hold (${currentVehiclePrice.totalPrice})</span>
          <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
        </button>
      </div>
    </div>
  );
};
