import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET all services
export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawServices = await prisma.service.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    const services = rawServices.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      tagline: s.tagline || '',
      badge: s.tagline || 'Service',
      icon: s.iconName || '🚘',
      image: s.image || '',
      shortDesc: s.description || '',
      fullDesc: s.fullDetails || '',
      description: s.description || '',
      fullDetails: s.fullDetails || '',
      benefits: typeof s.benefits === 'string' ? (s.benefits.startsWith('[') ? JSON.parse(s.benefits) : [s.benefits]) : [],
      keyFeatures: typeof s.features === 'string' ? (s.features.startsWith('[') ? JSON.parse(s.features) : [s.features]) : [],
      features: typeof s.features === 'string' ? (s.features.startsWith('[') ? JSON.parse(s.features) : [s.features]) : [],
    }));

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
    const { name, slug, tagline, badge, image, description, shortDesc, fullDetails, fullDesc, benefits, keyFeatures, features } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const bList = Array.isArray(benefits) ? benefits : typeof benefits === 'string' ? benefits.split(',').map((b) => b.trim()).filter(Boolean) : [];
    const fList = Array.isArray(keyFeatures) ? keyFeatures : Array.isArray(features) ? features : typeof keyFeatures === 'string' ? keyFeatures.split(',').map((f) => f.trim()).filter(Boolean) : [];

    const service = await prisma.service.create({
      data: {
        name,
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        tagline: tagline || badge || '',
        image: image || '/images/Limousine-Service-e1763051925488.webp',
        description: description || shortDesc || '',
        fullDetails: fullDetails || fullDesc || description || shortDesc || '',
        benefits: JSON.stringify(bList),
        features: JSON.stringify(fList),
        iconName: 'Car',
      },
    });

    return NextResponse.json({ success: true, service });
  } catch (error: any) {
    console.error('Create service error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create service' }, { status: 500 });
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
    const { id, name, slug, tagline, badge, image, description, shortDesc, fullDetails, fullDesc, benefits, keyFeatures, features } = body;

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    const bList = Array.isArray(benefits) ? benefits : typeof benefits === 'string' ? benefits.split(',').map((b) => b.trim()).filter(Boolean) : [];
    const fList = Array.isArray(keyFeatures) ? keyFeatures : Array.isArray(features) ? features : typeof keyFeatures === 'string' ? keyFeatures.split(',').map((f) => f.trim()).filter(Boolean) : [];

    const updateData: any = {};
    if (name) updateData.name = name;
    if (slug) updateData.slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (tagline !== undefined || badge !== undefined) updateData.tagline = tagline || badge || '';
    if (image !== undefined) updateData.image = image;
    if (description !== undefined || shortDesc !== undefined) updateData.description = description || shortDesc || '';
    if (fullDetails !== undefined || fullDesc !== undefined) updateData.fullDetails = fullDetails || fullDesc || '';
    updateData.benefits = JSON.stringify(bList);
    updateData.features = JSON.stringify(fList);

    const service = await prisma.service.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, service });
  } catch (error: any) {
    console.error('Update service error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update service' }, { status: 500 });
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
  } catch (error: any) {
    console.error('Delete service error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to delete service' }, { status: 500 });
  }
}
