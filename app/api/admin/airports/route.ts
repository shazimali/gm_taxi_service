import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedAdmin } from '@/lib/auth';

// GET all airports
export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const airports = await prisma.airport.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    return NextResponse.json({ airports });
  } catch (error) {
    console.error('Fetch airports error:', error);
    return NextResponse.json({ error: 'Failed to fetch airports' }, { status: 500 });
  }
}

// POST create airport
export async function POST(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { code, name, description, sedanEstimate, suvEstimate, displayOrder } = body;

    if (!code || !name) {
      return NextResponse.json({ error: 'Code and name are required' }, { status: 400 });
    }

    const airport = await prisma.airport.create({
      data: {
        code: code.toUpperCase().trim(),
        name,
        description: description || '',
        sedanEstimate: sedanEstimate || null,
        suvEstimate: suvEstimate || null,
        displayOrder: Number(displayOrder) || 0,
      },
    });

    return NextResponse.json({ success: true, airport });
  } catch (error) {
    console.error('Create airport error:', error);
    return NextResponse.json({ error: 'Failed to create airport' }, { status: 500 });
  }
}

// PUT update airport
export async function PUT(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, code, name, description, sedanEstimate, suvEstimate, displayOrder } = body;

    if (!id) {
      return NextResponse.json({ error: 'Airport ID is required' }, { status: 400 });
    }

    const airport = await prisma.airport.update({
      where: { id },
      data: {
        code: code?.toUpperCase().trim(),
        name,
        description,
        sedanEstimate: sedanEstimate || null,
        suvEstimate: suvEstimate || null,
        displayOrder: Number(displayOrder) || 0,
      },
    });

    return NextResponse.json({ success: true, airport });
  } catch (error) {
    console.error('Update airport error:', error);
    return NextResponse.json({ error: 'Failed to update airport' }, { status: 500 });
  }
}

// DELETE airport
export async function DELETE(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Airport ID is required' }, { status: 400 });
    }

    await prisma.airport.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Airport deleted successfully' });
  } catch (error) {
    console.error('Delete airport error:', error);
    return NextResponse.json({ error: 'Failed to delete airport' }, { status: 500 });
  }
}
