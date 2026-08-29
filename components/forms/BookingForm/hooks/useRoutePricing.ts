'use client';

import { useEffect, useState } from 'react';
import { FLEET_DATA } from '@/data/fleetData';
import { distanceService, pricingService } from '@/lib/services';

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

  // Estimate distance and travel time using DistanceService
  useEffect(() => {
    if (!pickup || !dropoff) return;
    const estimate = distanceService.estimate(pickup, dropoff);
    setEstimatedMiles(estimate.miles);
    setEstimatedMinutes(estimate.minutes);
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
