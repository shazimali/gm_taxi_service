/**
 * lib/repositories/interfaces/IAdminRepository.ts
 *
 * I — Interface Segregation: only the operations admins actually need.
 * D — Dependency Inversion: API routes & guards depend on this interface,
 *     not on Prisma directly. Swap Prisma → Drizzle → raw SQL without
 *     touching a single route file.
 */

export interface Admin {
  id: string;
  email: string;
  name: string | null;
  tokenVersion: number;
  createdAt: Date;
}

export interface IAdminRepository {
  /** Find admin by primary key */
  findById(id: string): Promise<Admin | null>;

  /** Find admin by email (used during login) */
  findByEmail(email: string): Promise<(Admin & { password: string }) | null>;

  /** Increment tokenVersion to invalidate all current sessions */
  incrementTokenVersion(id: string): Promise<void>;
}
