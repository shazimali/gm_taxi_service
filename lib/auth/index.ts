/**
 * lib/auth/index.ts
 *
 * Barrel file — re-exports everything from the auth module.
 * Consumers can import from '@/lib/auth' (single path) instead of
 * knowing which sub-file owns each export.
 *
 * @example
 * import { getAuthenticatedAdmin, UserSession, createAdminToken } from '@/lib/auth';
 */

export * from './types';
export * from './jwt';
export * from './session';
export * from './guards';
