import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { DEFAULT_ABOUT_CONTENT } from '@/lib/aboutDefaults';

export const dynamic = 'force-dynamic';

// GET about page content (single record, id = "default")
export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const content = await prisma.aboutContent.findUnique({
      where: { id: 'default' },
    });

    return NextResponse.json({
      content: content ?? { id: 'default', ...DEFAULT_ABOUT_CONTENT },
    });
  } catch (error) {
    console.error('Fetch about content error:', error);
    return NextResponse.json({ error: 'Failed to fetch about content' }, { status: 500 });
  }
}

// PUT upsert about page content
export async function PUT(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      heroTag,
      heroTitle,
      heroDesc,
      heroImage,
      whoTag,
      whoTitlePrefix,
      whoTitleHighlight,
      whoDesc,
      whoText1,
      whoText2,
      whoImage,
      featureBoxes,
      pillarsTag,
      pillarsTitle,
      pillarsDesc,
      pillars,
      statsTag,
      statsHeader,
      statsImage,
      stats,
      cta1Tag,
      cta1Title,
      cta1BtnText,
      cta1BtnLink,
      cta1Image,
      cta2Tag,
      cta2Title,
      cta2BtnText,
      cta2BtnLink,
      cta2Image,
    } = body;

    const data = {
      heroTag,
      heroTitle,
      heroDesc,
      ...(heroImage !== undefined && { heroImage }),
      whoTag,
      whoTitlePrefix,
      whoTitleHighlight,
      whoDesc,
      whoText1,
      whoText2,
      ...(whoImage !== undefined && { whoImage }),
      ...(featureBoxes !== undefined && { featureBoxes: JSON.stringify(featureBoxes) }),
      pillarsTag,
      pillarsTitle,
      pillarsDesc,
      ...(pillars !== undefined && { pillars: JSON.stringify(pillars) }),
      statsTag,
      statsHeader,
      ...(statsImage !== undefined && { statsImage }),
      ...(stats !== undefined && { stats: JSON.stringify(stats) }),
      cta1Tag,
      cta1Title,
      cta1BtnText,
      cta1BtnLink,
      ...(cta1Image !== undefined && { cta1Image }),
      cta2Tag,
      cta2Title,
      cta2BtnText,
      cta2BtnLink,
      ...(cta2Image !== undefined && { cta2Image }),
    };

    const content = await prisma.aboutContent.upsert({
      where: { id: 'default' },
      update: data,
      create: { id: 'default', ...data },
    });

    try {
      revalidatePath('/about-us');
    } catch (e) {
      console.warn('Revalidate about-us warning:', e);
    }

    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error('Update about content error:', error);
    return NextResponse.json({ error: 'Failed to update about content' }, { status: 500 });
  }
}
