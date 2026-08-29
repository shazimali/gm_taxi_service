'use client';

import React from 'react';
import { Navigation } from 'lucide-react';

interface RouteMapPreviewProps {
  pickup: string;
  dropoff: string;
  estimatedMiles: number;
  estimatedMinutes: number;
}

export const RouteMapPreview: React.FC<RouteMapPreviewProps> = ({
  pickup,
  dropoff,
  estimatedMiles,
  estimatedMinutes,
}) => {
  const mapOrigin = encodeURIComponent(pickup || 'Boston Logan Airport');
  const mapDestination = encodeURIComponent(dropoff || 'Boston MA');
  const googleMapEmbedUrl = `https://maps.google.com/maps?q=from+${mapOrigin}+to+${mapDestination}&output=embed`;

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '1.25rem',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#b8860b',
            fontWeight: 800,
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          <Navigation size={18} />
          <span>Google Map Route &amp; Distance Matrix</span>
        </div>

        <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem', color: '#334155' }}>
          <span>
            Distance: <strong style={{ color: '#b8860b', fontWeight: 800 }}>{estimatedMiles} Miles</strong>
          </span>
          <span>
            Duration: <strong style={{ color: '#b8860b', fontWeight: 800 }}>{estimatedMinutes} Mins</strong>
          </span>
        </div>
      </div>

      <div
        style={{
          height: '200px',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid #cbd5e1',
        }}
      >
        <iframe
          src={googleMapEmbedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          title="Google Route Preview"
        ></iframe>
      </div>
    </div>
  );
};
