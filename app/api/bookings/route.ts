import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fullName,
      email,
      phone,
      serviceType,
      vehicleSlug,
      pickupLocation,
      dropoffLocation,
      pickupDate,
      pickupTime,
      passengers,
      luggage,
      flightNumber,
      specialRequests,
    } = body;

    if (!fullName || !email || !phone || !pickupLocation || !pickupDate || !pickupTime) {
      return NextResponse.json({ error: 'Please fill in all required fields' }, { status: 400 });
    }

    const confirmationNumber = 'GML-' + Math.floor(100000 + Math.random() * 900000);

    const booking = await prisma.booking.create({
      data: {
        confirmationNumber,
        fullName,
        email,
        phone,
        serviceType: serviceType || 'Airport Transportation',
        vehicleSlug: vehicleSlug || 'executive-sedan',
        pickupLocation,
        dropoffLocation: dropoffLocation || '',
        pickupDate,
        pickupTime,
        passengers: Number(passengers) || 1,
        luggage: Number(luggage) || 1,
        flightNumber: flightNumber || '',
        specialRequests: specialRequests || '',
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Booking reservation submitted successfully!',
      confirmationNumber: booking.confirmationNumber,
      booking,
    });
  } catch (error) {
    console.error('Submit booking error:', error);
    return NextResponse.json({ error: 'Failed to process booking submission' }, { status: 500 });
  }
}
