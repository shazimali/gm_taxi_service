'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { FLEET_DATA } from '@/data/fleetData';
import { calculateGoogleDistanceMatrix, distanceService, pricingService } from '@/lib/services';
import type { PriceCalculationResult } from '@/lib/services';

export function useRoutePricing(pickup: string, dropoff: string) {
  const [selectedService, setSelectedService] = useState('Airport Transportation');
  const [selectedVehicle, setSelectedVehicle] = useState(FLEET_DATA[0].slug);
  const [hourlyCount, setHourlyCount] = useState(3);

  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('12:00');
  const [passengers, setPassengers] = useState(2);
  const [luggage, setLuggage] = useState(2);
  const [flightNumber, setFlightNumber] = useState('');

  const [estimatedMiles, setEstimatedMiles] = useState(14.5);
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);

  // Corporate account state
  const [corporateAccountCode, setCorporateAccountCode] = useState('');
  const [corporateAccount, setCorporateAccount] = useState<{
    id: string;
    name: string;
    accountCode: string;
    discountPct: number;
  } | null>(null);
  const [corporateLoading, setCorporateLoading] = useState(false);
  const [corporateError, setCorporateError] = useState('');

  // Tip selection state (Step 3: 0% default, optional choice at checkout)
  const [tipPercent, setTipPercent] = useState<number | null>(0);
  const [customTipAmount, setCustomTipAmount] = useState<number | null>(null);

  // Server quote cache per vehicle slug
  const [serverQuotes, setServerQuotes] = useState<Record<string, PriceCalculationResult>>({});

  // 1. Distance & duration estimation
  useEffect(() => {
    if (!pickup || !dropoff) return;

    // Instant baseline
    const baseline = distanceService.estimate(pickup, dropoff);
    setEstimatedMiles(baseline.miles);
    setEstimatedMinutes(baseline.minutes);

    // Google Maps traffic-aware duration & distance
    let isCancelled = false;
    const fetchActualMatrix = async () => {
      try {
        const actual = await calculateGoogleDistanceMatrix(pickup, dropoff);
        if (!isCancelled && actual && actual.miles > 0) {
          setEstimatedMiles(actual.miles);
          setEstimatedMinutes(actual.minutes);
        }
      } catch (err) {
        console.warn('Distance matrix calculation warning:', err);
      }
    };

    fetchActualMatrix();

    return () => {
      isCancelled = true;
    };
  }, [pickup, dropoff]);

  // 2. Fetch server quote from /api/quote
  const fetchQuote = useCallback(
    async (vSlug: string, code?: string) => {
      try {
        const res = await fetch('/api/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vehicleSlug: vSlug,
            serviceType: selectedService,
            pickup,
            dropoff,
            estimatedMiles,
            estimatedMinutes,
            hourlyCount,
            corporateAccountCode: code ?? corporateAccountCode,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setServerQuotes((prev) => ({ ...prev, [vSlug]: data }));
          if (data.corporateAccount) {
            setCorporateAccount(data.corporateAccount);
            setCorporateError('');
          } else if (code) {
            setCorporateAccount(null);
            setCorporateError('Invalid or inactive corporate account code.');
          }
          return data;
        }
      } catch (err) {
        console.warn('Quote fetch error:', err);
      }
      return null;
    },
    [selectedService, pickup, dropoff, estimatedMiles, estimatedMinutes, hourlyCount, corporateAccountCode]
  );

  // Apply corporate account code explicitly
  const applyCorporateCode = async (codeToApply: string) => {
    const trimmed = codeToApply.trim().toUpperCase();
    setCorporateError('');
    if (!trimmed) {
      setCorporateAccountCode('');
      setCorporateAccount(null);
      return;
    }
    setCorporateLoading(true);
    setCorporateAccountCode(trimmed);
    const result = await fetchQuote(selectedVehicle, trimmed);
    setCorporateLoading(false);
    return result;
  };

  // Remove corporate code
  const removeCorporateCode = () => {
    setCorporateAccountCode('');
    setCorporateAccount(null);
    setCorporateError('');
    fetchQuote(selectedVehicle, '');
  };

  // Refresh server quotes for the whole fleet whenever route or service changes,
  // so zone-flat pricing is already cached before the customer reaches vehicle
  // selection (avoids the metered-rate fallback below being shown for zone routes).
  useEffect(() => {
    FLEET_DATA.forEach((vehicle) => fetchQuote(vehicle.slug));
  }, [fetchQuote]);

  // Client-side fallback calculation if server response is pending
  const calculateVehiclePrice = useCallback(
    (vehicle: (typeof FLEET_DATA)[0]): PriceCalculationResult => {
      if (serverQuotes[vehicle.slug]) {
        return serverQuotes[vehicle.slug];
      }

      const isHourly = selectedService.toLowerCase().includes('hour');
      const discountPct = corporateAccount?.discountPct ?? 0;

      return pricingService.calculate({
        serviceType: isHourly ? 'hourly' : 'point-to-point',
        vehicleConfig: {
          rateHourly: vehicle.rateHourly || 85,
          minHours: 2,
          ratePerMile: 3.5,
          ratePerMinute: 0.65,
          baseFee: 15,
          minimumTripFee: 65,
          zoneRoutes: [],
        },
        hourlyCount,
        pickup,
        dropoff,
        estimatedMiles,
        estimatedMinutes,
        corporateDiscountPct: discountPct,
      });
    },
    [serverQuotes, selectedService, corporateAccount, hourlyCount, pickup, dropoff, estimatedMiles, estimatedMinutes]
  );

  const chosenVehicleObj =
    FLEET_DATA.find((v) => v.slug === selectedVehicle) || FLEET_DATA[0];

  const currentVehiclePrice = calculateVehiclePrice(chosenVehicleObj);

  // Step 3: Compute Tip amount
  const tipAmount =
    tipPercent !== null
      ? Math.round(currentVehiclePrice.fareAfterDiscount * (tipPercent / 100) * 100) / 100
      : Math.max(0, customTipAmount ?? 0);

  // Step 4: Final Total = Fare after corporate discount + Tip
  const totalWithTip = Math.round((currentVehiclePrice.fareAfterDiscount + tipAmount) * 100) / 100;

  return {
    selectedService,
    setSelectedService,
    selectedVehicle,
    setSelectedVehicle,
    hourlyCount,
    setHourlyCount,
    pickupDate,
    setPickupDate,
    pickupTime,
    setPickupTime,
    passengers,
    setPassengers,
    luggage,
    setLuggage,
    flightNumber,
    setFlightNumber,
    estimatedMiles,
    estimatedMinutes,
    chosenVehicleObj,
    calculateVehiclePrice,
    currentVehiclePrice,
    // Step 2: Corporate discount
    corporateAccountCode,
    setCorporateAccountCode,
    corporateAccount,
    corporateLoading,
    corporateError,
    applyCorporateCode,
    removeCorporateCode,
    // Step 3 & 4: Tip & Total
    tipPercent,
    setTipPercent,
    customTipAmount,
    setCustomTipAmount,
    tipAmount,
    totalWithTip,
  };
}
