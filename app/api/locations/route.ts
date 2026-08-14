import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Public GET — returns active locations for the public /locations page
export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      select: { id: true, name: true, slug: true, description: true, displayOrder: true },
    });
    return NextResponse.json({ locations });
  } catch (error) {
    console.error('Fetch public locations error:', error);
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
}
