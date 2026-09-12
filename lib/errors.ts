/**
 * lib/errors.ts
 *
 * O — Open/Closed: new failure cases become new subclasses here; route
 *     handlers never need their catch blocks edited to recognize them —
 *     see lib/api/errorResponse.ts for the single mapping point.
 */

export abstract class AppError extends Error {
  abstract readonly status: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends AppError {
  readonly status = 404;
}

export class ForbiddenError extends AppError {
  readonly status = 403;
}

export class InvalidStateError extends AppError {
  readonly status = 400;
}

export class ValidationError extends AppError {
  readonly status = 400;
}

export class PaymentProviderError extends AppError {
  readonly status = 502;

  constructor(message: string, readonly cause?: unknown) {
    super(message);
  }
}
