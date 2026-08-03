import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import { prisma as globalPrisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-gm-limo-2026';

export interface PassengerPayload {
  passengerId: string;
  email: string;
  fullName: string;
}

export function signPassengerToken(payload: PassengerPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyPassengerToken(token: string): PassengerPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as PassengerPayload;
  } catch {
    return null;
  }
}

export async function getCurrentPassenger() {
  const cookieStore = await cookies();
  const token = cookieStore.get('passenger_token')?.value;

  if (!token) return null;

  const payload = verifyPassengerToken(token);
  if (!payload?.passengerId) return null;

  try {
    const prisma = (globalPrisma as any)?.passenger ? globalPrisma : new PrismaClient();
    const passenger = await prisma.passenger.findUnique({
      where: { id: payload.passengerId },
    });
    return passenger;
  } catch {
    return null;
  }
}
