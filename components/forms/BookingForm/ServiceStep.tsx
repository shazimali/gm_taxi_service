'use client';

import React from 'react';
import { ArrowRight, Loader2, MapPin } from 'lucide-react';
import { RouteMapPreview } from './RouteMapPreview';

interface ServiceStepProps {
  selectedService: string;
  setSelectedService: (val: string) => void;
  pickup: string;
  setPickup: (val: string) => void;
  dropoff: string;
  setDropoff: (val: string) => void;
  pickupFinalized: boolean;
  setPickupFinalized: (val: boolean) => void;
  dropoffFinalized: boolean;
  setDropoffFinalized: (val: boolean) => void;
  pickupSuggestions: string[];
  dropoffSuggestions: string[];
  loadingPickup: boolean;
  loadingDropoff: boolean;
  showPickupDropdown: boolean;
  setShowPickupDropdown: (val: boolean) => void;
  showDropoffDropdown: boolean;
  setShowDropoffDropdown: (val: boolean) => void;
  pickupContainerRef: React.RefObject<HTMLDivElement | null>;
  dropoffContainerRef: React.RefObject<HTMLDivElement | null>;
  isBothLocationsFinal: boolean;
  estimatedMiles: number;
  estimatedMinutes: number;
  pickupDate: string;
  setPickupDate: (val: string) => void;
  pickupTime: string;
  setPickupTime: (val: string) => void;
  hourlyCount: number;
  setHourlyCount: (val: number) => void;
  flightNumber: string;
  setFlightNumber: (val: string) => void;
  passengers: number;
  setPassengers: (val: number) => void;
  luggage: number;
  setLuggage: (val: number) => void;
  onNext: () => void;
}

export const ServiceStep: React.FC<ServiceStepProps> = ({
  selectedService,
  setSelectedService,
  pickup,
  setPickup,
  dropoff,
  setDropoff,
  setPickupFinalized,
  setDropoffFinalized,
  pickupSuggestions,
  dropoffSuggestions,
  loadingPickup,
  loadingDropoff,
  showPickupDropdown,
  setShowPickupDropdown,
  showDropoffDropdown,
  setShowDropoffDropdown,
  pickupContainerRef,
  dropoffContainerRef,
  isBothLocationsFinal,
  estimatedMiles,
  estimatedMinutes,
  pickupDate,
  setPickupDate,
  pickupTime,
  setPickupTime,
  hourlyCount,
  setHourlyCount,
  flightNumber,
  setFlightNumber,
  passengers,
  setPassengers,
  luggage,
  setLuggage,
  onNext,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Services Dropdown */}
      <div className="form-group">
        <label className="form-label">
          Select Service <span className="req">*</span>
        </label>
        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          className="form-select"
          style={{
            backgroundColor: '#ffffff',
            color: '#0f172a',
            fontWeight: 700,
            borderColor: '#cbd5e1',
            fontSize: '0.95rem',
            height: '48px',
          }}
        >
          <option value="Airport Transportation">✈️ Airport Transportation</option>
          <option value="Hourly Private Chauffeur">🕐 Hourly Private Chauffeur</option>
          <option value="Long Distance City-to-City Transfer">
            🗺️ Long Distance City-to-City Transfer
          </option>
          <option value="Luxury Chauffeur & Limousine">
            👑 Luxury Chauffeur &amp; Limousine
          </option>
          <option value="Event Limo Service">🎉 Event Limo Service</option>
          <option value="Private Wedding Limo">💒 Private Wedding Limo</option>
        </select>
      </div>

      {/* Live Search Pickup & Dropoff Inputs */}
      <div className="form-row">
        {/* Pickup Location Field */}
        <div className="form-group" style={{ position: 'relative' }} ref={pickupContainerRef}>
          <label className="form-label">
            Pickup Location <span className="req">*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              required
              value={pickup}
              onFocus={() => setShowPickupDropdown(true)}
              onChange={(e) => {
                setPickup(e.target.value);
                setPickupFinalized(false);
                setShowPickupDropdown(true);
              }}
              onBlur={() => {
                if (pickup.trim().length >= 3) setPickupFinalized(true);
              }}
              placeholder="Type location, airport, or hotel name..."
              className="form-input"
              style={{ paddingRight: '2.5rem' }}
            />
            {loadingPickup && (
              <Loader2
                size={16}
                className="animate-spin"
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#c5a46d',
                }}
              />
            )}
          </div>

          {/* Pickup Live Search Dropdown */}
          {showPickupDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 50,
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                marginTop: '4px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                maxHeight: '230px',
                overflowY: 'auto',
              }}
            >
              {pickupSuggestions.map((loc, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setPickup(loc);
                    setPickupFinalized(true);
                    setShowPickupDropdown(false);
                  }}
                  style={{
                    padding: '0.65rem 1rem',
                    fontSize: '0.825rem',
                    color: '#0f172a',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: 500,
                    lineHeight: 1.4,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                >
                  <MapPin size={15} style={{ color: '#b8860b', flexShrink: 0 }} />
                  <span>{loc}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drop-off Location Field */}
        <div className="form-group" style={{ position: 'relative' }} ref={dropoffContainerRef}>
          <label className="form-label">
            Drop-off Location <span className="req">*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              required
              value={dropoff}
              onFocus={() => setShowDropoffDropdown(true)}
              onChange={(e) => {
                setDropoff(e.target.value);
                setDropoffFinalized(false);
                setShowDropoffDropdown(true);
              }}
              onBlur={() => {
                if (dropoff.trim().length >= 3) setDropoffFinalized(true);
              }}
              placeholder="Type destination, address, or city..."
              className="form-input"
              style={{ paddingRight: '2.5rem' }}
            />
            {loadingDropoff && (
              <Loader2
                size={16}
                className="animate-spin"
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#c5a46d',
                }}
              />
            )}
          </div>

          {/* Dropoff Live Search Dropdown */}
          {showDropoffDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 50,
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                marginTop: '4px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                maxHeight: '230px',
                overflowY: 'auto',
              }}
            >
              {dropoffSuggestions.map((loc, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setDropoff(loc);
                    setDropoffFinalized(true);
                    setShowDropoffDropdown(false);
                  }}
                  style={{
                    padding: '0.65rem 1rem',
                    fontSize: '0.825rem',
                    color: '#0f172a',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: 500,
                    lineHeight: 1.4,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                >
                  <MapPin size={15} style={{ color: '#b8860b', flexShrink: 0 }} />
                  <span>{loc}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Interactive Google Map Route Preview */}
      {isBothLocationsFinal && (
        <RouteMapPreview
          pickup={pickup}
          dropoff={dropoff}
          estimatedMiles={estimatedMiles}
          estimatedMinutes={estimatedMinutes}
        />
      )}

      {/* Date, Time & Options */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">
            Transfer Date <span className="req">*</span>
          </label>
          <input
            type="date"
            required
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Pickup Time <span className="req">*</span>
          </label>
          <input
            type="time"
            required
            value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      <div className="form-row">
        {selectedService.includes('Hourly') ? (
          <div className="form-group">
            <label className="form-label">Requested Hours (Min 2 Hrs)</label>
            <select
              value={hourlyCount}
              onChange={(e) => setHourlyCount(Number(e.target.value))}
              className="form-select"
            >
              {[2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 24].map((num) => (
                <option key={num} value={num}>
                  {num} Hours Dedicated Chauffeur
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="form-group">
            <label className="form-label">Flight Tail # (If Airport Pickup)</label>
            <input
              type="text"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              placeholder="e.g. DL 1420 (Flight status tracking)"
              className="form-input"
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Passengers</label>
          <select
            value={passengers}
            onChange={(e) => setPassengers(Number(e.target.value))}
            className="form-select"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((num) => (
              <option key={num} value={num}>
                {num} Passengers
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Luggage Bags</label>
          <select
            value={luggage}
            onChange={(e) => setLuggage(Number(e.target.value))}
            className="form-select"
          >
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <option key={num} value={num}>
                {num} Suitcases
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          if (!pickup || !dropoff || !pickupDate) {
            alert('Please provide Pickup (Start Point), Drop-off (Destination) and Transfer Date.');
            return;
          }
          onNext();
        }}
        className="btn btn--gold btn--full"
        style={{ height: '52px', marginTop: '0.5rem', fontSize: '0.925rem' }}
      >
        <span>Calculate Rate &amp; Select Vehicle</span>
        <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
      </button>
    </div>
  );
};
