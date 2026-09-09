'use client';

import { useEffect, useState } from 'react';
import { FLEET_DATA } from '@/data/fleetData';
import { calculateGoogleDistanceMatrix, distanceService, pricingService } from '@/lib/services';

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

  // Estimate distance and travel time using DistanceService + Google Distance Matrix
  useEffect(() => {
    if (!pickup || !dropoff) return;

    // 1. Set instant baseline estimate from rule-based service
    const baseline = distanceService.estimate(pickup, dropoff);
    setEstimatedMiles(baseline.miles);
    setEstimatedMinutes(baseline.minutes);

    // 2. Fetch actual driving distance & duration via Google Maps Distance Matrix if available
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


  const chosenVehicleObj =
    FLEET_DATA.find((v) => v.slug === selectedVehicle) || FLEET_DATA[0];

  const calculateVehiclePrice = (vehicle: (typeof FLEET_DATA)[0]) => {
    return pricingService.calculate({
      rateHourly: vehicle.rateHourly || 85,
      serviceType: selectedService,
      estimatedMinutes,
      hourlyCount,
    });
  };

  const currentVehiclePrice = calculateVehiclePrice(chosenVehicleObj);

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
  };
}
