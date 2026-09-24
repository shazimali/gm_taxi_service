'use client';

import { usePathname } from 'next/navigation';

interface WhatsAppWidgetProps {
  phoneTel?: string;
}

const DEFAULT_MESSAGE = 'Hello GM Limo Services, I would like to inquire about a ride.';

export default function WhatsAppWidget({ phoneTel }: WhatsAppWidgetProps) {
  const pathname = usePathname();

  // Same number is used for calls and WhatsApp; wa.me needs digits only (country code included)
  const waNumber = (phoneTel || '').replace(/\D/g, '');

  if (!waNumber || pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard')) {
    return null;
  }

  const href = `https://wa.me/${waNumber}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={href}
      className="floating-chat-btn"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      title="Chat with us on WhatsApp"
    >
      <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true" fill="currentColor">
        <path d="M16.004 3C8.828 3 3 8.826 3 16c0 2.294.6 4.533 1.74 6.51L3 29l6.66-1.713A12.95 12.95 0 0 0 16.004 29C23.18 29 29 23.174 29 16S23.18 3 16.004 3Zm0 23.636a10.6 10.6 0 0 1-5.412-1.48l-.388-.23-3.953 1.017 1.054-3.853-.253-.396A10.58 10.58 0 0 1 5.37 16c0-5.863 4.77-10.634 10.634-10.634 5.862 0 10.63 4.77 10.63 10.634 0 5.862-4.768 10.636-10.63 10.636Zm5.832-7.964c-.32-.16-1.89-.932-2.183-1.04-.293-.106-.506-.16-.72.16-.212.32-.826 1.04-1.013 1.253-.186.213-.373.24-.693.08-.32-.16-1.35-.498-2.572-1.588-.95-.848-1.592-1.894-1.778-2.214-.187-.32-.02-.493.14-.652.144-.143.32-.373.48-.56.16-.186.213-.32.32-.533.106-.213.053-.4-.027-.56-.08-.16-.72-1.733-.986-2.373-.26-.623-.524-.54-.72-.55l-.613-.01c-.213 0-.56.08-.853.4-.293.32-1.12 1.093-1.12 2.666 0 1.573 1.146 3.093 1.306 3.306.16.213 2.256 3.444 5.466 4.83.764.33 1.36.527 1.825.674.767.244 1.465.21 2.017.127.615-.092 1.89-.772 2.157-1.518.267-.747.267-1.387.187-1.52-.08-.134-.293-.214-.613-.374Z" />
      </svg>
    </a>
  );
}
