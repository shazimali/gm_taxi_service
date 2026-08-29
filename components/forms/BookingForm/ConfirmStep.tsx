'use client';

import React from 'react';
import {
  AlertCircle,
  CreditCard,
  Lock,
  LogIn,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import type { PassengerProfile, SavedCard } from './types';
import type { PriceCalculationResult } from '@/lib/services';
import type { FLEET_DATA } from '@/data/fleetData';

interface ConfirmStepProps {
  passenger: PassengerProfile | null;
  selectedService: string;
  chosenVehicleObj: (typeof FLEET_DATA)[0];
  estimatedMiles: number;
  estimatedMinutes: number;
  currentVehiclePrice: PriceCalculationResult;
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  authError: string;
  setAuthError: (err: string) => void;
  authLoading: boolean;
  loginEmail: string;
  setLoginEmail: (val: string) => void;
  loginPassword: string;
  setLoginPassword: (val: string) => void;
  regFullName: string;
  setRegFullName: (val: string) => void;
  regEmail: string;
  setRegEmail: (val: string) => void;
  regPassword: string;
  setRegPassword: (val: string) => void;
  regPhone: string;
  setRegPhone: (val: string) => void;
  passengerName: string;
  setPassengerName: (val: string) => void;
  passengerEmail: string;
  setPassengerEmail: (val: string) => void;
  passengerPhone: string;
  setPassengerPhone: (val: string) => void;
  specialRequests: string;
  setSpecialRequests: (val: string) => void;
  savedCards: SavedCard[];
  selectedCardId: string;
  setSelectedCardId: (id: string) => void;
  newCardNumber: string;
  setNewCardNumber: (val: string) => void;
  newCardExp: string;
  setNewCardExp: (val: string) => void;
  newCardCvc: string;
  setNewCardCvc: (val: string) => void;
  status: { error?: string };
  loading: boolean;
  onPassengerLogin: (e: React.FormEvent) => Promise<void>;
  onPassengerRegister: (e: React.FormEvent) => Promise<void>;
  onSubmitReservation: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onBack: () => void;
}

export const ConfirmStep: React.FC<ConfirmStepProps> = ({
  passenger,
  selectedService,
  chosenVehicleObj,
  estimatedMiles,
  estimatedMinutes,
  currentVehiclePrice,
  authMode,
  setAuthMode,
  authError,
  setAuthError,
  authLoading,
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  regFullName,
  setRegFullName,
  regEmail,
  setRegEmail,
  regPassword,
  setRegPassword,
  regPhone,
  setRegPhone,
  passengerName,
  setPassengerName,
  passengerEmail,
  setPassengerEmail,
  passengerPhone,
  setPassengerPhone,
  specialRequests,
  setSpecialRequests,
  savedCards,
  selectedCardId,
  setSelectedCardId,
  newCardNumber,
  setNewCardNumber,
  newCardExp,
  setNewCardExp,
  newCardCvc,
  setNewCardCvc,
  status,
  loading,
  onPassengerLogin,
  onPassengerRegister,
  onSubmitReservation,
  onBack,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.25rem',
        }}
      >
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
          Passenger Verification &amp; Payment Hold
        </h3>
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
          ← Change Vehicle
        </button>
      </div>

      {/* Trip Summary Badge */}
      <div
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(197, 164, 109, 0.4)',
          borderRadius: '14px',
          padding: '1.15rem 1.35rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.85rem',
        }}
      >
        <div>
          <span
            style={{
              color: '#94a3b8',
              textTransform: 'uppercase',
              fontSize: '0.7rem',
              fontWeight: 700,
              display: 'block',
            }}
          >
            Trip Service
          </span>
          <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>{selectedService}</strong>
        </div>

        <div>
          <span
            style={{
              color: '#94a3b8',
              textTransform: 'uppercase',
              fontSize: '0.7rem',
              fontWeight: 700,
              display: 'block',
            }}
          >
            Selected Fleet
          </span>
          <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>{chosenVehicleObj.name}</strong>
        </div>

        <div>
          <span
            style={{
              color: '#94a3b8',
              textTransform: 'uppercase',
              fontSize: '0.7rem',
              fontWeight: 700,
              display: 'block',
            }}
          >
            Route Matrix
          </span>
          <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>
            {estimatedMiles} miles ({estimatedMinutes} mins)
          </strong>
        </div>

        <div>
          <span
            style={{
              color: '#94a3b8',
              textTransform: 'uppercase',
              fontSize: '0.7rem',
              fontWeight: 700,
              display: 'block',
            }}
          >
            Calculated Total Fare
          </span>
          <strong style={{ color: '#c5a46d', fontSize: '1.15rem', fontWeight: 800 }}>
            ${currentVehiclePrice.totalPrice}
          </strong>
        </div>
      </div>

      {/* ── CASE 1: PASSENGER NOT LOGGED IN ──────────────── */}
      {!passenger ? (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.75rem',
            border: '1px solid #cbd5e1',
            boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              marginBottom: '1.25rem',
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: '0.75rem',
            }}
          >
            <Lock size={20} color="#b8860b" />
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Passenger Login Required to Complete Payment Hold
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
                Sign in to use your saved cards or register a new passenger account.
              </p>
            </div>
          </div>

          {/* Auth Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              backgroundColor: '#f8fafc',
              padding: '0.35rem',
              borderRadius: '10px',
              marginBottom: '1.25rem',
              border: '1px solid #e2e8f0',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setAuthError('');
              }}
              style={{
                flex: 1,
                padding: '0.6rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: authMode === 'login' ? '#ffffff' : 'transparent',
                color: authMode === 'login' ? '#b8860b' : '#64748b',
                boxShadow: authMode === 'login' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
              }}
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setAuthError('');
              }}
              style={{
                flex: 1,
                padding: '0.6rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: authMode === 'register' ? '#ffffff' : 'transparent',
                color: authMode === 'register' ? '#b8860b' : '#64748b',
                boxShadow: authMode === 'register' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
              }}
            >
              <UserPlus size={15} />
              <span>Register Account</span>
            </button>
          </div>

          {authError && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                padding: '0.75rem',
                borderRadius: '10px',
                fontSize: '0.825rem',
                marginBottom: '1rem',
                fontWeight: 600,
              }}
            >
              ⚠️ {authError}
            </div>
          )}

          {/* Form: Sign In */}
          {authMode === 'login' && (
            <form
              onSubmit={onPassengerLogin}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div className="form-group">
                <label className="form-label" style={{ color: '#0f172a' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g. john@example.com"
                  className="form-input"
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    borderColor: '#cbd5e1',
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#0f172a' }}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input"
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    borderColor: '#cbd5e1',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="btn btn--gold"
                style={{
                  height: '48px',
                  fontSize: '0.9rem',
                  width: '100%',
                  marginTop: '0.25rem',
                }}
              >
                {authLoading ? 'Signing in...' : 'Sign In & Continue to Payment Hold'}
              </button>
            </form>
          )}

          {/* Form: Register */}
          {authMode === 'register' && (
            <form
              onSubmit={onPassengerRegister}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div className="form-group">
                <label className="form-label" style={{ color: '#0f172a' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="e.g. John Smith"
                  className="form-input"
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    borderColor: '#cbd5e1',
                  }}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" style={{ color: '#0f172a' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="form-input"
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      borderColor: '#cbd5e1',
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ color: '#0f172a' }}>
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="(617) 784-0264"
                    className="form-input"
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      borderColor: '#cbd5e1',
                    }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#0f172a' }}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="form-input"
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    borderColor: '#cbd5e1',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="btn btn--gold"
                style={{
                  height: '48px',
                  fontSize: '0.9rem',
                  width: '100%',
                  marginTop: '0.25rem',
                }}
              >
                {authLoading ? 'Creating Account...' : 'Register & Continue to Payment Hold'}
              </button>
            </form>
          )}
        </div>
      ) : (
        /* ── CASE 2: PASSENGER ALREADY LOGGED IN ──────────── */
        <form
          onSubmit={onSubmitReservation}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        >
          {/* Logged-in Passenger Info Badge */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#b8860b',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                }}
              >
                {passenger.fullName ? passenger.fullName.substring(0, 2).toUpperCase() : 'PS'}
              </div>
              <div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: '#64748b',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  Verified Passenger Account
                </span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {passenger.fullName} ({passenger.email})
                </h4>
              </div>
            </div>

            <span
              style={{
                backgroundColor: '#dcfce7',
                color: '#15803d',
                border: '1px solid #bbf7d0',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.25rem 0.65rem',
                borderRadius: '20px',
              }}
            >
              ✓ Authenticated
            </span>
          </div>

          {status.error && (
            <div className="contact-alert contact-alert--error">
              <AlertCircle size={20} className="contact-alert__icon" />
              <span>{status.error}</span>
            </div>
          )}

          {/* Passenger Contact Inputs */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Full Name <span className="req">*</span>
              </label>
              <input
                type="text"
                required
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Email Address <span className="req">*</span>
              </label>
              <input
                type="email"
                required
                value={passengerEmail}
                onChange={(e) => setPassengerEmail(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Mobile Phone Number <span className="req">*</span>
              </label>
              <input
                type="tel"
                required
                value={passengerPhone}
                onChange={(e) => setPassengerPhone(e.target.value)}
                placeholder="(617) 784-0264"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Special Requests or Child Seat</label>
              <input
                type="text"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="e.g. Quiet ride, infant rear-facing seat"
                className="form-input"
              />
            </div>
          </div>

          {/* ── SAVED CARDS VS NEW CARD SELECTION ────────────── */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '1px solid #cbd5e1',
              boxShadow: '0 8px 25px rgba(0,0,0,0.06)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
                borderBottom: '1px solid #f1f5f9',
                paddingBottom: '0.75rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#0f172a',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                }}
              >
                <CreditCard size={18} color="#b8860b" />
                <span>
                  Select Card for Pre-Authorization Hold (${currentVehiclePrice.totalPrice})
                </span>
              </div>
            </div>

            {/* Pre-Authorization Hold Explanatory Banner */}
            <div
              style={{
                backgroundColor: '#fefce8',
                border: '1px solid #fef08a',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem',
              }}
            >
              <Lock size={18} color="#b8860b" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.8rem', color: '#713f12', lineHeight: 1.5 }}>
                <strong>🔒 Payment Pre-Authorization Hold:</strong> Your card will be authorized for{' '}
                <strong>${currentVehiclePrice.totalPrice}</strong>. Funds are locked in reserve and{' '}
                <strong>NOT charged</strong> until your ride is completed by your chauffeur.
              </div>
            </div>

            {/* Saved Cards List */}
            {savedCards.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  marginBottom: '1.25rem',
                }}
              >
                <label
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Saved Cards in Your Account
                </label>

                {savedCards.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => setSelectedCardId(card.id)}
                    style={{
                      padding: '0.85rem 1.15rem',
                      borderRadius: '12px',
                      border: selectedCardId === card.id ? '2px solid #b8860b' : '1px solid #cbd5e1',
                      backgroundColor: selectedCardId === card.id ? '#fefce8' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: '2px solid #b8860b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {selectedCardId === card.id && (
                          <div
                            style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              backgroundColor: '#b8860b',
                            }}
                          />
                        )}
                      </div>
                      <div>
                        <strong style={{ color: '#0f172a', fontSize: '0.9rem', display: 'block' }}>
                          💳 {card.brand ? card.brand.toUpperCase() : 'CARD'} •••• {card.last4}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Expires {card.expMonth}/{card.expYear}
                        </span>
                      </div>
                    </div>

                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b8860b' }}>
                      {selectedCardId === card.id ? '✓ Selected for Hold' : 'Use Card'}
                    </span>
                  </div>
                ))}

                {/* Option: Add New Card */}
                <div
                  onClick={() => setSelectedCardId('new')}
                  style={{
                    padding: '0.85rem 1.15rem',
                    borderRadius: '12px',
                    border: selectedCardId === 'new' ? '2px solid #b8860b' : '1px dashed #cbd5e1',
                    backgroundColor: selectedCardId === 'new' ? '#fefce8' : '#f8fafc',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: '2px solid #b8860b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {selectedCardId === 'new' && (
                      <div
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: '#b8860b',
                        }}
                      />
                    )}
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                    ➕ Add Different Credit / Debit Card for This Ride
                  </span>
                </div>
              </div>
            ) : null}

            {/* New Card Form (Shown if no saved cards or user selects 'new') */}
            {(savedCards.length === 0 || selectedCardId === 'new') && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  marginTop: savedCards.length > 0 ? '1rem' : 0,
                  paddingTop: savedCards.length > 0 ? '1rem' : 0,
                  borderTop: savedCards.length > 0 ? '1px solid #f1f5f9' : 'none',
                }}
              >
                <div className="form-group">
                  <label className="form-label" style={{ color: '#0f172a' }}>
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="4242 •••• •••• 4242"
                    value={newCardNumber}
                    onChange={(e) => setNewCardNumber(e.target.value)}
                    className="form-input"
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      borderColor: '#cbd5e1',
                    }}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" style={{ color: '#0f172a' }}>
                      Expiration (MM/YY)
                    </label>
                    <input
                      type="text"
                      placeholder="12/28"
                      value={newCardExp}
                      onChange={(e) => setNewCardExp(e.target.value)}
                      className="form-input"
                      style={{
                        backgroundColor: '#ffffff',
                        color: '#0f172a',
                        borderColor: '#cbd5e1',
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ color: '#0f172a' }}>
                      CVC / CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      value={newCardCvc}
                      onChange={(e) => setNewCardCvc(e.target.value)}
                      className="form-input"
                      style={{
                        backgroundColor: '#ffffff',
                        color: '#0f172a',
                        borderColor: '#cbd5e1',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onBack}
              style={{
                flex: 1,
                height: '54px',
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
              type="submit"
              disabled={loading}
              className="btn btn--gold"
              style={{ flex: 2, height: '54px', fontSize: '0.95rem' }}
            >
              {loading ? (
                <span>Processing Payment Hold...</span>
              ) : (
                <>
                  <span>
                    Confirm &amp; Place Payment Hold (${currentVehiclePrice.totalPrice})
                  </span>
                  <ShieldCheck size={18} style={{ marginLeft: '0.5rem' }} />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
