/**
 * lib/services/GoogleMapsService.ts
 *
 * Google Maps integration helper:
 * - Dynamic asynchronous script loader with singleton promise cache
 * - Google Places Autocomplete predictions
 * - Reverse Geocoding (GPS coordinates -> actual street address) with graceful OSM fallback
 * - Google Distance Matrix driving calculation with fallback
 */

let scriptLoadingPromise: Promise<boolean> | null = null;

/**
 * Bounding box covering the New England states (CT, ME, MA, NH, RI, VT).
 * Used to restrict Places Autocomplete results to this service area.
 */
export const NEW_ENGLAND_BOUNDS = {
  south: 40.95,
  west: -73.75,
  north: 47.5,
  east: -66.85,
};

/**
 * Returns the public Google Maps API Key configured in the environment.
 */
export function getGoogleMapsApiKey(): string {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    ''
  ).trim();
}

/**
 * Asynchronously loads the Google Maps JavaScript API with Places and Geometry libraries.
 */
export function loadGoogleMapsScript(customApiKey?: string): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);

  // Check if already available on window
  if ((window as unknown as { google?: { maps?: { places?: unknown } } }).google?.maps?.places) {
    return Promise.resolve(true);
  }

  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  const apiKey = customApiKey || getGoogleMapsApiKey();
  if (!apiKey || apiKey === 'AIzaSy...') {
    return Promise.resolve(false);
  }

  scriptLoadingPromise = new Promise<boolean>((resolve) => {
    const existingScript = document.getElementById('google-maps-js-sdk') as HTMLScriptElement | null;
    if (existingScript) {
      if ((window as unknown as { google?: { maps?: unknown } }).google?.maps) {
        resolve(true);
        return;
      }
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-js-sdk';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places,geometry&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      console.warn('Failed to load Google Maps SDK.');
      resolve(false);
    };

    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

/**
 * Fetches place autocomplete suggestions using the modern
 * google.maps.places.AutocompleteSuggestion API (recommended since March 2025).
 *
 * Uses importLibrary("places") to access the new class and session tokens
 * to group keystrokes into a single billing session.
 */
export async function getGooglePlacePredictions(input: string): Promise<string[]> {
  if (!input || input.trim().length < 2) return [];

  const loaded = await loadGoogleMapsScript();
  if (!loaded) return [];

  try {
    const googleObj = (window as unknown as {
      google?: {
        maps?: {
          importLibrary: (lib: string) => Promise<{
            AutocompleteSuggestion?: {
              fetchAutocompleteSuggestions: (opts: {
                input: string;
                sessionToken?: unknown;
                locationRestriction?: {
                  west: number;
                  north: number;
                  east: number;
                  south: number;
                };
              }) => Promise<{
                suggestions: Array<{
                  placePrediction?: {
                    text?: { text: string };
                  };
                }>;
              }>;
            };
            AutocompleteSessionToken?: new () => unknown;
          }>;
        };
      };
    }).google;

    if (!googleObj?.maps?.importLibrary) return [];

    const placesLib = await googleObj.maps.importLibrary('places');

    // New API: AutocompleteSuggestion
    if (placesLib.AutocompleteSuggestion) {
      const sessionToken = placesLib.AutocompleteSessionToken
        ? new placesLib.AutocompleteSessionToken()
        : undefined;

      const { suggestions } = await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input,
        sessionToken,
        locationRestriction: NEW_ENGLAND_BOUNDS,
      });

      if (suggestions && suggestions.length > 0) {
        return suggestions
          .filter((s) => s.placePrediction?.text?.text)
          .map((s) => s.placePrediction!.text!.text);
      }
    }

    return [];
  } catch (err) {
    console.warn('Google Places autocomplete query error:', err);
    return [];
  }
}

/**
 * Reverse geocodes latitude & longitude coordinates to an actual formatted street address.
 * Attempts Google Maps Geocoder first; falls back to OpenStreetMap Nominatim if Google Maps is unavailable.
 */
export async function reverseGeocodeToAddress(lat: number, lng: number): Promise<string | null> {
  const loaded = await loadGoogleMapsScript();

  if (loaded) {
    const googleObj = (window as unknown as {
      google?: {
        maps?: {
          Geocoder: new () => {
            geocode: (
              req: { location: { lat: number; lng: number } },
              cb: (results: Array<{ formatted_address: string }> | null, status: string) => void
            ) => void;
          };
        };
      };
    }).google;

    if (googleObj?.maps?.Geocoder) {
      try {
        const geocoder = new googleObj.maps.Geocoder();
        const address = await new Promise<string | null>((resolve) => {
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results && results[0]?.formatted_address) {
              resolve(results[0].formatted_address);
            } else {
              resolve(null);
            }
          });
        });

        if (address) return address;
      } catch (e) {
        console.warn('Google Geocoder reverse geocode error:', e);
      }
    }
  }

  // Graceful fallback: OpenStreetMap Reverse Geocoding
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    if (res.ok) {
      const data = await res.json();
      if (data?.display_name) {
        return data.display_name;
      }
    }
  } catch (osmErr) {
    console.warn('OSM reverse geocode fallback error:', osmErr);
  }

  return null;
}

/**
 * Calculates actual driving distance & duration between two locations using
 * the Google Routes API (computeRouteMatrix) — recommended over the legacy
 * DistanceMatrixService per https://developers.google.com/maps/documentation/javascript/routes/route-matrix-js-migration
 *
 * Falls back gracefully to null if the API key is missing, quota is exceeded,
 * or the endpoint is unreachable.
 */
export async function calculateGoogleDistanceMatrix(
  origin: string,
  destination: string
): Promise<{ miles: number; minutes: number } | null> {
  if (!origin || !destination) return null;

  const apiKey = getGoogleMapsApiKey();
  if (!apiKey || apiKey === 'AIzaSy...') return null;

  try {
    const response = await fetch(
      'https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          // Only request the fields we need to minimise billing cost
          'X-Goog-FieldMask':
            'originIndex,destinationIndex,status,distanceMeters,duration',
        },
        body: JSON.stringify({
          origins: [
            {
              waypoint: { address: origin },
              routeModifiers: { avoidTolls: false },
            },
          ],
          destinations: [
            {
              waypoint: { address: destination },
            },
          ],
          travelMode: 'DRIVE',
          routingPreference: 'TRAFFIC_AWARE',
        }),
      }
    );

    if (!response.ok) {
      console.warn('Routes API computeRouteMatrix HTTP error:', response.status, response.statusText);
      return null;
    }

    // The endpoint returns an array of route elements
    const data: Array<{
      status?: { code?: number };
      distanceMeters?: number;
      duration?: string; // e.g. "1234s"
    }> = await response.json();

    if (!Array.isArray(data) || data.length === 0) return null;

    const element = data[0];

    // status.code === 0 means OK (google.rpc.Code)
    if (element.status?.code !== undefined && element.status.code !== 0) {
      console.warn('Routes API route element status error:', element.status);
      return null;
    }

    const distanceMeters = element.distanceMeters ?? 0;

    // duration comes as a proto Duration string like "1234s"
    const durationSeconds = element.duration
      ? parseInt(element.duration.replace('s', ''), 10)
      : 0;

    if (distanceMeters === 0) return null;

    const miles = Math.max(1, Math.round((distanceMeters / 1609.344) * 10) / 10);
    const minutes = Math.max(5, Math.round(durationSeconds / 60));

    return { miles, minutes };
  } catch (err) {
    console.warn('Routes API computeRouteMatrix error:', err);
    return null;
  }
}

/**
 * Calculates total driving distance & duration for a multi-stop route
 * (pickup -> stop 1 -> stop 2 -> ... -> dropoff) by summing each leg via
 * calculateGoogleDistanceMatrix. Returns null if any leg cannot be resolved.
 */
export async function calculateGoogleRouteWithStops(
  pickup: string,
  stops: string[],
  dropoff: string
): Promise<{ miles: number; minutes: number } | null> {
  const waypoints = [pickup, ...stops.filter((s) => s.trim().length > 0), dropoff];
  if (waypoints.length < 2) return null;

  let totalMiles = 0;
  let totalMinutes = 0;

  for (let i = 0; i < waypoints.length - 1; i++) {
    const leg = await calculateGoogleDistanceMatrix(waypoints[i], waypoints[i + 1]);
    if (!leg) return null;
    totalMiles += leg.miles;
    totalMinutes += leg.minutes;
  }

  return {
    miles: Math.round(totalMiles * 10) / 10,
    minutes: Math.round(totalMinutes),
  };
}

