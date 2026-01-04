/**
 * Custom error types for better error handling throughout the application
 */

export class AppError extends Error {
    public readonly code: string;
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(
        message: string,
        code: string = 'UNKNOWN_ERROR',
        statusCode: number = 500,
        isOperational: boolean = true
    ) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        // Maintains proper stack trace
        Error.captureStackTrace(this, this.constructor);
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export class DatabaseError extends AppError {
    constructor(message: string, originalError?: Error) {
        super(
            `Database operation failed: ${message}`,
            'DATABASE_ERROR',
            500
        );
        if (originalError) {
            this.stack = `${this.stack}\nCaused by: ${originalError.stack}`;
        }
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication required') {
        super(message, 'AUTH_ERROR', 401);
    }
}

export class ValidationError extends AppError {
    public readonly fields: Record<string, string>;

    constructor(message: string, fields: Record<string, string> = {}) {
        super(message, 'VALIDATION_ERROR', 400);
        this.fields = fields;
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string, id?: string) {
        super(
            id ? `${resource} with ID ${id} not found` : `${resource} not found`,
            'NOT_FOUND',
            404
        );
    }
}

export class NetworkError extends AppError {
    constructor(message: string = 'Network request failed') {
        super(message, 'NETWORK_ERROR', 503);
    }
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
}

/**
 * Safely extracts error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return 'An unexpected error occurred';
}

/**
 * Formats error for display to users
 */
export function formatErrorForUser(error: unknown): string {
    if (isAppError(error)) {
        return error.message;
    }
    if (error instanceof Error) {
        // Don't expose technical details to users
        if (error.message.includes('fetch')) {
            return 'Network connection failed. Please check your internet connection.';
        }
        if (error.message.includes('timeout')) {
            return 'The request timed out. Please try again.';
        }
    }
    return 'Something went wrong. Please try again later.';
}
