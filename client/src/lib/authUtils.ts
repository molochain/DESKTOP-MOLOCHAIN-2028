/**
 * Authentication utility functions
 */

/**
 * Check if an error is an unauthorized (401) error
 */
export function isUnauthorizedError(error: any): boolean {
  if (!error) return false;
  
  // Check for HTTP 401 status
  if (error.status === 401) return true;
  
  // Check for response status
  if (error.response?.status === 401) return true;
  
  // Check for error message indicating unauthorized
  if (error.message?.toLowerCase().includes('unauthorized')) return true;
  if (error.message?.toLowerCase().includes('401')) return true;
  
  // Check for specific error codes
  if (error.code === 'UNAUTHORIZED') return true;
  if (error.code === 401) return true;
  
  return false;
}

/**
 * Check if an error is a forbidden (403) error
 */
export function isForbiddenError(error: any): boolean {
  if (!error) return false;
  
  // Check for HTTP 403 status
  if (error.status === 403) return true;
  
  // Check for response status
  if (error.response?.status === 403) return true;
  
  // Check for error message indicating forbidden
  if (error.message?.toLowerCase().includes('forbidden')) return true;
  if (error.message?.toLowerCase().includes('403')) return true;
  
  // Check for specific error codes
  if (error.code === 'FORBIDDEN') return true;
  if (error.code === 403) return true;
  
  return false;
}

/**
 * Check if an error is an authentication error
 */
export function isAuthError(error: any): boolean {
  return isUnauthorizedError(error) || isForbiddenError(error);
}

/**
 * Get a user-friendly error message for auth errors
 */
export function getAuthErrorMessage(error: any): string {
  if (isUnauthorizedError(error)) {
    return 'Your session has expired. Please log in again.';
  }
  
  if (isForbiddenError(error)) {
    return 'You do not have permission to access this resource.';
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An authentication error occurred. Please try again.';
}

/**
 * Extract status code from various error formats
 */
export function getErrorStatusCode(error: any): number | null {
  if (error?.status) return error.status;
  if (error?.response?.status) return error.response.status;
  if (error?.code && typeof error.code === 'number') return error.code;
  return null;
}