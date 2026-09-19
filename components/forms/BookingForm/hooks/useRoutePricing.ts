'use client';

import { useEffect, useState, useCallback } from 'react';
import { FLEET_DATA } from '@/data/fleetData';
import {
  calculateGoogleDistanceMatrix,
  calculateGoogleRouteWithStops,
  distanceService,
  pricingService,
} from '@/lib/services';
import type { PriceCalculationResult } from '@/lib/services';

export function useRoutePricing(pickup: string, dropoff: string, stops: string[] = []) {
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

  // Tip selection state (Step 2: 0% default, optional choice at checkout)
  const [tipPercent, setTipPercent] = useState<number | null>(0);
  const [customTipAmount, setCustomTipAmount] = useState<number | null>(null);

  // Server quote cache per vehicle slug
  const [serverQuotes, setServerQuotes] = useState<Record<string, PriceCalculationResult>>({});

  // Tracks whether a fresh quote is being fetched for the vehicle the customer just selected
  const [quoteLoading, setQuoteLoading] = useState(false);

  // 1. Distance & duration estimation (pickup -> stops -> dropoff)
  const stopsKey = stops.join('|');
  useEffect(() => {
    if (!pickup || !dropoff) return;

    // Instant baseline: sum each leg's rule-based estimate
    const waypoints = [pickup, ...stops, dropoff];
    const baselineTotal = waypoints.slice(0, -1).reduce(
      (acc, origin, i) => {
        const leg = distanceService.estimate(origin, waypoints[i + 1]);
        return { miles: acc.miles + leg.miles, minutes: acc.minutes + leg.minutes };
      },
      { miles: 0, minutes: 0 }
    );
    setEstimatedMiles(Math.round(baselineTotal.miles * 10) / 10);
    setEstimatedMinutes(Math.round(baselineTotal.minutes));

    // Google Maps traffic-aware duration & distance
    let isCancelled = false;
    const fetchActualMatrix = async () => {
      try {
        const actual =
          stops.length > 0
            ? await calculateGoogleRouteWithStops(pickup, stops, dropoff)
            : await calculateGoogleDistanceMatrix(pickup, dropoff);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickup, dropoff, stopsKey]);

  // 2. Fetch server quote from /api/quote
  const fetchQuote = useCallback(
    async (vSlug: string) => {
      try {
        const res = await fetch('/api/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vehicleSlug: vSlug,
            serviceType: selectedService,
            estimatedMiles,
            estimatedMinutes,
            hourlyCount,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setServerQuotes((prev) => ({ ...prev, [vSlug]: data }));
          return data;
        }
      } catch (err) {
        console.warn('Quote fetch error:', err);
      }
      return null;
    },
    [selectedService, estimatedMiles, estimatedMinutes, hourlyCount]
  );

  // Refresh server quotes for the whole fleet whenever route or service changes,
  // so pricing is already cached before the customer reaches vehicle selection.
  useEffect(() => {
    FLEET_DATA.forEach((vehicle) => fetchQuote(vehicle.slug));
  }, [fetchQuote]);

  // Step 2: When the customer picks a vehicle, re-fetch its quote fresh from the
  // database (base fare / base miles / per-mile rate may have changed since the
  // background prefetch above ran), showing a loader for the round trip.
  const selectVehicle = useCallback(
    async (vSlug: string) => {
      setSelectedVehicle(vSlug);
      setQuoteLoading(true);
      try {
        await fetchQuote(vSlug);
      } finally {
        setQuoteLoading(false);
      }
    },
    [fetchQuote]
  );

  // Client-side fallback calculation if server response is pending
  const calculateVehiclePrice = useCallback(
    (vehicle: (typeof FLEET_DATA)[0]): PriceCalculationResult => {
      if (serverQuotes[vehicle.slug]) {
        return serverQuotes[vehicle.slug];
      }

      const isHourly = selectedService.toLowerCase().includes('hour');

      return pricingService.calculate({
        serviceType: isHourly ? 'hourly' : 'point-to-point',
        vehicleConfig: {
          rateHourly: vehicle.rateHourly || 85,
          baseFare: 65,
          baseMiles: 10,
          perMileRate: 4,
        },
        hourlyCount,
        estimatedMiles,
        estimatedMinutes,
      });
    },
    [serverQuotes, selectedService, hourlyCount, estimatedMiles, estimatedMinutes]
  );

  const chosenVehicleObj =
    FLEET_DATA.find((v) => v.slug === selectedVehicle) || FLEET_DATA[0];

  const currentVehiclePrice = calculateVehiclePrice(chosenVehicleObj);

  // Step 2: Compute Tip amount
  const tipAmount =
    tipPercent !== null
      ? Math.round(currentVehiclePrice.totalBeforeTip * (tipPercent / 100) * 100) / 100
      : Math.max(0, customTipAmount ?? 0);

  // Step 3: Final Total = Fare + Tip
  const totalWithTip = Math.round((currentVehiclePrice.totalBeforeTip + tipAmount) * 100) / 100;

  return {
    selectedService,
    setSelectedService,
    selectedVehicle,
    setSelectedVehicle,
    selectVehicle,
    quoteLoading,
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
    // Step 2 & 3: Tip & Total
    tipPercent,
    setTipPercent,
    customTipAmount,
    setCustomTipAmount,
    tipAmount,
    totalWithTip,
  };
}
