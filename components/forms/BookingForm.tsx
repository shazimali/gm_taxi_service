'use client';

import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Luggage, Plane, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { FLEET_DATA } from '@/data/fleetData';
import { sendBookingQuote } from '@/lib/actions/sendBookingQuote';

export default function BookingForm() {
  const [step, setStep] = useState(1);
  const [serviceType, setServiceType] = useState('airport');
  const [selectedVehicle, setSelectedVehicle] = useState(FLEET_DATA[0].slug);

  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('12:00');
  const [passengers, setPassengers] = useState(2);
  const [luggage, setLuggage] = useState(2);
  const [flightNumber, setFlightNumber] = useState('');

  const [status, setStatus] = useState<{ success?: boolean; confirmationNumber?: string; message?: string; error?: string }>({});
  const [loading, setLoading] = useState(false);

  async function handleFinalSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus({});

    const formData = new FormData(e.currentTarget);
    formData.set('serviceType', serviceType);
    formData.set('vehicleSlug', selectedVehicle);
    formData.set('pickupLocation', pickup);
    formData.set('dropoffLocation', dropoff);
    formData.set('pickupDate', pickupDate);
    formData.set('pickupTime', pickupTime);
    formData.set('passengers', passengers.toString());
    formData.set('luggage', luggage.toString());
    formData.set('flightNumber', flightNumber);

    const result = await sendBookingQuote({}, formData);

    setLoading(false);
    setStatus(result);
  }

  const chosenVehicleObj = FLEET_DATA.find((v) => v.slug === selectedVehicle) || FLEET_DATA[0];

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-10 border border-white/10 shadow-2xl max-w-4xl mx-auto">
      {/* Steps Indicator Bar */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
        <div className={`flex items-center gap-3 ${step >= 1 ? 'text-[#c5a059]' : 'text-neutral-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 1 ? 'gold-bg-gradient text-neutral-950' : 'bg-neutral-800 text-neutral-400'}`}>
            1
          </div>
          <span className="text-xs sm:text-sm font-semibold hidden sm:inline">Trip & Route</span>
        </div>

        <div className="flex-1 h-0.5 bg-neutral-800 mx-4">
          <div className={`h-full gold-bg-gradient transition-all duration-300 ${step === 1 ? 'w-0' : step === 2 ? 'w-1/2' : 'w-full'}`}></div>
        </div>

        <div className={`flex items-center gap-3 ${step >= 2 ? 'text-[#c5a059]' : 'text-neutral-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 2 ? 'gold-bg-gradient text-neutral-950' : 'bg-neutral-800 text-neutral-400'}`}>
            2
          </div>
          <span className="text-xs sm:text-sm font-semibold hidden sm:inline">Select Vehicle</span>
        </div>

        <div className="flex-1 h-0.5 bg-neutral-800 mx-4">
          <div className={`h-full gold-bg-gradient transition-all duration-300 ${step === 3 ? 'w-full' : 'w-0'}`}></div>
        </div>

        <div className={`flex items-center gap-3 ${step >= 3 ? 'text-[#c5a059]' : 'text-neutral-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 3 ? 'gold-bg-gradient text-neutral-950' : 'bg-neutral-800 text-neutral-400'}`}>
            3
          </div>
          <span className="text-xs sm:text-sm font-semibold hidden sm:inline">Confirmation</span>
        </div>
      </div>

      {status.success ? (
        <div className="text-center py-12 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full gold-bg-gradient flex items-center justify-center text-neutral-950 mb-2">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="font-serif text-3xl font-bold text-white">
            Reservation Request Submitted!
          </h3>
          <p className="text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
            {status.message}
          </p>

          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 max-w-md w-full my-4 text-left">
            <div className="text-xs text-[#c5a059] font-bold uppercase tracking-wider mb-2">
              Confirmation Code: {status.confirmationNumber}
            </div>
            <div className="text-xs text-neutral-300 space-y-1">
              <div><strong>Vehicle:</strong> {chosenVehicleObj.name}</div>
              <div><strong>Pickup:</strong> {pickup || 'Boston Area'}</div>
              <div><strong>Dropoff:</strong> {dropoff || 'Destination'}</div>
              <div><strong>Date & Time:</strong> {pickupDate || 'Scheduled'} at {pickupTime}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setStep(1);
              setStatus({});
            }}
            className="gold-btn-gradient text-neutral-950 font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider"
          >
            Book Another Transfer
          </button>
        </div>
      ) : (
        <>
          {/* STEP 1: ROUTE & TRIP DETAILS */}
          {step === 1 && (
            <div className="flex flex-col gap-6">
              <h3 className="font-serif text-2xl font-bold text-white">
                Step 1: Select Service & Trip Details
              </h3>

              {/* Service Type Buttons */}
              <div className="grid grid-cols-3 gap-3 bg-neutral-900 p-1.5 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setServiceType('airport')}
                  className={`py-3 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                    serviceType === 'airport'
                      ? 'gold-bg-gradient text-neutral-950 shadow-lg'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  ✈️ Airport Transfer
                </button>
                <button
                  type="button"
                  onClick={() => setServiceType('hourly')}
                  className={`py-3 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                    serviceType === 'hourly'
                      ? 'gold-bg-gradient text-neutral-950 shadow-lg'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  🕐 Hourly Chauffeur
                </button>
                <button
                  type="button"
                  onClick={() => setServiceType('point-to-point')}
                  className={`py-3 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                    serviceType === 'point-to-point'
                      ? 'gold-bg-gradient text-neutral-950 shadow-lg'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  🗺️ City-to-City
                </button>
              </div>

              {/* Pickup & Dropoff */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>Pickup Location *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    placeholder="e.g. Boston Logan BOS, Hotel, or Street Address"
                    className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>Drop-off Destination</span>
                  </label>
                  <input
                    type="text"
                    value={dropoff}
                    onChange={(e) => setDropoff(e.target.value)}
                    placeholder="e.g. Hotel, Residence, NYC, or Airport Terminal"
                    className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>Transfer Date *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>Pickup Time *</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              {/* Passenger Count, Luggage & Flight # */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>Passengers</span>
                  </label>
                  <select
                    value={passengers}
                    onChange={(e) => setPassengers(Number(e.target.value))}
                    className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#c5a059]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((num) => (
                      <option key={num} value={num}>{num} Passengers</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Luggage className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>Luggage Bags</span>
                  </label>
                  <select
                    value={luggage}
                    onChange={(e) => setLuggage(Number(e.target.value))}
                    className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#c5a059]"
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>{num} Suitcases</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Plane className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>Flight Tail # (Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                    placeholder="e.g. DL 1420"
                    className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!pickup || !pickupDate) {
                      alert('Please provide a Pickup Location and Transfer Date.');
                      return;
                    }
                    setStep(2);
                  }}
                  className="gold-btn-gradient text-neutral-950 font-bold px-8 py-3.5 rounded-xl uppercase tracking-wider text-xs shadow-xl flex items-center gap-2"
                >
                  <span>Select Vehicle Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: VEHICLE SELECTION */}
          {step === 2 && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-2xl font-bold text-white">
                  Step 2: Choose Your Executive Vehicle
                </h3>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-[#c5a059] font-bold hover:underline"
                >
                  ← Edit Route & Dates
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FLEET_DATA.map((vehicle) => {
                  const isSelected = selectedVehicle === vehicle.slug;

                  return (
                    <div
                      key={vehicle.id}
                      onClick={() => setSelectedVehicle(vehicle.slug)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#c5a059] bg-neutral-900/90 shadow-2xl ring-1 ring-[#c5a059]'
                          : 'border-white/10 bg-neutral-950/60 hover:border-white/30'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-[#c5a059] uppercase tracking-wider">
                            {vehicle.category}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-bold gold-bg-gradient text-neutral-950 px-2 py-0.5 rounded-full">
                              Selected
                            </span>
                          )}
                        </div>
                        <h4 className="font-serif text-lg font-bold text-white mb-1">
                          {vehicle.name}
                        </h4>
                        <p className="text-xs text-neutral-400 mb-3">{vehicle.model}</p>

                        <div className="flex items-center gap-4 text-xs text-neutral-300 font-medium mb-3">
                          <span>👥 Max {vehicle.passengerCapacity} Pax</span>
                          <span>🧳 Max {vehicle.luggageCapacity} Luggage</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                        <span className="text-neutral-400">{vehicle.features[0]}</span>
                        <span className="font-bold text-[#c5a059]">Select →</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-xl border border-white/20 text-neutral-300 text-xs font-bold hover:bg-neutral-800"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="gold-btn-gradient text-neutral-950 font-bold px-8 py-3.5 rounded-xl uppercase tracking-wider text-xs shadow-xl flex items-center gap-2"
                >
                  <span>Passenger Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PASSENGER DETAILS & SUBMIT */}
          {step === 3 && (
            <form onSubmit={handleFinalSubmit} className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-2xl font-bold text-white">
                  Step 3: Passenger Information & Submit
                </h3>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-[#c5a059] font-bold hover:underline"
                >
                  ← Change Vehicle
                </button>
              </div>

              {/* Trip Summary Card */}
              <div className="bg-neutral-900 border border-white/10 rounded-xl p-4 text-xs text-neutral-300 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-neutral-500 uppercase block font-semibold text-[10px]">Selected Fleet</span>
                  <strong className="text-white text-sm">{chosenVehicleObj.name}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 uppercase block font-semibold text-[10px]">Pickup Date</span>
                  <strong className="text-white text-sm">{pickupDate} at {pickupTime}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 uppercase block font-semibold text-[10px]">Passengers / Bags</span>
                  <strong className="text-white text-sm">{passengers} Pax / {luggage} Bags</strong>
                </div>
              </div>

              {status.error && (
                <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
                  <span>{status.error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                    Full Passenger Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    placeholder="e.g. Executive Passenger Name"
                    className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="e.g. executive@company.com"
                    className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                    Mobile Phone Number (for Driver SMS Updates) *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="e.g. (617) 784-0264"
                    className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                    Child Safety Seat or Special Requests
                  </label>
                  <input
                    type="text"
                    name="specialRequests"
                    placeholder="e.g. Infant rear-facing seat needed, quiet ride"
                    className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3.5 rounded-xl border border-white/20 text-neutral-300 text-xs font-bold hover:bg-neutral-800"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="gold-btn-gradient text-neutral-950 font-bold px-8 py-4 rounded-xl uppercase tracking-wider text-xs shadow-2xl flex items-center gap-2 hover:scale-[1.01] transition-transform disabled:opacity-50"
                >
                  {loading ? (
                    <span>Submitting Request...</span>
                  ) : (
                    <>
                      <span>Submit Reservation Request</span>
                      <ShieldCheck className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}
