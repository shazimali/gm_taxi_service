'use client';

import React, { useState, useEffect } from 'react';
import { useLocationSearch } from './hooks/useLocationSearch';
import { usePassengerAuth } from './hooks/usePassengerAuth';
import { useRoutePricing } from './hooks/useRoutePricing';
import { StepIndicator } from './StepIndicator';
import { ServiceStep } from './ServiceStep';
import { VehicleStep } from './VehicleStep';
import { ConfirmStep } from './ConfirmStep';
import { SuccessView } from './SuccessView';
import type { BookingSubmissionStatus } from './types';
import { AlertCircle, Info } from 'lucide-react';

export default function BookingForm() {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<BookingSubmissionStatus>({});
  const [loading, setLoading] = useState(false);
  const [cancelledNotice, setCancelledNotice] = useState(false);

  // Guest Contact Information (Collected in Step 1)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // 1. Location search state & handlers
  const location = useLocationSearch();

  // 2. Route & Vehicle pricing state & handlers
  const pricing = useRoutePricing(location.pickup, location.dropoff);

  // 3. Passenger auth state & handlers (used to prefill if logged in)
  const auth = usePassengerAuth();

  // Prefill contact if user is already logged in as a passenger
  useEffect(() => {
    if (auth.passenger) {
      if (!fullName && auth.passenger.fullName) setFullName(auth.passenger.fullName);
      if (!email && auth.passenger.email) setEmail(auth.passenger.email);
      if (!phone && auth.passenger.phone) setPhone(auth.passenger.phone);
    }
  }, [auth.passenger]);

  // Check if returning from a cancelled Stripe Checkout
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('cancelled') === '1') {
        setCancelledNotice(true);
      }
    }
  }, []);

  // Handle Frictionless Stripe Checkout Redirection
  const handleCheckoutRedirect = async () => {
    if (!fullName.trim() || !email.trim()) {
      setStatus({ error: 'Please provide your Full Name and Email.' });
      return;
    }

    setLoading(true);
    setStatus({});

    try {
      const res = await fetch('/api/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          serviceType: pricing.selectedService,
          vehicleSlug: pricing.selectedVehicle,
          pickupLocation: location.pickup,
          dropoffLocation: location.dropoff,
          pickupDate: pricing.pickupDate,
          pickupTime: pricing.pickupTime,
          passengers: pricing.passengers,
          luggage: pricing.luggage,
          flightNumber: pricing.flightNumber,
          specialRequests,
          estimatedMinutes: pricing.estimatedMinutes,
          estimatedMiles: pricing.estimatedMiles,
          hourlyCount: pricing.hourlyCount,
          corporateAccountCode: pricing.corporateAccountCode || undefined,
          tipPercent: pricing.tipPercent,
          tipAmount: pricing.tipAmount,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.checkoutUrl) {
        setStatus({ error: data.error || 'Failed to start Stripe checkout session. Please try again.' });
        setLoading(false);
        return;
      }

      // Redirect customer to Stripe hosted checkout page
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      console.error('Checkout redirection error:', err);
      setStatus({ error: 'Connection error while contacting payment gateway. Please try again.' });
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setStatus({});
    location.resetLocations();
  };

  return (
    <div className="contact-form-wrap">
      {/* Step Indicator Bar */}
      <StepIndicator step={step} />

      {/* Notice if returning from cancelled Stripe Checkout */}
      {cancelledNotice && (
        <div
          style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            color: '#1e40af',
            borderRadius: '10px',
            padding: '0.85rem 1.15rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontSize: '0.85rem',
          }}
        >
          <Info size={18} color="#2563eb" style={{ flexShrink: 0 }} />
          <span>
            Payment was not completed. Your trip details have been preserved below whenever you are ready.
          </span>
        </div>
      )}

      {status.success ? (
        <SuccessView
          status={status}
          currentVehiclePrice={pricing.currentVehiclePrice}
          passenger={auth.passenger}
          passengerName={fullName || auth.passengerName}
          selectedService={pricing.selectedService}
          chosenVehicleObj={pricing.chosenVehicleObj}
          pickup={location.pickup}
          dropoff={location.dropoff}
          estimatedMiles={pricing.estimatedMiles}
          estimatedMinutes={pricing.estimatedMinutes}
          hourlyCount={pricing.hourlyCount}
          onReset={handleReset}
        />
      ) : (
        <div className="theme-form">
          {/* Step 1: Service & Route + Guest Contact */}
          {step === 1 && (
            <ServiceStep
              selectedService={pricing.selectedService}
              setSelectedService={pricing.setSelectedService}
              pickup={location.pickup}
              setPickup={location.setPickup}
              dropoff={location.dropoff}
              setDropoff={location.setDropoff}
              pickupFinalized={location.pickupFinalized}
              setPickupFinalized={location.setPickupFinalized}
              dropoffFinalized={location.dropoffFinalized}
              setDropoffFinalized={location.setDropoffFinalized}
              pickupSuggestions={location.pickupSuggestions}
              dropoffSuggestions={location.dropoffSuggestions}
              loadingPickup={location.loadingPickup}
              loadingDropoff={location.loadingDropoff}
              detectingPickupLocation={location.detectingPickupLocation}
              detectCurrentPickupLocation={location.detectCurrentPickupLocation}
              showPickupDropdown={location.showPickupDropdown}
              setShowPickupDropdown={location.setShowPickupDropdown}
              showDropoffDropdown={location.showDropoffDropdown}
              setShowDropoffDropdown={location.setShowDropoffDropdown}
              pickupContainerRef={location.pickupContainerRef}
              dropoffContainerRef={location.dropoffContainerRef}
              isBothLocationsFinal={location.isBothLocationsFinal}
              estimatedMiles={pricing.estimatedMiles}
              estimatedMinutes={pricing.estimatedMinutes}
              pickupDate={pricing.pickupDate}
              setPickupDate={pricing.setPickupDate}
              pickupTime={pricing.pickupTime}
              setPickupTime={pricing.setPickupTime}
              hourlyCount={pricing.hourlyCount}
              setHourlyCount={pricing.setHourlyCount}
              flightNumber={pricing.flightNumber}
              setFlightNumber={pricing.setFlightNumber}
              passengers={pricing.passengers}
              setPassengers={pricing.setPassengers}
              luggage={pricing.luggage}
              setLuggage={pricing.setLuggage}
              fullName={fullName}
              setFullName={setFullName}
              email={email}
              setEmail={setEmail}
              phone={phone}
              setPhone={setPhone}
              onNext={() => {
                location.setPickupFinalized(true);
                location.setDropoffFinalized(true);
                setStep(2);
              }}
            />
          )}

          {/* Step 2: Vehicle Selection */}
          {step === 2 && (
            <VehicleStep
              selectedVehicle={pricing.selectedVehicle}
              setSelectedVehicle={pricing.setSelectedVehicle}
              pickup={location.pickup}
              dropoff={location.dropoff}
              estimatedMiles={pricing.estimatedMiles}
              estimatedMinutes={pricing.estimatedMinutes}
              calculateVehiclePrice={pricing.calculateVehiclePrice}
              currentVehiclePrice={pricing.currentVehiclePrice}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}

          {/* Step 3: Review, Tip & Stripe Hosted Checkout */}
          {step === 3 && (
            <ConfirmStep
              selectedService={pricing.selectedService}
              chosenVehicleObj={pricing.chosenVehicleObj}
              estimatedMiles={pricing.estimatedMiles}
              estimatedMinutes={pricing.estimatedMinutes}
              hourlyCount={pricing.hourlyCount}
              currentVehiclePrice={pricing.currentVehiclePrice}
              fullName={fullName}
              email={email}
              phone={phone}
              specialRequests={specialRequests}
              setSpecialRequests={setSpecialRequests}
              // Corporate discount (Step 2)
              corporateAccountCode={pricing.corporateAccountCode}
              setCorporateAccountCode={pricing.setCorporateAccountCode}
              corporateAccount={pricing.corporateAccount}
              corporateLoading={pricing.corporateLoading}
              corporateError={pricing.corporateError}
              applyCorporateCode={pricing.applyCorporateCode}
              removeCorporateCode={pricing.removeCorporateCode}
              // Tip (Step 3) & Final Total (Step 4)
              tipPercent={pricing.tipPercent}
              setTipPercent={pricing.setTipPercent}
              customTipAmount={pricing.customTipAmount}
              setCustomTipAmount={pricing.setCustomTipAmount}
              tipAmount={pricing.tipAmount}
              totalWithTip={pricing.totalWithTip}
              status={status}
              loading={loading}
              onSubmitCheckout={handleCheckoutRedirect}
              onBack={() => setStep(2)}
            />
          )}
        </div>
      )}
    </div>
  );
}
