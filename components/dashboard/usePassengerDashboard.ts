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
  stops: string | null;
  pickupDate: string;
  pickupTime: string;
  passengers: number;
  paymentStatus: string;
  status: string;
  estimatedPrice: number;
  capturedAmount: number | null;
  createdAt: string;
}

interface DashboardData {
  bookings: BookingRecord[];
  loading: boolean;
}

export function usePassengerDashboard(email: string): DashboardData {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/bookings?email=${encodeURIComponent(email)}`);
        if (res.ok) {
          const data = await res.json();
          setBookings(data.bookings || []);
        }
      } catch (err) {
        console.error('[PassengerDashboard] Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [email]);

  return { bookings, loading };
}
