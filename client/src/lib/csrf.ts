/**
 * CSRF Protection Utilities
 * 
 * This module provides functions for handling CSRF tokens in fetch requests.
 */

// Enhanced fetch that includes CSRF token in headers for POST/PUT/DELETE requests
export async function fetchWithCsrf(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Default to GET if method is not specified
  const method = options.method || 'GET';
  
  // Only add CSRF token for state-changing methods
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase())) {
    try {
      // Get CSRF token from cookie
      const csrfToken = getCsrfTokenFromCookie();
      
      // Create headers object if it doesn't exist
      const headers = options.headers || {};
      
      // Add CSRF token to headers
      const newHeaders = {
        ...headers,
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken || '',
      };
      
      // Return the fetch with updated headers
      return fetch(url, {
        ...options,
        headers: newHeaders,
      });
    } catch (error) {
      // Error adding CSRF token
      // Fall back to regular fetch without CSRF token
      return fetch(url, options);
    }
  }
  
  // For GET requests, just use standard fetch
  return fetch(url, options);
}

// Get CSRF token from cookie
function getCsrfTokenFromCookie(): string | undefined {
  const cookies = document.cookie.split(';');
  
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrf_token') {
      return value;
    }
  }
  
  return undefined;
}