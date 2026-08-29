import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminDashboardView from '@/components/dashboard/AdminDashboardView';
import PassengerDashboardView from '@/components/dashboard/PassengerDashboardView';

export const metadata = {
  title: 'Dashboard | GM Limo Services',
  description: 'Manage your GM Limo reservations, fleet, and account details.',
};

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // 1. Admin Role View
  if (user.role === 'ADMIN') {
    const [vehicleCount, serviceCount, airportCount, bookingCount, recentBookings] =
      await Promise.all([
        prisma.vehicle.count(),
        prisma.service.count(),
        prisma.airport.count(),
        prisma.booking.count(),
        prisma.booking.findMany({
          take: 6,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            confirmationNumber: true,
            fullName: true,
            phone: true,
            serviceType: true,
            pickupDate: true,
            pickupTime: true,
            status: true,
            estimatedPrice: true,
            paymentStatus: true,
          },
        }),
      ]);

    return (
      <AdminDashboardView
        user={user}
        stats={{
          vehicleCount,
          serviceCount,
          airportCount,
          bookingCount,
          recentBookings,
        }}
      />
    );
  }

  // 2. Passenger Role View
  return <PassengerDashboardView user={user} />;
}
