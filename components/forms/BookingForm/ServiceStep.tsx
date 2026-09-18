'use client';

import React, { useState } from 'react';
import { ArrowRight, Loader2, LocateFixed, MapPin, Plus, X } from 'lucide-react';
import { RouteMapPreview } from './RouteMapPreview';
import { TransferDatePicker } from './TransferDatePicker';
import { TransferTimePicker } from './TransferTimePicker';
import type { StopItem } from './types';

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
  detectingPickupLocation: boolean;
  detectCurrentPickupLocation: () => void;
  showPickupDropdown: boolean;
  setShowPickupDropdown: (val: boolean) => void;
  showDropoffDropdown: boolean;
  setShowDropoffDropdown: (val: boolean) => void;
  pickupContainerRef: React.RefObject<HTMLDivElement | null>;
  dropoffContainerRef: React.RefObject<HTMLDivElement | null>;
  isBothLocationsFinal: boolean;
  stops: StopItem[];
  addStop: () => void;
  removeStop: (id: string) => void;
  updateStop: (id: string, val: string) => void;
  selectStopSuggestion: (id: string, val: string) => void;
  finalizeStopOnBlur: (id: string) => void;
  setShowStopDropdown: (id: string, show: boolean) => void;
  stopContainerRef: (id: string) => (el: HTMLDivElement | null) => void;
  validStops: string[];
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
  fullName: string;
  setFullName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
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
  detectingPickupLocation,
  detectCurrentPickupLocation,
  showPickupDropdown,
  setShowPickupDropdown,
  showDropoffDropdown,
  setShowDropoffDropdown,
  pickupContainerRef,
  dropoffContainerRef,
  isBothLocationsFinal,
  stops,
  addStop,
  removeStop,
  updateStop,
  selectStopSuggestion,
  finalizeStopOnBlur,
  setShowStopDropdown,
  stopContainerRef,
  validStops,
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
  fullName,
  setFullName,
  email,
  setEmail,
  phone,
  setPhone,
  onNext,
}) => {
  const [errors, setErrors] = useState<{
    pickup?: string;
    dropoff?: string;
    pickupDate?: string;
    pickupTime?: string;
    fullName?: string;
    email?: string;
  }>({});

  const clearError = (field: keyof typeof errors) => {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const errorBorderStyle = { borderColor: '#dc2626' };

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
                clearError('pickup');
              }}
              onBlur={() => {
                if (pickup.trim().length >= 3) setPickupFinalized(true);
              }}
              placeholder="Type location, airport, or hotel name..."
              className="form-input"
              style={{ paddingRight: '2.6rem', ...(errors.pickup ? errorBorderStyle : null) }}
            />
            {/* Small icon button for Use My Location */}
            <button
              type="button"
              id="detect-pickup-location-btn"
              onClick={detectCurrentPickupLocation}
              disabled={detectingPickupLocation}
              title="Use my current location"
              aria-label="Use my current location"
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: detectingPickupLocation ? 'rgba(184, 134, 11, 0.12)' : 'transparent',
                color: detectingPickupLocation ? '#b8860b' : '#64748b',
                cursor: detectingPickupLocation ? 'wait' : 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!detectingPickupLocation) {
                  e.currentTarget.style.color = '#b8860b';
                  e.currentTarget.style.backgroundColor = 'rgba(184, 134, 11, 0.12)';
                }
              }}
              onMouseLeave={(e) => {
                if (!detectingPickupLocation) {
                  e.currentTarget.style.color = '#64748b';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {detectingPickupLocation || loadingPickup ? (
                <Loader2 size={16} className="animate-spin" style={{ color: '#b8860b' }} />
              ) : (
                <LocateFixed size={16} />
              )}
            </button>
          </div>

          {errors.pickup && <span className="field-error">{errors.pickup}</span>}

          {/* Pickup Live Search Dropdown */}
          {showPickupDropdown && pickupSuggestions.length > 0 && (
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

        {/* Drop-off Location Field — hidden for Hourly bookings (no fixed destination) */}
        {!selectedService.includes('Hourly') && (
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
                clearError('dropoff');
              }}
              onBlur={() => {
                if (dropoff.trim().length >= 3) setDropoffFinalized(true);
              }}
              placeholder="Type destination, address, or city..."
              className="form-input"
              style={{ paddingRight: '2.5rem', ...(errors.dropoff ? errorBorderStyle : null) }}
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

          {errors.dropoff && <span className="field-error">{errors.dropoff}</span>}

          {/* Dropoff Live Search Dropdown */}
          {showDropoffDropdown && dropoffSuggestions.length > 0 && (
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
        )}
      </div>

      {/* Intermediate Stops — extra pickup/drop points along the ride */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {stops.map((stop, index) => (
          <div key={stop.id} className="form-group" style={{ position: 'relative' }} ref={stopContainerRef(stop.id)}>
            <label className="form-label">Stop {index + 1}</label>
            <div style={{ position: 'relative', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  value={stop.value}
                  onFocus={() => setShowStopDropdown(stop.id, true)}
                  onChange={(e) => updateStop(stop.id, e.target.value)}
                  onBlur={() => finalizeStopOnBlur(stop.id)}
                  placeholder="Type an address to stop along the way..."
                  className="form-input"
                  style={{ paddingRight: '2.5rem' }}
                />
                {stop.loading && (
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

                {/* Stop Live Search Dropdown */}
                {stop.showDropdown && stop.suggestions.length > 0 && (
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
                    {stop.suggestions.map((loc, idx) => (
                      <div
                        key={idx}
                        onClick={() => selectStopSuggestion(stop.id, loc)}
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

              <button
                type="button"
                onClick={() => removeStop(stop.id)}
                title="Remove stop"
                aria-label="Remove stop"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#dc2626',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addStop}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            alignSelf: 'flex-start',
            padding: '0.5rem 0.9rem',
            borderRadius: '8px',
            border: '1px dashed #b8860b',
            backgroundColor: 'transparent',
            color: '#b8860b',
            fontWeight: 700,
            fontSize: '0.825rem',
            cursor: 'pointer',
          }}
        >
          <Plus size={15} />
          <span>Add Stop</span>
        </button>
      </div>

      {/* Interactive Google Map Route Preview */}
      {isBothLocationsFinal && (
        <RouteMapPreview
          pickup={pickup}
          dropoff={dropoff}
          stops={validStops}
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
          <TransferDatePicker
            value={pickupDate}
            onChange={(val) => {
              setPickupDate(val);
              clearError('pickupDate');
            }}
            error={!!errors.pickupDate}
          />
          {errors.pickupDate && <span className="field-error">{errors.pickupDate}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">
            Pickup Time <span className="req">*</span>
          </label>
          <TransferTimePicker
            value={pickupTime}
            onChange={(val) => {
              setPickupTime(val);
              clearError('pickupTime');
            }}
            error={!!errors.pickupTime}
          />
          {errors.pickupTime && <span className="field-error">{errors.pickupTime}</span>}
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

      {/* Contact & Confirmation Details */}
      <div
        style={{
          marginTop: '0.5rem',
          paddingTop: '1.15rem',
          borderTop: '1px solid #e2e8f0',
        }}
      >
        <div
          style={{
            fontSize: '0.85rem',
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <span>Passenger Contact for Live Dispatch &amp; Confirmation</span>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              Full Name <span className="req">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                clearError('fullName');
              }}
              placeholder="e.g. John Doe"
              className="form-input"
              style={errors.fullName ? errorBorderStyle : undefined}
            />
            {errors.fullName && <span className="field-error">{errors.fullName}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Email Address <span className="req">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError('email');
              }}
              placeholder="e.g. john@example.com"
              className="form-input"
              style={errors.email ? errorBorderStyle : undefined}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>
        </div>

        <div className="form-row" style={{ marginTop: '0.5rem' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">
              Mobile Phone Number <span style={{ fontSize: '0.75rem', color: '#64748b' }}>(For chauffeur arrival SMS)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. (617) 784-0264"
              className="form-input"
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          const isHourly = selectedService.includes('Hourly');
          const nextErrors: typeof errors = {};

          if (!pickup.trim()) nextErrors.pickup = 'Please provide a Pickup location.';
          if (!isHourly && !dropoff.trim()) nextErrors.dropoff = 'Please provide a Drop-off destination.';
          if (!pickupDate.trim()) nextErrors.pickupDate = 'Please select a Transfer Date.';
          if (!pickupTime.trim()) nextErrors.pickupTime = 'Please select a Pickup Time.';
          if (!fullName.trim()) nextErrors.fullName = 'Please provide your Full Name.';
          if (!email.trim() || !email.includes('@')) {
            nextErrors.email = 'Please provide a valid Email Address.';
          }

          setErrors(nextErrors);
          if (Object.keys(nextErrors).length > 0) return;

          onNext();
        }}
        className="btn btn--gold btn--full"
        style={{ marginTop: '0.5rem' }}
      >
        <span>Calculate Rate &amp; Select Vehicle</span>
        <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
      </button>
    </div>
  );
};
