import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedAdmin } from '@/lib/auth';

// GET all vehicles
export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    return NextResponse.json({ vehicles });
  } catch (error) {
    console.error('Error fetching fleet:', error);
    return NextResponse.json({ error: 'Failed to fetch fleet' }, { status: 500 });
  }
}

// POST create vehicle
export async function POST(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      slug,
      category,
      model,
      image,
      passengerCapacity,
      luggageCapacity,
      rateHourly,
      features,
      description,
      displayOrder,
    } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        name,
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        category: category || 'Executive',
        model: model || name,
        image: image || '/images/Businessedited-1024x526-1-e1751891182287.webp',
        passengerCapacity: Number(passengerCapacity) || 4,
        luggageCapacity: Number(luggageCapacity) || 3,
        rateHourly: rateHourly ? Number(rateHourly) : null,
        features: JSON.stringify(Array.isArray(features) ? features : []),
        description: description || '',
        displayOrder: Number(displayOrder) || 0,
      },
    });

    return NextResponse.json({ success: true, vehicle });
  } catch (error) {
    console.error('Create vehicle error:', error);
    return NextResponse.json({ error: 'Failed to create vehicle' }, { status: 500 });
  }
}

// PUT update vehicle
export async function PUT(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, tagline, amenities, ctaType, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Vehicle ID is required' }, { status: 400 });
    }

    if (data.passengerCapacity) data.passengerCapacity = Number(data.passengerCapacity);
    if (data.luggageCapacity) data.luggageCapacity = Number(data.luggageCapacity);
    if (data.rateHourly !== undefined) data.rateHourly = data.rateHourly ? Number(data.rateHourly) : null;
    if (data.features && Array.isArray(data.features)) {
      data.features = JSON.stringify(data.features);
    }

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, vehicle });
  } catch (error) {
    console.error('Update vehicle error:', error);
    return NextResponse.json({ error: 'Failed to update vehicle' }, { status: 500 });
  }
}

// DELETE vehicle
export async function DELETE(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Vehicle ID is required' }, { status: 400 });
    }

    await prisma.vehicle.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    return NextResponse.json({ error: 'Failed to delete vehicle' }, { status: 500 });
  }
}
