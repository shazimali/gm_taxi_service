'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  CreditCard,
  Lock,
  ShieldCheck,
  Tag,
  Check,
  X,
  HeartHandshake,
  ArrowRight,
  User,
  Mail,
  Phone,
  Sparkles,
  Loader2,
} from 'lucide-react';
import type { PriceCalculationResult } from '@/lib/services';
import type { FLEET_DATA } from '@/data/fleetData';

interface ConfirmStepProps {
  selectedService: string;
  chosenVehicleObj: (typeof FLEET_DATA)[0];
  pickup: string;
  dropoff: string;
  stops: string[];
  estimatedMiles: number;
  estimatedMinutes: number;
  hourlyCount: number;
  currentVehiclePrice: PriceCalculationResult;
  fullName: string;
  email: string;
  phone: string;
  specialRequests: string;
  setSpecialRequests: (val: string) => void;
  // Step 2: Corporate discount
  corporateAccountCode: string;
  setCorporateAccountCode: (code: string) => void;
  corporateAccount: { id: string; name: string; accountCode: string; discountPct: number } | null;
  corporateLoading: boolean;
  corporateError: string;
  applyCorporateCode: (code: string) => Promise<any>;
  removeCorporateCode: () => void;
  // Step 3 & 4: Tip selection and Total
  tipPercent: number | null;
  setTipPercent: (pct: number | null) => void;
  customTipAmount: number | null;
  setCustomTipAmount: (amount: number | null) => void;
  tipAmount: number;
  totalWithTip: number;
  status: { error?: string };
  loading: boolean;
  onSubmitCheckout: () => Promise<void>;
  onBack: () => void;
}

export const ConfirmStep: React.FC<ConfirmStepProps> = ({
  selectedService,
  chosenVehicleObj,
  pickup,
  dropoff,
  stops,
  estimatedMiles,
  estimatedMinutes,
  hourlyCount,
  currentVehiclePrice,
  fullName,
  email,
  phone,
  specialRequests,
  setSpecialRequests,
  corporateAccountCode,
  setCorporateAccountCode,
  corporateAccount,
  corporateLoading,
  corporateError,
  applyCorporateCode,
  removeCorporateCode,
  tipPercent,
  setTipPercent,
  customTipAmount,
  setCustomTipAmount,
  tipAmount,
  totalWithTip,
  status,
  loading,
  onSubmitCheckout,
  onBack,
}) => {
  const [enteredCode, setEnteredCode] = useState(corporateAccountCode || '');
  const [showCustomTipInput, setShowCustomTipInput] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Bar with Back Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.25rem',
        }}
      >
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
          Review &amp; Stripe Checkout Hold
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

      {/* Trip Summary Header Badge */}
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
            {selectedService.includes('Hourly') ? 'Duration' : 'Route Matrix'}
          </span>
          <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>
            {selectedService.includes('Hourly')
              ? `${hourlyCount} hr${hourlyCount !== 1 ? 's' : ''}`
              : `${estimatedMiles} miles (${estimatedMinutes} mins)`}
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
            Calculated Total
          </span>
          <strong style={{ color: '#c5a46d', fontSize: '1.2rem', fontWeight: 800 }}>
            ${totalWithTip.toFixed(2)}
          </strong>
          {currentVehiclePrice.discountAmount > 0 && (
            <span
              style={{
                display: 'block',
                fontSize: '0.7rem',
                color: '#22c55e',
                fontWeight: 700,
              }}
            >
              Includes -${currentVehiclePrice.discountAmount.toFixed(2)} discount
            </span>
          )}
        </div>
      </div>

      {/* Route Itinerary (Pickup -> Stops -> Dropoff) */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.15rem 1.5rem',
          border: '1px solid #cbd5e1',
          boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
          Route Itinerary
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
          <div>
            <strong style={{ color: '#b8860b' }}>Pickup:</strong> <span style={{ color: '#0f172a' }}>{pickup}</span>
          </div>
          {stops.map((stop, i) => (
            <div key={i}>
              <strong style={{ color: '#2563eb' }}>Stop {i + 1}:</strong> <span style={{ color: '#0f172a' }}>{stop}</span>
            </div>
          ))}
          {dropoff && (
            <div>
              <strong style={{ color: '#16a34a' }}>Drop-off:</strong> <span style={{ color: '#0f172a' }}>{dropoff}</span>
            </div>
          )}
        </div>
      </div>

      {/* Error alert if any */}
      {status.error && (
        <div className="contact-alert contact-alert--error">
          <AlertCircle size={20} className="contact-alert__icon" />
          <span>{status.error}</span>
        </div>
      )}

      {/* Passenger Information Review Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          border: '1px solid #cbd5e1',
          boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#0f172a', fontSize: '0.925rem' }}>
            <User size={18} color="#b8860b" />
            <span>Passenger Contact (From Step 1)</span>
          </div>
          <span
            style={{
              backgroundColor: '#ecfdf5',
              color: '#047857',
              border: '1px solid #a7f3d0',
              fontSize: '0.725rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <Sparkles size={12} /> Auto-Account Registration
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
          <div>
            <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', fontWeight: 600 }}>Name</span>
            <strong style={{ color: '#0f172a' }}>{fullName || 'Passenger'}</strong>
          </div>
          <div>
            <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', fontWeight: 600 }}>Email</span>
            <strong style={{ color: '#0f172a' }}>{email}</strong>
          </div>
          {phone && (
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', fontWeight: 600 }}>Phone</span>
              <strong style={{ color: '#0f172a' }}>{phone}</strong>
            </div>
          )}
        </div>

        <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>
          * If you are a new guest, an account is automatically generated for you. Your temporary login password and confirmation will be delivered to your inbox upon booking.
        </p>
      </div>

      {/* Special Requests or Child Seat */}
      <div className="form-group" style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '1.25rem 1.5rem', border: '1px solid #cbd5e1' }}>
        <label className="form-label" style={{ fontWeight: 700, color: '#0f172a' }}>
          Special Requests or Chauffeur Instructions (Optional)
        </label>
        <input
          type="text"
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          placeholder="e.g. Quiet ride requested, infant rear-facing car seat, or curbside assistance"
          className="form-input"
        />
      </div>

      {/* ── STEP 2: CORPORATE / ACCOUNT DISCOUNT ──────────── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          border: '1px solid #cbd5e1',
          boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.6rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#0f172a', fontSize: '0.925rem' }}>
            <Tag size={18} color="#b8860b" />
            <span>Corporate / Account Discount (Step 2)</span>
          </div>
          {corporateAccount && (
            <span
              style={{
                backgroundColor: '#dcfce7',
                color: '#15803d',
                padding: '0.2rem 0.6rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <Check size={14} /> {corporateAccount.discountPct}% Discount Applied
            </span>
          )}
        </div>

        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.85rem 0' }}>
          If your booking is attached to a corporate account or corporate partner program, enter your account code below.
        </p>

        {corporateAccount ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '10px',
            }}
          >
            <div>
              <strong style={{ color: '#166534', fontSize: '0.875rem' }}>
                {corporateAccount.name} ({corporateAccount.accountCode})
              </strong>
              <div style={{ fontSize: '0.775rem', color: '#15803d' }}>
                {corporateAccount.discountPct}% off ride fare (Savings: -${currentVehiclePrice.discountAmount.toFixed(2)})
              </div>
            </div>
            <button
              type="button"
              onClick={removeCorporateCode}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#dc2626',
                fontWeight: 700,
                fontSize: '0.775rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <X size={14} /> Remove
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <input
              type="text"
              value={enteredCode}
              onChange={(e) => setEnteredCode(e.target.value.toUpperCase())}
              placeholder="e.g. CORP2024 or PARTNER10"
              className="form-input"
              style={{ flex: 1, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (enteredCode.trim()) applyCorporateCode(enteredCode);
                }
              }}
            />
            <button
              type="button"
              disabled={corporateLoading || !enteredCode.trim()}
              onClick={() => applyCorporateCode(enteredCode)}
              style={{
                backgroundColor: '#b8860b',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0 1.25rem',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: corporateLoading ? 'not-allowed' : 'pointer',
                opacity: corporateLoading || !enteredCode.trim() ? 0.65 : 1,
              }}
            >
              {corporateLoading ? 'Validating...' : 'Apply Code'}
            </button>
          </div>
        )}

        {corporateError && (
          <div style={{ color: '#dc2626', fontSize: '0.775rem', marginTop: '0.5rem', fontWeight: 600 }}>
            {corporateError}
          </div>
        )}
      </div>

      {/* ── STEP 3: OPTIONAL DRIVER GRATUITY / TIP ─────────── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          border: '1px solid #cbd5e1',
          boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.6rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#0f172a', fontSize: '0.925rem' }}>
            <HeartHandshake size={18} color="#b8860b" />
            <span>Optional Chauffeur Gratuity (Step 3)</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
            100% Optional
          </span>
        </div>

        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 1rem 0', lineHeight: 1.4 }}>
          Tip is based completely on customer choice. No admin fees, airport surcharges, or mandatory gratuities are added to your quote.
        </p>

        {/* Tip Selection Buttons */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '0.5rem',
            marginBottom: '0.85rem',
          }}
        >
          {[
            { label: 'No Tip', pct: 0 },
            { label: '10%', pct: 10 },
            { label: '15%', pct: 15 },
            { label: '18%', pct: 18 },
            { label: '20%', pct: 20 },
          ].map((opt) => {
            const isSelected = !showCustomTipInput && tipPercent === opt.pct;
            const calcDollars =
              opt.pct > 0
                ? Math.round(currentVehiclePrice.fareAfterDiscount * (opt.pct / 100) * 100) / 100
                : 0;

            return (
              <button
                key={opt.pct}
                type="button"
                onClick={() => {
                  setShowCustomTipInput(false);
                  setTipPercent(opt.pct);
                  setCustomTipAmount(null);
                }}
                style={{
                  padding: '0.65rem 0.25rem',
                  borderRadius: '10px',
                  border: isSelected ? '2px solid #b8860b' : '1px solid #cbd5e1',
                  backgroundColor: isSelected ? '#fefce8' : '#ffffff',
                  color: isSelected ? '#92400e' : '#1e293b',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.15rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: '0.85rem' }}>{opt.label}</span>
                {opt.pct > 0 && (
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                    ${calcDollars.toFixed(2)}
                  </span>
                )}
              </button>
            );
          })}

          {/* Custom Tip Button */}
          <button
            type="button"
            onClick={() => {
              setShowCustomTipInput(true);
              setTipPercent(null);
            }}
            style={{
              padding: '0.65rem 0.25rem',
              borderRadius: '10px',
              border: showCustomTipInput ? '2px solid #b8860b' : '1px solid #cbd5e1',
              backgroundColor: showCustomTipInput ? '#fefce8' : '#ffffff',
              color: showCustomTipInput ? '#92400e' : '#1e293b',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
              fontSize: '0.85rem',
            }}
          >
            Custom $
          </button>
        </div>

        {/* Custom Tip Input if active */}
        {showCustomTipInput && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.75rem',
              backgroundColor: '#f8fafc',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              marginBottom: '0.5rem',
            }}
          >
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
              Custom Tip Amount ($):
            </span>
            <input
              type="number"
              min="0"
              step="1"
              value={customTipAmount ?? ''}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setCustomTipAmount(isNaN(val) ? 0 : Math.max(0, val));
              }}
              placeholder="0.00"
              className="form-input"
              style={{ width: '120px', height: '38px', padding: '0.35rem 0.75rem' }}
            />
          </div>
        )}

        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
          * Note: Tolls are not automatically calculated.
        </div>
      </div>

      {/* ── STEP 4: TRANSPARENT ORDER SUMMARY BREAKDOWN ──── */}
      <div
        style={{
          backgroundColor: '#0f172a',
          borderRadius: '16px',
          padding: '1.5rem',
          color: '#ffffff',
          border: '1px solid #334155',
          boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
        }}
      >
        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#c5a46d',
            marginBottom: '1rem',
          }}
        >
          Quote Breakdown &amp; Output Total (Step 4)
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
          {/* Step 1: Base Fare */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#cbd5e1' }}>
              Fare ({currentVehiclePrice.fareFormula || currentVehiclePrice.formulaLabel})
            </span>
            <span style={{ fontWeight: 700, color: '#ffffff' }}>
              ${currentVehiclePrice.baseFare.toFixed(2)}
            </span>
          </div>

          {/* Step 2: Corporate Discount */}
          {currentVehiclePrice.discountAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#4ade80' }}>
              <span>Corporate Discount ({corporateAccount?.discountPct}% off)</span>
              <span style={{ fontWeight: 700 }}>
                −${currentVehiclePrice.discountAmount.toFixed(2)}
              </span>
            </div>
          )}

          {/* Subtotal */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '0.5rem',
              color: '#94a3b8',
            }}
          >
            <span>Subtotal (Ride Fare)</span>
            <span style={{ fontWeight: 700, color: '#ffffff' }}>
              ${currentVehiclePrice.fareAfterDiscount.toFixed(2)}
            </span>
          </div>

          {/* Step 3: Optional Tip */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#cbd5e1' }}>
            <span>Optional Tip (Customer Selected)</span>
            <span style={{ fontWeight: 700, color: tipAmount > 0 ? '#c5a46d' : '#94a3b8' }}>
              {tipAmount > 0 ? `+$${tipAmount.toFixed(2)}` : '$0.00'}
            </span>
          </div>

          {/* Step 4: Final Total */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '2px solid rgba(197, 164, 109, 0.4)',
              paddingTop: '0.75rem',
              marginTop: '0.25rem',
            }}
          >
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
              Final Total (To Pre-Authorize)
            </span>
            <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#c5a46d' }}>
              ${totalWithTip.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Stripe Secure Payment Banner */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          border: '1px solid #cbd5e1',
          boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            marginBottom: '0.6rem',
          }}
        >
          <CreditCard size={20} color="#b8860b" />
          <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
            Stripe Hosted Secure Checkout (Cards, Apple Pay &amp; Google Pay)
          </strong>
        </div>

        <div
          style={{
            backgroundColor: '#fefce8',
            border: '1px solid #fef08a',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.65rem',
          }}
        >
          <Lock size={18} color="#b8860b" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.8rem', color: '#713f12', lineHeight: 1.5 }}>
            <strong>🔒 Card Authorization Hold:</strong> When you click below, you will be directed to Stripe's encrypted payment page to enter your card details. A hold of <strong>${totalWithTip.toFixed(2)}</strong> is placed in reserve. Funds are <strong>NOT charged</strong> until your ride is completed.
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          style={{
            flex: 1,
            height: '54px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            borderRadius: '10px',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
          }}
        >
          ← Back
        </button>

        <button
          type="button"
          onClick={onSubmitCheckout}
          disabled={loading}
          className="btn btn--gold"
          style={{
            flex: 2.5,
            height: '54px',
            fontSize: '0.975rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Redirecting to Stripe Checkout...</span>
            </>
          ) : (
            <>
              <span>Pay &amp; Hold with Stripe (${totalWithTip.toFixed(2)})</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
