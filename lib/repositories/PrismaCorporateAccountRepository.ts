/**
 * lib/repositories/PrismaCorporateAccountRepository.ts
 *
 * S — Single Responsibility: Corporate account DB operations.
 * D — Dependency Inversion: implements ICorporateAccountRepository.
 */

import { prisma } from '@/lib/prisma';
import type {
  ICorporateAccountRepository,
  CorporateAccount,
  CreateCorporateAccountData,
} from './interfaces/ICorporateAccountRepository';

export class PrismaCorporateAccountRepository implements ICorporateAccountRepository {
  async findAll(): Promise<CorporateAccount[]> {
    const accounts = await prisma.corporateAccount.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return accounts as unknown as CorporateAccount[];
  }

  async findById(id: string): Promise<CorporateAccount | null> {
    const account = await prisma.corporateAccount.findUnique({
      where: { id },
    });
    return (account as unknown as CorporateAccount) ?? null;
  }

  async findByCode(accountCode: string): Promise<CorporateAccount | null> {
    const trimmed = accountCode.trim();
    if (!trimmed) return null;

    const account = await prisma.corporateAccount.findUnique({
      where: { accountCode: trimmed },
    });
    if (!account || !account.isActive) return null;
    return account as unknown as CorporateAccount;
  }

  async create(data: CreateCorporateAccountData): Promise<CorporateAccount> {
    const account = await prisma.corporateAccount.create({
      data: {
        name: data.name,
        accountCode: data.accountCode.trim().toUpperCase(),
        discountPct: data.discountPct ?? 0,
        isActive: data.isActive ?? true,
      },
    });
    return account as unknown as CorporateAccount;
  }

  async update(id: string, data: Partial<CreateCorporateAccountData>): Promise<CorporateAccount> {
    const account = await prisma.corporateAccount.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.accountCode !== undefined && { accountCode: data.accountCode.trim().toUpperCase() }),
        ...(data.discountPct !== undefined && { discountPct: data.discountPct }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
    return account as unknown as CorporateAccount;
  }

  async delete(id: string): Promise<void> {
    await prisma.corporateAccount.delete({
      where: { id },
    });
  }
}

/** Singleton instance */
export const corporateAccountRepository = new PrismaCorporateAccountRepository();
