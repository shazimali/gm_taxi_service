import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma as globalPrisma } from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';

function getJwtSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined.');
  }
  return new TextEncoder().encode(secret);
}

export interface PassengerPayload {
  passengerId: string;
  email: string;
  fullName: string;
  tokenVersion?: number;
}

export async function signPassengerToken(payload: PassengerPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecretKey());
}

export async function verifyPassengerToken(token: string): Promise<PassengerPayload | null> {
  try {
    const verified = await jwtVerify(token, getJwtSecretKey());
    return verified.payload as unknown as PassengerPayload;
  } catch {
    return null;
  }
}

export async function getCurrentPassenger() {
  const cookieStore = await cookies();
  const token = cookieStore.get('passenger_token')?.value;

  if (!token) return null;

  const payload = await verifyPassengerToken(token);
  if (!payload?.passengerId) return null;

  try {
    const prisma = (globalPrisma as any)?.passenger ? globalPrisma : new PrismaClient();
    const passenger = await prisma.passenger.findUnique({
      where: { id: payload.passengerId },
    });

    if (!passenger) return null;

    if (payload.tokenVersion !== undefined && passenger.tokenVersion !== payload.tokenVersion) {
      return null;
    }

    return passenger;
  } catch {
    return null;
  }
}

export async function revokePassengerSessions(passengerId: string): Promise<boolean> {
  try {
    const prisma = (globalPrisma as any)?.passenger ? globalPrisma : new PrismaClient();
    await prisma.passenger.update({
      where: { id: passengerId },
      data: { tokenVersion: { increment: 1 } },
    });
    return true;
  } catch {
    return false;
  }
}


