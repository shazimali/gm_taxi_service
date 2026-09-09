'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { type LocationResult } from '../types';
import {
  getGooglePlacePredictions,
  loadGoogleMapsScript,
  reverseGeocodeToAddress,
} from '@/lib/services/GoogleMapsService';

export function useLocationSearch() {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [pickupFinalized, setPickupFinalized] = useState(false);
  const [dropoffFinalized, setDropoffFinalized] = useState(false);

  const [pickupSuggestions, setPickupSuggestions] = useState<string[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<string[]>([]);

  const [loadingPickup, setLoadingPickup] = useState(false);
  const [loadingDropoff, setLoadingDropoff] = useState(false);
  const [detectingPickupLocation, setDetectingPickupLocation] = useState(false);

  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [showDropoffDropdown, setShowDropoffDropdown] = useState(false);

  const pickupContainerRef = useRef<HTMLDivElement>(null);
  const dropoffContainerRef = useRef<HTMLDivElement>(null);

  // Pre-load Google Maps SDK on mount if key exists
  useEffect(() => {
    loadGoogleMapsScript();
  }, []);

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

  // Live Location Search for Pickup (Google Places -> OpenStreetMap fallback)
  useEffect(() => {
    if (!pickup || pickup.trim().length < 2) {
      setPickupSuggestions([]);
      setShowPickupDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingPickup(true);
      try {
        // 1. Try Google Places Autocomplete first
        const googlePredictions = await getGooglePlacePredictions(pickup);
        if (googlePredictions && googlePredictions.length > 0) {
          setPickupSuggestions(googlePredictions);
          setShowPickupDropdown(true);
          return;
        }

        // 2. Fallback to OpenStreetMap Nominatim
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(pickup)}&limit=6&addressdetails=1`
        );
        if (res.ok) {
          const data: LocationResult[] = await res.json();
          if (data && data.length > 0) {
            setPickupSuggestions(data.map((item) => item.display_name));
            setShowPickupDropdown(true);
          } else {
            setPickupSuggestions([]);
          }
        } else {
          setPickupSuggestions([]);
        }
      } catch {
        setPickupSuggestions([]);
      } finally {
        setLoadingPickup(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [pickup]);

  // Live Location Search for Dropoff (Google Places -> OpenStreetMap fallback)
  useEffect(() => {
    if (!dropoff || dropoff.trim().length < 2) {
      setDropoffSuggestions([]);
      setShowDropoffDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingDropoff(true);
      try {
        // 1. Try Google Places Autocomplete first
        const googlePredictions = await getGooglePlacePredictions(dropoff);
        if (googlePredictions && googlePredictions.length > 0) {
          setDropoffSuggestions(googlePredictions);
          setShowDropoffDropdown(true);
          return;
        }

        // 2. Fallback to OpenStreetMap Nominatim
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(dropoff)}&limit=6&addressdetails=1`
        );
        if (res.ok) {
          const data: LocationResult[] = await res.json();
          if (data && data.length > 0) {
            setDropoffSuggestions(data.map((item) => item.display_name));
            setShowDropoffDropdown(true);
          } else {
            setDropoffSuggestions([]);
          }
        } else {
          setDropoffSuggestions([]);
        }
      } catch {
        setDropoffSuggestions([]);
      } finally {
        setLoadingDropoff(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [dropoff]);


  // Fetch actual physical pickup point using device GPS & Reverse Geocoding
  const detectCurrentPickupLocation = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setDetectingPickupLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const address = await reverseGeocodeToAddress(latitude, longitude);

          if (address) {
            setPickup(address);
            setPickupFinalized(true);
            setShowPickupDropdown(false);
          } else {
            // Coordinate fallback format
            const fallbackCoord = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            setPickup(fallbackCoord);
            setPickupFinalized(true);
            setShowPickupDropdown(false);
          }
        } catch (err) {
          console.error('Error resolving pickup point:', err);
          alert('Unable to resolve your exact street address. Please type your location manually.');
        } finally {
          setDetectingPickupLocation(false);
        }
      },
      (error) => {
        setDetectingPickupLocation(false);
        let errorMsg = 'Could not detect your current pickup location.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location permission was denied. Please allow location access in your browser settings or type your pickup address.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Location information is currently unavailable. Please enter your pickup point manually.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Location request timed out. Please try again or enter your pickup point manually.';
        }
        alert(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 10000,
      }
    );
  }, []);

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
    detectingPickupLocation,
    detectCurrentPickupLocation,
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

