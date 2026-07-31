import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedAdmin } from '@/lib/auth';

// GET all vehicles
export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vehicles = await prisma.vehicle.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    return NextResponse.json({ vehicles });
  } catch (error) {
    console.error('Fetch vehicles error:', error);
    return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 });
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
      tagline,
      image,
      passengerCapacity,
      luggageCapacity,
      rateHourly,
      features,
      amenities,
      description,
      ctaType,
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
        tagline: tagline || '',
        image: image || '/images/blc89.webp',
        passengerCapacity: Number(passengerCapacity) || 4,
        luggageCapacity: Number(luggageCapacity) || 3,
        rateHourly: rateHourly ? Number(rateHourly) : null,
        features: Array.isArray(features) ? features : [],
        amenities: Array.isArray(amenities) ? amenities : [],
        description: description || '',
        ctaType: ctaType || 'both',
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
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Vehicle ID is required' }, { status: 400 });
    }

    if (data.passengerCapacity) data.passengerCapacity = Number(data.passengerCapacity);
    if (data.luggageCapacity) data.luggageCapacity = Number(data.luggageCapacity);
    if (data.rateHourly !== undefined) data.rateHourly = data.rateHourly ? Number(data.rateHourly) : null;

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

    return NextResponse.json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    return NextResponse.json({ error: 'Failed to delete vehicle' }, { status: 500 });
  }
}
