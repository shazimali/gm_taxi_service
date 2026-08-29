'use client';

import { useEffect, useRef, useState } from 'react';
import { POPULAR_LOCATIONS, type LocationResult } from '../types';

export function useLocationSearch() {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [pickupFinalized, setPickupFinalized] = useState(false);
  const [dropoffFinalized, setDropoffFinalized] = useState(false);

  const [pickupSuggestions, setPickupSuggestions] = useState<string[]>(POPULAR_LOCATIONS);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<string[]>(POPULAR_LOCATIONS);

  const [loadingPickup, setLoadingPickup] = useState(false);
  const [loadingDropoff, setLoadingDropoff] = useState(false);

  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [showDropoffDropdown, setShowDropoffDropdown] = useState(false);

  const pickupContainerRef = useRef<HTMLDivElement>(null);
  const dropoffContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickupContainerRef.current && !pickupContainerRef.current.contains(e.target as Node)) {
        setShowPickupDropdown(false);
      }
      if (dropoffContainerRef.current && !dropoffContainerRef.current.contains(e.target as Node)) {
        setShowDropoffDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live Location Search for Pickup
  useEffect(() => {
    if (!pickup || pickup.trim().length < 2) {
      setPickupSuggestions(POPULAR_LOCATIONS);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingPickup(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(pickup)}&limit=6&addressdetails=1`
        );
        if (res.ok) {
          const data: LocationResult[] = await res.json();
          if (data && data.length > 0) {
            setPickupSuggestions(data.map((item) => item.display_name));
          } else {
            setPickupSuggestions(
              POPULAR_LOCATIONS.filter((loc) => loc.toLowerCase().includes(pickup.toLowerCase()))
            );
          }
        } else {
          setPickupSuggestions(
            POPULAR_LOCATIONS.filter((loc) => loc.toLowerCase().includes(pickup.toLowerCase()))
          );
        }
      } catch {
        setPickupSuggestions(
          POPULAR_LOCATIONS.filter((loc) => loc.toLowerCase().includes(pickup.toLowerCase()))
        );
      } finally {
        setLoadingPickup(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [pickup]);

  // Live Location Search for Dropoff
  useEffect(() => {
    if (!dropoff || dropoff.trim().length < 2) {
      setDropoffSuggestions(POPULAR_LOCATIONS);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingDropoff(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(dropoff)}&limit=6&addressdetails=1`
        );
        if (res.ok) {
          const data: LocationResult[] = await res.json();
          if (data && data.length > 0) {
            setDropoffSuggestions(data.map((item) => item.display_name));
          } else {
            setDropoffSuggestions(
              POPULAR_LOCATIONS.filter((loc) => loc.toLowerCase().includes(dropoff.toLowerCase()))
            );
          }
        } else {
          setDropoffSuggestions(
            POPULAR_LOCATIONS.filter((loc) => loc.toLowerCase().includes(dropoff.toLowerCase()))
          );
        }
      } catch {
        setDropoffSuggestions(
          POPULAR_LOCATIONS.filter((loc) => loc.toLowerCase().includes(dropoff.toLowerCase()))
        );
      } finally {
        setLoadingDropoff(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [dropoff]);

  const isBothLocationsFinal =
    pickupFinalized && dropoffFinalized && pickup.trim().length >= 3 && dropoff.trim().length >= 3;

  const resetLocations = () => {
    setPickup('');
    setDropoff('');
    setPickupFinalized(false);
    setDropoffFinalized(false);
  };

  return {
    pickup,
    setPickup,
    dropoff,
    setDropoff,
    pickupFinalized,
    setPickupFinalized,
    dropoffFinalized,
    setDropoffFinalized,
    pickupSuggestions,
    dropoffSuggestions,
    loadingPickup,
    loadingDropoff,
    showPickupDropdown,
    setShowPickupDropdown,
    showDropoffDropdown,
    setShowDropoffDropdown,
    pickupContainerRef,
    dropoffContainerRef,
    isBothLocationsFinal,
    resetLocations,
  };
}
