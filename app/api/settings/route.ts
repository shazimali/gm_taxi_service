import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findUnique({
      where: { id: 'default' },
    });

    return NextResponse.json({
      phoneDisplay: settings?.phoneDisplay || '(617) 784-0264',
      phoneTel: settings?.phoneTel || '16177840264',
      dispatchEmail: settings?.dispatchEmail || 'info@gmlimoservices.com',
      serviceAddress: settings?.serviceAddress || 'Boston, Massachusetts, USA',
      heroTitleGold: settings?.heroTitleGold || 'Boston Luxury Chauffeur',
      heroTitleMain: settings?.heroTitleMain || '— Logan Airport Car Service',
      heroSubtitle: settings?.heroSubtitle || 'Elite Corporate Travel, Private Event Transportation & Logan Airport Transfers',
      heroImage: settings?.heroImage || null,
    });
  } catch (error) {
    console.error('Public settings fetch error:', error);
    return NextResponse.json({
      phoneDisplay: '(617) 784-0264',
      phoneTel: '16177840264',
      dispatchEmail: 'info@gmlimoservices.com',
      serviceAddress: 'Boston, Massachusetts, USA',
    });
  }
}
