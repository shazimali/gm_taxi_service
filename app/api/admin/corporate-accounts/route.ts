import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET: list all corporate accounts
export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accounts = await prisma.corporateAccount.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ accounts });
  } catch (error: any) {
    console.error('Fetch corporate accounts error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch corporate accounts' },
      { status: 500 }
    );
  }
}

// POST: create corporate account
export async function POST(req: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, accountCode, discountPct, isActive } = body;

    if (!name || !accountCode) {
      return NextResponse.json(
        { error: 'Account name and code are required' },
        { status: 400 }
      );
    }

    const trimmedCode = accountCode.trim().toUpperCase();

    // Check if code already exists
    const existing = await prisma.corporateAccount.findUnique({
      where: { accountCode: trimmedCode },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Account code "${trimmedCode}" is already in use.` },
        { status: 400 }
      );
    }

    const account = await prisma.corporateAccount.create({
      data: {
        name: name.trim(),
        accountCode: trimmedCode,
        discountPct: Math.min(Math.max(Number(discountPct) || 0, 0), 100),
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ success: true, account });
  } catch (error: any) {
    console.error('Create corporate account error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create corporate account' },
      { status: 500 }
    );
  }
}

// PUT: update corporate account
export async function PUT(req: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, accountCode, discountPct, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Corporate account ID is required' }, { status: 400 });
    }

    const trimmedCode = accountCode ? accountCode.trim().toUpperCase() : undefined;

    if (trimmedCode) {
      const conflict = await prisma.corporateAccount.findFirst({
        where: {
          accountCode: trimmedCode,
          NOT: { id },
        },
      });
      if (conflict) {
        return NextResponse.json(
          { error: `Account code "${trimmedCode}" is already used by another account.` },
          { status: 400 }
        );
      }
    }

    const account = await prisma.corporateAccount.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(trimmedCode && { accountCode: trimmedCode }),
        ...(discountPct !== undefined && {
          discountPct: Math.min(Math.max(Number(discountPct) || 0, 0), 100),
        }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    });

    return NextResponse.json({ success: true, account });
  } catch (error: any) {
    console.error('Update corporate account error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update corporate account' },
      { status: 500 }
    );
  }
}

// DELETE: delete corporate account
export async function DELETE(req: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Corporate account ID is required' }, { status: 400 });
    }

    await prisma.corporateAccount.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete corporate account error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete corporate account' },
      { status: 500 }
    );
  }
}
