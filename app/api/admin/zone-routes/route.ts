import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET: list all zone routes and available vehicles
export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [zoneRoutes, vehicles] = await Promise.all([
      prisma.zoneRoute.findMany({
        include: {
          vehicle: {
            select: { id: true, name: true, slug: true, category: true, model: true, rateHourly: true },
          },
        },
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      prisma.vehicle.findMany({
        select: { id: true, name: true, slug: true, category: true, model: true, rateHourly: true },
        orderBy: { displayOrder: 'asc' },
      }),
    ]);

    return NextResponse.json({ zoneRoutes, vehicles });
  } catch (error: any) {
    console.error('Fetch zone routes error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch zone routes' },
      { status: 500 }
    );
  }
}

// POST: create a new zone route
export async function POST(req: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { vehicleId, name, pickupKeywords, dropoffKeywords, flatRate, isActive, displayOrder } = body;

    if (!vehicleId || !name || !pickupKeywords || !dropoffKeywords || flatRate === undefined) {
      return NextResponse.json(
        { error: 'Vehicle, route name, pickup keywords, dropoff keywords, and flat rate are required' },
        { status: 400 }
      );
    }

    const zoneRoute = await prisma.zoneRoute.create({
      data: {
        vehicleId,
        name: name.trim(),
        pickupKeywords: pickupKeywords.toLowerCase().trim(),
        dropoffKeywords: dropoffKeywords.toLowerCase().trim(),
        flatRate: Number(flatRate) || 0,
        isActive: isActive !== false,
        displayOrder: Number(displayOrder) || 0,
      },
      include: {
        vehicle: {
          select: { id: true, name: true, slug: true, category: true, model: true, rateHourly: true },
        },
      },
    });

    return NextResponse.json({ success: true, zoneRoute });
  } catch (error: any) {
    console.error('Create zone route error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create zone route' },
      { status: 500 }
    );
  }
}

// PUT: update an existing zone route
export async function PUT(req: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, vehicleId, name, pickupKeywords, dropoffKeywords, flatRate, isActive, displayOrder } = body;

    if (!id) {
      return NextResponse.json({ error: 'Zone route ID is required' }, { status: 400 });
    }

    const zoneRoute = await prisma.zoneRoute.update({
      where: { id },
      data: {
        ...(vehicleId && { vehicleId }),
        ...(name && { name: name.trim() }),
        ...(pickupKeywords !== undefined && {
          pickupKeywords: pickupKeywords.toLowerCase().trim(),
        }),
        ...(dropoffKeywords !== undefined && {
          dropoffKeywords: dropoffKeywords.toLowerCase().trim(),
        }),
        ...(flatRate !== undefined && { flatRate: Number(flatRate) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(displayOrder !== undefined && { displayOrder: Number(displayOrder) }),
      },
      include: {
        vehicle: {
          select: { id: true, name: true, slug: true, category: true, model: true, rateHourly: true },
        },
      },
    });

    return NextResponse.json({ success: true, zoneRoute });
  } catch (error: any) {
    console.error('Update zone route error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update zone route' },
      { status: 500 }
    );
  }
}

// DELETE: delete a zone route
export async function DELETE(req: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Zone route ID is required' }, { status: 400 });
    }

    await prisma.zoneRoute.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete zone route error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete zone route' },
      { status: 500 }
    );
  }
}
