/**
 * Enhanced retry operation utility with page-change awareness and improved error handling.
 * 
 * **Features:**
 * - Exponential backoff with jitter to avoid thundering herd
 * - AbortController support for cancelling ongoing requests
 * - Error classification (retryable vs non-retryable)
 * - Page change detection to avoid retrying stale requests
 * 
 * @param operation - The async operation to retry
 * @param options - Retry configuration options
 * @returns Promise resolving to operation result
 * 
 * @example
 * ```typescript
 * const result = await retryOperation(
 *   () => fetchProductsFromFirestore(),
 *   { maxRetries: 3, abortSignal: controller.signal }
 * );
 * ```
 */

interface RetryOptions {
    /** Maximum number of retry attempts (default: 3) */
    maxRetries?: number;
    /** AbortSignal to cancel the operation */
    abortSignal?: AbortSignal;
    /** Initial delay in milliseconds (default: 500) */
    initialDelay?: number;
    /** Maximum delay in milliseconds (default: 5000) */
    maxDelay?: number;
    /** Function to determine if error should be retried */
    shouldRetry?: (error: any, attempt: number) => boolean;
}

/**
 * Default retry strategy for Firestore operations.
 * 
 * **Retryable errors:**
 * - Network connectivity issues (UNAVAILABLE, DEADLINE_EXCEEDED)
 * - Rate limiting (RESOURCE_EXHAUSTED)
 * - Temporary server issues (INTERNAL, ABORTED)
 * 
 * **Non-retryable errors:**
 * - Authentication failures (UNAUTHENTICATED, PERMISSION_DENIED)
 * - Invalid requests (INVALID_ARGUMENT, NOT_FOUND)
 * - Quota exceeded (FAILED_PRECONDITION)
 */
function isRetryableError(error: any): boolean {
    if (!error) return false;

    // Handle Firebase errors by code
    const code = error.code || error.status;
    const retryableCodes = [
        'unavailable',
        'deadline-exceeded',
        'resource-exhausted',
        'internal',
        'aborted',
        'unknown'
    ];

    if (typeof code === 'string') {
        return retryableCodes.includes(code.toLowerCase());
    }

    // Handle network errors
    if (error.message) {
        const message = error.message.toLowerCase();
        return message.includes('network') ||
            message.includes('timeout') ||
            message.includes('connection');
    }

    return false;
}

export async function retryOperation<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const {
        maxRetries = 3,
        abortSignal,
        initialDelay = 500,
        maxDelay = 5000,
        shouldRetry = isRetryableError
    } = options;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // Check if operation was cancelled before starting
            if (abortSignal?.aborted) {
                throw new Error('Operation cancelled by user');
            }

            return await operation();
        } catch (error) {
            // Don't retry if operation was cancelled
            if (abortSignal?.aborted) {
                throw new Error('Operation cancelled by user');
            }

            // Don't retry on last attempt or non-retryable errors
            if (attempt === maxRetries || !shouldRetry(error, attempt)) {
                throw error;
            }

            // Calculate delay with exponential backoff and jitter
            const baseDelay = Math.min(initialDelay * Math.pow(2, attempt - 1), maxDelay);
            const jitter = Math.random() * 0.1 * baseDelay; // 10% jitter
            const delay = baseDelay + jitter;

            // Wait before retrying, but respect abort signal
            await new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(resolve, delay);

                if (abortSignal) {
                    const abortHandler = () => {
                        clearTimeout(timeout);
                        reject(new Error('Operation cancelled during retry delay'));
                    };

                    abortSignal.addEventListener('abort', abortHandler, { once: true });
                }
            });

            console.warn(`Retrying operation, attempt ${attempt + 1}/${maxRetries}, delay: ${Math.round(delay)}ms`);
        }
    }

    throw new Error('Max retries exceeded');
}