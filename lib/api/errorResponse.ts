/**
 * lib/api/errorResponse.ts
 *
 * S — Single Responsibility: the only place that turns a thrown error
 *     into an HTTP response shape for route handlers.
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from '@/lib/errors';

export function toErrorResponse(error: unknown, fallbackMessage: string): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: 'Invalid request.', details: error.flatten() },
      { status: 400 }
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error(fallbackMessage, error);
  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}

/**
 * 400 response carrying the first validation message, for routes whose
 * forms display `error` directly to the user.
 */
export function validationErrorResponse(error: ZodError): NextResponse {
  return NextResponse.json(
    { error: error.issues[0]?.message ?? 'Invalid request.' },
    { status: 400 }
  );
}

/** Parse a JSON body, returning null (instead of throwing) when it is malformed. */
export async function readJsonBody(req: Request): Promise<unknown> {
  return req.json().catch(() => null);
}
