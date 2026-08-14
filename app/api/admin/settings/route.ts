import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedAdmin } from '@/lib/auth';

// GET site settings (single record, id = "default")
export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await prisma.siteSetting.findUnique({
      where: { id: 'default' },
    });

    // Return defaults if record doesn't exist yet
    return NextResponse.json({
      settings: settings ?? {
        id: 'default',
        phoneDisplay: '(617) 784-0264',
        phoneTel: '16177840264',
        dispatchEmail: 'info@bostonluxurychauffeur.com',
        serviceAddress: 'Boston, Massachusetts, USA',
        heroTitleGold: 'Boston Luxury Chauffeur',
        heroTitleMain: '— Logan Airport Car Service',
        heroSubtitle: 'Elite Corporate Travel, Private Event Transportation & Logan Airport Transfers',
        locationsHeroTitle: 'Our Service Locations',
        locationsHeroSubtitle: 'Luxury Executive Transport Across the Greater Area',
        locationsHeroImage: null,
      },
    });
  } catch (error) {
    console.error('Fetch settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT upsert site settings
export async function PUT(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      phoneDisplay,
      phoneTel,
      dispatchEmail,
      serviceAddress,
      heroTitleGold,
      heroTitleMain,
      heroSubtitle,
      locationsHeroTitle,
      locationsHeroSubtitle,
      locationsHeroImage,
    } = body;

    const data = {
      phoneDisplay,
      phoneTel,
      dispatchEmail,
      serviceAddress,
      heroTitleGold,
      heroTitleMain,
      heroSubtitle,
      ...(locationsHeroTitle !== undefined && { locationsHeroTitle }),
      ...(locationsHeroSubtitle !== undefined && { locationsHeroSubtitle }),
      ...(locationsHeroImage !== undefined && { locationsHeroImage }),
    };

    const settings = await prisma.siteSetting.upsert({
      where: { id: 'default' },
      update: data,
      create: { id: 'default', ...data },
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
