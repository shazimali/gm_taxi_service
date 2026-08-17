import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedAdmin } from '@/lib/auth';

// GET all airport travel rates
export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const travelRates = await prisma.airportTravelRate.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    return NextResponse.json({ travelRates });
  } catch (error) {
    console.error('Fetch travel rates error:', error);
    return NextResponse.json({ error: 'Failed to fetch travel rates' }, { status: 500 });
  }
}

// POST create travel rate
export async function POST(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { location, distance, time, price, pickupZone, displayOrder, isActive } = body;

    if (!location || !distance || !time || !pickupZone) {
      return NextResponse.json(
        { error: 'Location, distance, time, and pickup zone are required' },
        { status: 400 }
      );
    }

    const travelRate = await prisma.airportTravelRate.create({
      data: {
        location: location.trim(),
        distance: distance.trim(),
        time: time.trim(),
        price: price ? price.trim() : null,
        pickupZone: pickupZone.trim(),
        displayOrder: Number(displayOrder) || 0,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ success: true, travelRate });
  } catch (error) {
    console.error('Create travel rate error:', error);
    return NextResponse.json({ error: 'Failed to create travel rate' }, { status: 500 });
  }
}

// PUT update travel rate
export async function PUT(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, location, distance, time, price, pickupZone, displayOrder, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Travel rate ID is required' }, { status: 400 });
    }

    const travelRate = await prisma.airportTravelRate.update({
      where: { id },
      data: {
        location: location?.trim(),
        distance: distance?.trim(),
        time: time?.trim(),
        price: price !== undefined ? (price ? price.trim() : null) : undefined,
        pickupZone: pickupZone?.trim(),
        displayOrder: Number(displayOrder) || 0,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ success: true, travelRate });
  } catch (error) {
    console.error('Update travel rate error:', error);
    return NextResponse.json({ error: 'Failed to update travel rate' }, { status: 500 });
  }
}

// DELETE travel rate
export async function DELETE(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Travel rate ID is required' }, { status: 400 });
    }

    await prisma.airportTravelRate.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Travel rate deleted successfully' });
  } catch (error) {
    console.error('Delete travel rate error:', error);
    return NextResponse.json({ error: 'Failed to delete travel rate' }, { status: 500 });
  }
}
