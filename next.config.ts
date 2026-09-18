import type { NextConfig } from "next";

// Content-Security-Policy: no-nonce variant, so static rendering/ISR stay intact.
// 'unsafe-inline' is required for script/style-src because the app renders
// inline JSON-LD (app/layout.tsx) and inline styles throughout — tightening
// further would require a nonce-based CSP generated in proxy.ts, which forces
// every page to dynamic rendering.
const isDev = process.env.NODE_ENV !== 'production';

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ''} https://maps.googleapis.com https://js.stripe.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https://maps.gstatic.com https://maps.googleapis.com https://*.stripe.com;
  font-src 'self' data: https://fonts.gstatic.com;
  connect-src 'self' https://maps.googleapis.com https://places.googleapis.com https://routes.googleapis.com https://nominatim.openstreetmap.org https://api.stripe.com;
  frame-src https://js.stripe.com https://hooks.stripe.com https://www.google.com https://maps.google.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
// Server config updated at 2026-09-10T21:01:00
