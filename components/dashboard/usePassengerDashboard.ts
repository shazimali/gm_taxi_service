// ── Custom hook: owns all data-fetching logic (D — Dependency Inversion) ───────
// The view components depend on this hook's interface, not on raw fetch() calls.
// To swap the data source (SWR, React Query, mock), only this file changes.

import { useEffect, useState } from 'react';

export interface BookingRecord {
  id: string;
  confirmationNumber: string;
  serviceType: string;
  vehicleSlug: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  passengers: number;
  paymentStatus: string;
  status: string;
  estimatedPrice: number;
  createdAt: string;
}

export interface CardData {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

interface DashboardData {
  bookings: BookingRecord[];
  cards: CardData[];
  loading: boolean;
}

export function usePassengerDashboard(email: string): DashboardData {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [bookingsRes, cardsRes] = await Promise.all([
          fetch(`/api/bookings?email=${encodeURIComponent(email)}`),
          fetch('/api/passenger/cards'),
        ]);

        if (bookingsRes.ok) {
          const data = await bookingsRes.json();
          setBookings(data.bookings || []);
        }

        if (cardsRes.ok) {
          const data = await cardsRes.json();
          setCards(data.cards || []);
        }
      } catch (err) {
        console.error('[PassengerDashboard] Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [email]);

  return { bookings, cards, loading };
}
