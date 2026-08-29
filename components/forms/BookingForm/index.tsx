'use client';

import React, { useState } from 'react';
import { sendBookingQuote } from '@/lib/actions/sendBookingQuote';
import { useLocationSearch } from './hooks/useLocationSearch';
import { usePassengerAuth } from './hooks/usePassengerAuth';
import { useRoutePricing } from './hooks/useRoutePricing';
import { StepIndicator } from './StepIndicator';
import { ServiceStep } from './ServiceStep';
import { VehicleStep } from './VehicleStep';
import { ConfirmStep } from './ConfirmStep';
import { SuccessView } from './SuccessView';
import type { BookingSubmissionStatus } from './types';

export default function BookingForm() {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<BookingSubmissionStatus>({});
  const [loading, setLoading] = useState(false);

  // 1. Location search state & handlers
  const location = useLocationSearch();

  // 2. Route & Vehicle pricing state & handlers
  const pricing = useRoutePricing(location.pickup, location.dropoff);

  // 3. Passenger auth & cards state & handlers
  const auth = usePassengerAuth();

  // Handle Reservation & Pre-Authorization Hold Submission
  const handleFinalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!auth.passenger) {
      alert('Please log in or register as a passenger before confirming your reservation.');
      return;
    }

    setLoading(true);
    setStatus({});

    const formData = new FormData();
    const serviceLabel = pricing.selectedService.includes('Hourly')
      ? `${pricing.selectedService} (${pricing.hourlyCount} Hours)`
      : pricing.selectedService;

    formData.set('fullName', auth.passengerName || auth.passenger.fullName);
    formData.set('email', auth.passengerEmail || auth.passenger.email);
    formData.set('phone', auth.passengerPhone || auth.passenger.phone || '');
    formData.set('serviceType', serviceLabel);
    formData.set('vehicleSlug', pricing.selectedVehicle);
    formData.set('pickupLocation', location.pickup);
    formData.set('dropoffLocation', location.dropoff);
    formData.set('pickupDate', pricing.pickupDate);
    formData.set('pickupTime', pricing.pickupTime);
    formData.set('passengers', pricing.passengers.toString());
    formData.set('luggage', pricing.luggage.toString());
    formData.set('flightNumber', pricing.flightNumber);
    formData.set('estimatedPrice', pricing.currentVehiclePrice.totalPrice);

    // Create Stripe Pre-Authorization Hold (manual capture)
    try {
      const intentRes = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: pricing.currentVehiclePrice.totalPrice,
          vehicleSlug: pricing.selectedVehicle,
          pickupLocation: location.pickup,
          dropoffLocation: location.dropoff,
          paymentMethodId: auth.selectedCardId !== 'new' ? auth.selectedCardId : undefined,
        }),
      });

      if (intentRes.ok) {
        const intentData = await intentRes.json();
        if (intentData.paymentIntentId) {
          formData.set('stripePaymentIntentId', intentData.paymentIntentId);
          formData.set('paymentStatus', 'HOLD_PLACED');
        }
      }
    } catch (holdErr) {
      console.warn('Payment hold creation warning:', holdErr);
    }

    const calcNotes = `Calculated Distance: ${pricing.estimatedMiles} miles | Duration: ${pricing.estimatedMinutes} mins | System Estimated Price: $${pricing.currentVehiclePrice.totalPrice}`;
    formData.set(
      'specialRequests',
      auth.specialRequests ? `${auth.specialRequests} [${calcNotes}]` : calcNotes
    );

    const result = await sendBookingQuote({}, formData);

    setLoading(false);
    setStatus(result);
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

      {status.success ? (
        <SuccessView
          status={status}
          currentVehiclePrice={pricing.currentVehiclePrice}
          passenger={auth.passenger}
          passengerName={auth.passengerName}
          selectedService={pricing.selectedService}
          chosenVehicleObj={pricing.chosenVehicleObj}
          pickup={location.pickup}
          dropoff={location.dropoff}
          estimatedMiles={pricing.estimatedMiles}
          estimatedMinutes={pricing.estimatedMinutes}
          onReset={handleReset}
        />
      ) : (
        <div className="theme-form">
          {/* Step 1: Service & Route */}
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

          {/* Step 3: Passenger Auth & Confirmation */}
          {step === 3 && (
            <ConfirmStep
              passenger={auth.passenger}
              selectedService={pricing.selectedService}
              chosenVehicleObj={pricing.chosenVehicleObj}
              estimatedMiles={pricing.estimatedMiles}
              estimatedMinutes={pricing.estimatedMinutes}
              currentVehiclePrice={pricing.currentVehiclePrice}
              authMode={auth.authMode}
              setAuthMode={auth.setAuthMode}
              authError={auth.authError}
              setAuthError={auth.setAuthError}
              authLoading={auth.authLoading}
              loginEmail={auth.loginEmail}
              setLoginEmail={auth.setLoginEmail}
              loginPassword={auth.loginPassword}
              setLoginPassword={auth.setLoginPassword}
              regFullName={auth.regFullName}
              setRegFullName={auth.setRegFullName}
              regEmail={auth.regEmail}
              setRegEmail={auth.setRegEmail}
              regPassword={auth.regPassword}
              setRegPassword={auth.setRegPassword}
              regPhone={auth.regPhone}
              setRegPhone={auth.setRegPhone}
              passengerName={auth.passengerName}
              setPassengerName={auth.setPassengerName}
              passengerEmail={auth.passengerEmail}
              setPassengerEmail={auth.setPassengerEmail}
              passengerPhone={auth.passengerPhone}
              setPassengerPhone={auth.setPassengerPhone}
              specialRequests={auth.specialRequests}
              setSpecialRequests={auth.setSpecialRequests}
              savedCards={auth.savedCards}
              selectedCardId={auth.selectedCardId}
              setSelectedCardId={auth.setSelectedCardId}
              newCardNumber={auth.newCardNumber}
              setNewCardNumber={auth.setNewCardNumber}
              newCardExp={auth.newCardExp}
              setNewCardExp={auth.setNewCardExp}
              newCardCvc={auth.newCardCvc}
              setNewCardCvc={auth.setNewCardCvc}
              status={status}
              loading={loading}
              onPassengerLogin={auth.handlePassengerLogin}
              onPassengerRegister={auth.handlePassengerRegister}
              onSubmitReservation={handleFinalSubmit}
              onBack={() => setStep(2)}
            />
          )}
        </div>
      )}
    </div>
  );
}
