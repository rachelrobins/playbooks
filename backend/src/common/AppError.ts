/**
 * Defines custom application errors that map common failure cases to HTTP status
 * codes and error codes for consistent API error responses.
 */

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/** Indicates that authentication is required or the provided credentials are invalid. */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED');
  }
}

/** Indicates that the requested resource does not exist or is not accessible. */
export class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(404, message, 'NOT_FOUND');
  }
}

/** Indicates that the request conflicts with the current state of a resource. */
export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(409, message, 'CONFLICT');
  }
}

/** Indicates that the request contains invalid input. */
export class ValidationError extends AppError {
  constructor(message = 'Invalid request') {
    super(400, message, 'VALIDATION_ERROR');
  }
}
