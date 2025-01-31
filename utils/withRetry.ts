const MAX_TOKEN_FETCH_RETRIES = 3;
const TOKEN_FETCH_RETRY_DELAY = 1000;

// Add a retry wrapper function
export const withTokenRetry = async <T>(
    operation: () => Promise<T>,
    tokenIdentifier: string
  ): Promise<T | null> => {
    let attempts = 0;
    while (attempts < MAX_TOKEN_FETCH_RETRIES) {
      try {
        return await operation();
      } catch (error) {
        attempts++;
        console.error(`Attempt ${attempts} failed for token ${tokenIdentifier}:`, error);
        if (attempts < MAX_TOKEN_FETCH_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, TOKEN_FETCH_RETRY_DELAY));
          continue;
        }
        // console.log(`Skipping token ${tokenIdentifier} after ${attempts} failed attempts`);
        return null;
      }
    }
    return null;
  };


// Add retry wrapper function
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delay = 1000
): Promise<T> {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  throw lastError;
}