import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedAdmin } from '@/lib/auth';

// GET all services
export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const services = await prisma.service.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    return NextResponse.json({ services });
  } catch (error) {
    console.error('Fetch services error:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

// POST create service
export async function POST(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, tagline, image, description, fullDetails, benefits, features } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const service = await prisma.service.create({
      data: {
        name,
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        tagline: tagline || '',
        image: image || '/images/Limousine-Service-e1763051925488.webp',
        description: description || '',
        fullDetails: fullDetails || description || '',
        benefits: JSON.stringify(Array.isArray(benefits) ? benefits : []),
        features: JSON.stringify(Array.isArray(features) ? features : []),
        iconName: 'Car',
      },
    });

    return NextResponse.json({ success: true, service });
  } catch (error) {
    console.error('Create service error:', error);
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}

// PUT update service
export async function PUT(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, badge, icon, shortDesc, keyFeatures, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    if (data.features && Array.isArray(data.features)) {
      data.features = JSON.stringify(data.features);
    }
    if (data.benefits && Array.isArray(data.benefits)) {
      data.benefits = JSON.stringify(data.benefits);
    }

    const service = await prisma.service.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, service });
  } catch (error) {
    console.error('Update service error:', error);
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}

// DELETE service
export async function DELETE(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Delete service error:', error);
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
  }
}
