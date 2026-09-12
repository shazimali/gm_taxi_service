/**
 * lib/repositories/interfaces/IPassengerRepository.ts
 *
 * D — Dependency Inversion: all passenger-touching routes depend
 *     on this contract, not on Prisma.
 */

export interface Passenger {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  phone: string | null;
  stripeCustomerId: string | null;
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePassengerData {
  fullName: string;
  email: string;
  passwordHash: string;
  phone?: string | null;
  stripeCustomerId?: string | null;
}

export interface IPassengerRepository {
  /** Find passenger by primary key */
  findById(id: string): Promise<Passenger | null>;

  /** Find passenger by email (used during login & registration check) */
  findByEmail(email: string): Promise<Passenger | null>;

  /** Create a new passenger account */
  create(data: CreatePassengerData): Promise<Passenger>;

  /** Update passenger fields (e.g. attach Stripe Customer ID) */
  update(id: string, data: Partial<Omit<Passenger, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Passenger>;

  /** Increment tokenVersion to revoke all active sessions */
  incrementTokenVersion(id: string): Promise<void>;
}
