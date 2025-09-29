/**
 * Retry helper function for database operations
 * Uses exponential backoff for retries
 * 
 * @param operation The operation to retry
 * @param maxRetries Maximum number of retry attempts
 * @returns Result of the operation
 */
export async function retryOperation<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            if (attempt === maxRetries) {
                throw error;
            }
            // Wait before retrying (exponential backoff)
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
            await new Promise(resolve => setTimeout(resolve, delay));
            console.log(`Retrying operation, attempt ${attempt + 1}/${maxRetries}`);
        }
    }
    throw new Error('Max retries exceeded');
}