'use client';

import { useEffect, useState, useCallback } from 'react';
import { FLEET_DATA, type Vehicle } from '@/data/fleetData';
import {
  calculateGoogleDistanceMatrix,
  calculateGoogleRouteWithStops,
  distanceService,
  pricingService,
} from '@/lib/services';
import type { PriceCalculationResult } from '@/lib/services';

export function useRoutePricing(
  pickup: string,
  dropoff: string,
  stops: string[] = [],
  initialService = 'Airport Transportation'
) {
  // Fleet list (vehicle names, images, capacities) is loaded from the database
  // so admin-managed uploads show up in the booking form. Static FLEET_DATA is
  // only the initial render / offline fallback.
  const [fleet, setFleet] = useState<Vehicle[]>(FLEET_DATA);

  useEffect(() => {
    let isCancelled = false;

    fetch('/api/fleet')
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled && Array.isArray(data.fleet) && data.fleet.length > 0) {
          setFleet(data.fleet);
        }
      })
      .catch((err) => console.warn('Fleet fetch error:', err));

    return () => {
      isCancelled = true;
    };
  }, []);

  const [selectedService, setSelectedService] = useState(initialService);
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
  // Cache key includes every input that affects the fare (not just the vehicle),
  // so a stale response for a previous hourlyCount/service/route can never be
  // mistaken for the quote matching the customer's current selection.
  const quoteKey = useCallback(
    (vSlug: string) =>
      `${vSlug}|${selectedService}|${hourlyCount}|${estimatedMiles}|${estimatedMinutes}`,
    [selectedService, hourlyCount, estimatedMiles, estimatedMinutes]
  );

  const fetchQuote = useCallback(
    async (vSlug: string) => {
      const key = quoteKey(vSlug);
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
          setServerQuotes((prev) => ({ ...prev, [key]: data }));
          return data;
        }
      } catch (err) {
        console.warn('Quote fetch error:', err);
      }
      return null;
    },
    [quoteKey, selectedService, estimatedMiles, estimatedMinutes, hourlyCount]
  );

  // Refresh server quotes for the whole fleet whenever route or service changes,
  // so pricing is already cached before the customer reaches vehicle selection.
  useEffect(() => {
    fleet.forEach((vehicle) => fetchQuote(vehicle.slug));
  }, [fleet, fetchQuote]);

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
    (vehicle: Vehicle): PriceCalculationResult => {
      const key = quoteKey(vehicle.slug);
      if (serverQuotes[key]) {
        return serverQuotes[key];
      }

      const isHourly = selectedService.toLowerCase().includes('hour');

      return pricingService.calculate({
        serviceType: isHourly ? 'hourly' : 'point-to-point',
        vehicleConfig: {
          rateHourly: vehicle.rateHourly ?? 85,
          baseFare: 65,
          baseMiles: 10,
          perMileRate: 4,
        },
        hourlyCount,
        estimatedMiles,
        estimatedMinutes,
      });
    },
    [quoteKey, serverQuotes, selectedService, hourlyCount, estimatedMiles, estimatedMinutes]
  );

  const chosenVehicleObj =
    fleet.find((v) => v.slug === selectedVehicle) || fleet[0];

  const currentVehiclePrice = calculateVehiclePrice(chosenVehicleObj);

  // Step 2: Compute Tip amount
  const tipAmount =
    tipPercent !== null
      ? Math.round(currentVehiclePrice.totalBeforeTip * (tipPercent / 100) * 100) / 100
      : Math.max(0, customTipAmount ?? 0);

  // Step 3: Final Total = Fare + Tip
  const totalWithTip = Math.round((currentVehiclePrice.totalBeforeTip + tipAmount) * 100) / 100;

  return {
    fleet,
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
