/**
 * lib/repositories/interfaces/ICorporateAccountRepository.ts
 *
 * S — Single Responsibility: corporate account DB operations.
 */

export interface CorporateAccount {
  id: string;
  name: string;
  accountCode: string;
  discountPct: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCorporateAccountData {
  name: string;
  accountCode: string;
  discountPct?: number;
  isActive?: boolean;
}

export interface ICorporateAccountRepository {
  findAll(): Promise<CorporateAccount[]>;
  findById(id: string): Promise<CorporateAccount | null>;
  findByCode(accountCode: string): Promise<CorporateAccount | null>;
  create(data: CreateCorporateAccountData): Promise<CorporateAccount>;
  update(id: string, data: Partial<CreateCorporateAccountData>): Promise<CorporateAccount>;
  delete(id: string): Promise<void>;
}
