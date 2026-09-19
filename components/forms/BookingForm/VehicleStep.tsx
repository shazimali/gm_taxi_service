'use client';

import { FLEET_DATA } from '@/data/fleetData';
import type { PriceCalculationResult } from '@/lib/services';
import { ArrowRight, Loader2 } from 'lucide-react';
import React from 'react';

interface VehicleStepProps {
  selectedVehicle: string;
  setSelectedVehicle: (slug: string) => void | Promise<void>;
  quoteLoading?: boolean;
  pickup: string;
  dropoff: string;
  estimatedMiles: number;
  estimatedMinutes: number;
  calculateVehiclePrice?: (vehicle: (typeof FLEET_DATA)[0]) => PriceCalculationResult;
  currentVehiclePrice: PriceCalculationResult;
  onBack: () => void;
  onNext: () => void;
}

export const VehicleStep: React.FC<VehicleStepProps> = ({
  selectedVehicle,
  setSelectedVehicle,
  quoteLoading = false,
  pickup,
  dropoff,
  estimatedMiles,
  estimatedMinutes,
  currentVehiclePrice,
  onBack,
  onNext,
}) => {
  const chosenVehicle =
    FLEET_DATA.find((v) => v.slug === selectedVehicle) || FLEET_DATA[0];

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
            Select Vehicle Fleet Tier
          </h3>
          <p style={{ fontSize: '0.825rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>
            Choose your preferred luxury vehicle for the journey
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

      <div className="booking-vehicles-grid">
        {FLEET_DATA.map((vehicle) => {
          const isSelected = selectedVehicle === vehicle.slug;

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
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
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

      {/* Selected Vehicle & Calculated Fare Summary Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(197, 164, 109, 0.35)',
          borderRadius: '12px',
          padding: '0.85rem 1.25rem',
          marginTop: '0.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#c5a46d',
              boxShadow: '0 0 10px #c5a46d',
              flexShrink: 0,
            }}
          />
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>
              Selected Fleet:
            </span>
            <strong style={{ fontSize: '0.95rem' }}>
              {chosenVehicle?.name} <span style={{ color: '#c5a46d', fontWeight: 600 }}>({chosenVehicle?.category})</span>
            </strong>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>
            Calculated Fare:
          </span>
          {quoteLoading ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#c5a46d' }}>
              <Loader2 size={18} className="animate-spin" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Updating fare…</span>
            </span>
          ) : (
            <strong style={{ fontSize: '1.25rem', color: '#c5a46d', fontWeight: 900 }}>
              ${currentVehiclePrice.baseFare.toFixed(2)}
            </strong>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="booking-nav-buttons">
        <button type="button" onClick={onBack} className="booking-nav-back">
          Back
        </button>

        <button
          type="button"
          onClick={onNext}
          className="btn btn--gold"
          disabled={quoteLoading}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {quoteLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" style={{ marginRight: '0.5rem' }} />
              <span>Fetching latest fare…</span>
            </>
          ) : (
            <>
              <span>
                Proceed with {chosenVehicle?.name} — ${currentVehiclePrice.baseFare.toFixed(2)}
              </span>
              <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
