'use client';

import React, { useEffect, useRef, useState } from 'react';
import { getGoogleMapsApiKey, loadGoogleMapsScript } from '@/lib/services/GoogleMapsService';

interface RouteMapPreviewProps {
  pickup: string;
  dropoff: string;
  stops?: string[];
  estimatedMiles: number;
  estimatedMinutes: number;
}

// Minimal shape of the `window.google.maps` namespace we rely on here.
// No @types/google.maps package is installed in this project, so — consistent
// with lib/services/GoogleMapsService.ts — we type just what we touch.
interface GoogleMapsNamespace {
  Map: new (el: HTMLElement, opts: Record<string, unknown>) => GoogleMapInstance;
  Marker: new (opts: Record<string, unknown>) => GoogleMarkerInstance;
  DirectionsService: new () => {
    route: (
      request: Record<string, unknown>,
      callback: (result: DirectionsResult | null, status: string) => void
    ) => void;
  };
  DirectionsRenderer: new (opts: Record<string, unknown>) => {
    setMap: (map: GoogleMapInstance | null) => void;
  };
  Geocoder: new () => {
    geocode: (
      req: { address: string },
      callback: (results: Array<{ geometry: { location: unknown } }> | null, status: string) => void
    ) => void;
  };
  SymbolPath: { CIRCLE: number };
  TravelMode: { DRIVING: string };
}

interface GoogleMapInstance {
  setCenter: (position: unknown) => void;
  setZoom: (zoom: number) => void;
}

interface GoogleMarkerInstance {
  setMap: (map: GoogleMapInstance | null) => void;
}

interface DirectionsResult {
  routes: Array<{
    legs: Array<{ start_location: unknown; end_location: unknown }>;
  }>;
}

interface DirectionsWaypoint {
  location: string;
  stopover: boolean;
}

function getGoogleMapsNamespace(): GoogleMapsNamespace | null {
  return (window as unknown as { google?: { maps?: GoogleMapsNamespace } }).google?.maps || null;
}

const PICKUP_PIN_COLOR = '#b8860b';
const DROPOFF_PIN_COLOR = '#16a34a';
const STOP_PIN_COLOR = '#2563eb';
const BOSTON_CENTER = { lat: 42.3601, lng: -71.0589 };

export const RouteMapPreview: React.FC<RouteMapPreviewProps> = ({
  pickup,
  dropoff,
  stops = [],
  estimatedMiles,
  estimatedMinutes,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GoogleMapInstance | null>(null);
  const directionsRendererRef = useRef<{ setMap: (map: GoogleMapInstance | null) => void } | null>(null);
  const markersRef = useRef<GoogleMarkerInstance[]>([]);
  const requestTokenRef = useRef(0);
  const [mapsReady, setMapsReady] = useState(false);

  const apiKey = getGoogleMapsApiKey();
  const hasRoute = Boolean(pickup && dropoff);
  const singleLocation = pickup || dropoff;

  // Load the Maps JS SDK once.
  useEffect(() => {
    if (!apiKey) return;
    let cancelled = false;
    loadGoogleMapsScript().then((loaded) => {
      if (!cancelled && loaded) setMapsReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  // Create the map instance once the SDK is ready.
  useEffect(() => {
    if (!mapsReady || !mapContainerRef.current || mapRef.current) return;
    const maps = getGoogleMapsNamespace();
    if (!maps) return;

    mapRef.current = new maps.Map(mapContainerRef.current, {
      center: BOSTON_CENTER,
      zoom: 11,
      disableDefaultUI: true,
      zoomControl: true,
      clickableIcons: false,
    });
  }, [mapsReady]);

  // Draw the pickup/dropoff pins and the route line between them, with no
  // address text — just a start pin, a green dropoff pin, and a connecting line.
  useEffect(() => {
    if (!mapsReady || !mapRef.current) return;
    const maps = getGoogleMapsNamespace();
    if (!maps) return;
    const map = mapRef.current;

    // Stale-response guard: a slower-resolving request from a previous run
    // (e.g. the route before a stop was removed) must not clobber a newer
    // run's result if it resolves after it.
    const requestToken = ++requestTokenRef.current;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
      directionsRendererRef.current = null;
    }

    const makePin = (position: unknown, color: string, label?: string) =>
      new maps.Marker({
        map,
        position,
        label: label
          ? { text: label, color: '#ffffff', fontSize: '10px', fontWeight: '700' }
          : undefined,
        icon: {
          path: maps.SymbolPath.CIRCLE,
          scale: label ? 10 : 8,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

    const validStops = stops.filter((s) => s.trim().length > 0);

    if (hasRoute) {
      const directionsService = new maps.DirectionsService();
      const waypoints: DirectionsWaypoint[] = validStops.map((s) => ({ location: s, stopover: true }));
      directionsService.route(
        {
          origin: pickup,
          destination: dropoff,
          waypoints,
          optimizeWaypoints: false,
          travelMode: maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status !== 'OK' || !result) return;
          if (requestToken !== requestTokenRef.current) return; // stale response, a newer run superseded it

          directionsRendererRef.current = new maps.DirectionsRenderer({
            map,
            directions: result,
            suppressMarkers: true,
            suppressInfoWindows: true,
            polylineOptions: { strokeColor: '#b8860b', strokeWeight: 4 },
          });

          const legs = result.routes[0]?.legs;
          if (legs && legs.length > 0) {
            const stopMarkers = legs
              .slice(0, -1)
              .map((leg, idx) => makePin(leg.end_location, STOP_PIN_COLOR, String(idx + 1)));

            markersRef.current = [
              makePin(legs[0].start_location, PICKUP_PIN_COLOR),
              ...stopMarkers,
              makePin(legs[legs.length - 1].end_location, DROPOFF_PIN_COLOR),
            ];
          }
        }
      );
    } else if (singleLocation) {
      const geocoder = new maps.Geocoder();
      geocoder.geocode({ address: singleLocation }, (results, status) => {
        if (status !== 'OK' || !results?.[0]) return;
        if (requestToken !== requestTokenRef.current) return; // stale response, a newer run superseded it
        const position = results[0].geometry.location;
        map.setCenter(position);
        map.setZoom(13);
        markersRef.current = [makePin(position, dropoff ? DROPOFF_PIN_COLOR : PICKUP_PIN_COLOR)];
      });
    }
  }, [mapsReady, pickup, dropoff, stops, hasRoute, singleLocation]);

  // No-JS-key fallback: plain embed iframe (Google renders its own default UI/text here).
  // Intermediate stops are chained onto daddr with "+to:" segments.
  const validStopsForEmbed = stops.filter((s) => s.trim().length > 0);
  const daddrChain = [...validStopsForEmbed, dropoff].map(encodeURIComponent).join('+to:');
  const googleMapEmbedUrl = hasRoute
    ? `https://maps.google.com/maps?saddr=${encodeURIComponent(pickup)}&daddr=${daddrChain}&output=embed`
    : `https://maps.google.com/maps?q=${encodeURIComponent(singleLocation || 'Boston, MA')}&output=embed`;

  // Format duration: show hours + minutes when >= 60
  const formattedDuration =
    estimatedMinutes >= 60
      ? `${Math.floor(estimatedMinutes / 60)} Hrs${estimatedMinutes % 60 > 0 ? ` ${estimatedMinutes % 60} Mins` : ''}`
      : `${estimatedMinutes} Mins`;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '210px',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
      }}
    >
      {apiKey ? (
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      ) : (
        <iframe
          src={googleMapEmbedUrl}
          width="100%"
          height="100%"
          style={{ border: 0, display: 'block' }}
          allowFullScreen
          loading="lazy"
          title="Location Map Preview"
        ></iframe>
      )}

      {estimatedMiles > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '0.5rem',
            left: '0.5rem',
            backgroundColor: '#ffffff',
            color: '#b8860b',
            fontWeight: 800,
            fontSize: '0.8rem',
            padding: '0.3rem 0.6rem',
            borderRadius: '999px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            pointerEvents: 'none',
          }}
        >
          {estimatedMiles.toFixed(1)} mi
        </div>
      )}
    </div>
  );
};
