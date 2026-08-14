import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedAdmin } from '@/lib/auth';

// GET all locations
export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const locations = await prisma.location.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    return NextResponse.json({ locations });
  } catch (error) {
    console.error('Fetch locations error:', error);
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
}

// POST create location
export async function POST(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, description, displayOrder, isActive } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const location = await prisma.location.create({
      data: {
        name: name.trim(),
        slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
        description: description || null,
        displayOrder: Number(displayOrder) || 0,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ success: true, location });
  } catch (error: unknown) {
    console.error('Create location error:', error);
    const msg = error instanceof Error && error.message.includes('Unique constraint')
      ? 'A location with this slug already exists'
      : 'Failed to create location';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PUT update location
export async function PUT(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, slug, description, displayOrder, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Location ID is required' }, { status: 400 });
    }

    const location = await prisma.location.update({
      where: { id },
      data: {
        name: name?.trim(),
        slug: slug?.trim().toLowerCase().replace(/\s+/g, '-'),
        description: description ?? null,
        displayOrder: Number(displayOrder) || 0,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ success: true, location });
  } catch (error) {
    console.error('Update location error:', error);
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
  }
}

// DELETE location
export async function DELETE(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Location ID is required' }, { status: 400 });
    }

    await prisma.location.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Delete location error:', error);
    return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 });
  }
}
