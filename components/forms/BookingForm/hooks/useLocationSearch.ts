'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type LocationResult, type StopItem } from '../types';
import {
  getGooglePlacePredictions,
  loadGoogleMapsScript,
  reverseGeocodeToAddress,
  NEW_ENGLAND_BOUNDS,
} from '@/lib/services/GoogleMapsService';

// Nominatim viewbox is left,top,right,bottom i.e. west,north,east,south
const NOMINATIM_VIEWBOX = `${NEW_ENGLAND_BOUNDS.west},${NEW_ENGLAND_BOUNDS.north},${NEW_ENGLAND_BOUNDS.east},${NEW_ENGLAND_BOUNDS.south}`;

function makeStopId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `stop-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function searchLocationSuggestions(query: string): Promise<string[]> {
  const googlePredictions = await getGooglePlacePredictions(query);
  if (googlePredictions && googlePredictions.length > 0) return googlePredictions;

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6&addressdetails=1&viewbox=${NOMINATIM_VIEWBOX}&bounded=1`
  );
  if (res.ok) {
    const data: LocationResult[] = await res.json();
    if (data && data.length > 0) return data.map((item) => item.display_name);
  }
  return [];
}

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

  // Intermediate ride stops (between pickup and dropoff)
  const [stops, setStops] = useState<StopItem[]>([]);
  const stopTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const stopContainersRef = useRef<Map<string, HTMLDivElement | null>>(new Map());

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
      stopContainersRef.current.forEach((el, id) => {
        if (el && !el.contains(e.target as Node)) {
          setStops((prev) => prev.map((s) => (s.id === id ? { ...s, showDropdown: false } : s)));
        }
      });
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
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(pickup)}&limit=6&addressdetails=1&viewbox=${NOMINATIM_VIEWBOX}&bounded=1`
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
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(dropoff)}&limit=6&addressdetails=1&viewbox=${NOMINATIM_VIEWBOX}&bounded=1`
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

  // Intermediate stop handlers (add/remove/search — same Google Places -> OSM
  // fallback pattern used for pickup/dropoff above, keyed by stable stop id).
  const addStop = useCallback(() => {
    setStops((prev) => [
      ...prev,
      { id: makeStopId(), value: '', finalized: false, suggestions: [], loading: false, showDropdown: false },
    ]);
  }, []);

  const removeStop = useCallback((id: string) => {
    const timer = stopTimersRef.current.get(id);
    if (timer) clearTimeout(timer);
    stopTimersRef.current.delete(id);
    stopContainersRef.current.delete(id);
    setStops((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const updateStop = useCallback((id: string, value: string) => {
    setStops((prev) =>
      prev.map((s) => (s.id === id ? { ...s, value, finalized: false, showDropdown: true } : s))
    );

    const existingTimer = stopTimersRef.current.get(id);
    if (existingTimer) clearTimeout(existingTimer);

    if (!value || value.trim().length < 2) {
      setStops((prev) => prev.map((s) => (s.id === id ? { ...s, suggestions: [], showDropdown: false } : s)));
      return;
    }

    const timer = setTimeout(async () => {
      setStops((prev) => prev.map((s) => (s.id === id ? { ...s, loading: true } : s)));
      try {
        const suggestions = await searchLocationSuggestions(value);
        setStops((prev) =>
          prev.map((s) =>
            s.id === id ? { ...s, suggestions, showDropdown: suggestions.length > 0, loading: false } : s
          )
        );
      } catch {
        setStops((prev) => prev.map((s) => (s.id === id ? { ...s, suggestions: [], loading: false } : s)));
      }
    }, 300);
    stopTimersRef.current.set(id, timer);
  }, []);

  const selectStopSuggestion = useCallback((id: string, value: string) => {
    setStops((prev) =>
      prev.map((s) => (s.id === id ? { ...s, value, finalized: true, suggestions: [], showDropdown: false } : s))
    );
  }, []);

  const finalizeStopOnBlur = useCallback((id: string) => {
    setStops((prev) =>
      prev.map((s) => (s.id === id && s.value.trim().length >= 3 ? { ...s, finalized: true } : s))
    );
  }, []);

  const setShowStopDropdown = useCallback((id: string, show: boolean) => {
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, showDropdown: show } : s)));
  }, []);

  const stopContainerRef = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      stopContainersRef.current.set(id, el);
    },
    []
  );

  // Finalized, non-empty stop addresses in order — what distance calc, the
  // map, and the booking payload actually care about. Memoized on a content
  // key (not just `stops`, which changes reference on every keystroke/loading
  // update) so consumers relying on referential stability — e.g. the map's
  // useEffect deps — don't re-fire unless a stop was actually added/removed.
  const validStopsKey = stops
    .filter((s) => s.finalized && s.value.trim().length >= 3)
    .map((s) => s.value.trim())
    .join('|');
  const validStops = useMemo(
    () => (validStopsKey ? validStopsKey.split('|') : []),
    [validStopsKey]
  );

  const resetLocations = () => {
    setPickup('');
    setDropoff('');
    setPickupFinalized(false);
    setDropoffFinalized(false);
    stopTimersRef.current.forEach((timer) => clearTimeout(timer));
    stopTimersRef.current.clear();
    stopContainersRef.current.clear();
    setStops([]);
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
    stops,
    addStop,
    removeStop,
    updateStop,
    selectStopSuggestion,
    finalizeStopOnBlur,
    setShowStopDropdown,
    stopContainerRef,
    validStops,
    resetLocations,
  };
}

