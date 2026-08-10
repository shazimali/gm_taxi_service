import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

function getJwtSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined.');
  }
  return new TextEncoder().encode(secret);
}

export interface AdminJwtPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  tokenVersion?: number;
}

export async function createAdminToken(payload: AdminJwtPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getJwtSecretKey());
}

export async function verifyAdminToken(token: string): Promise<AdminJwtPayload | null> {
  try {
    const verified = await jwtVerify(token, getJwtSecretKey());
    return verified.payload as unknown as AdminJwtPayload;
  } catch (err) {
    return null;
  }
}

export async function getAuthenticatedAdmin(): Promise<AdminJwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return null;

  const payload = await verifyAdminToken(token);
  if (!payload?.userId) return null;

  try {
    const admin = await prisma.admin.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, tokenVersion: true },
    });

    if (!admin) return null;

    if (payload.tokenVersion !== undefined && admin.tokenVersion !== payload.tokenVersion) {
      return null;
    }

    return {
      userId: admin.id,
      email: admin.email,
      name: admin.name || 'System Admin',
      role: payload.role || 'ADMIN',
      tokenVersion: admin.tokenVersion,
    };
  } catch {
    return null;
  }
}

export async function revokeAdminSessions(userId: string): Promise<boolean> {
  try {
    await prisma.admin.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
    });
    return true;
  } catch {
    return false;
  }
}


