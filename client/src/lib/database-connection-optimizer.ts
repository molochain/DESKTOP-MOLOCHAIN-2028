/**
 * Client-side database connection optimizer to handle connection issues
 */

interface ConnectionConfig {
  maxRetries: number;
  retryDelay: number;
  timeout: number;
}

class DatabaseConnectionOptimizer {
  private static instance: DatabaseConnectionOptimizer;
  private config: ConnectionConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 10000
  };

  static getInstance(): DatabaseConnectionOptimizer {
    if (!DatabaseConnectionOptimizer.instance) {
      DatabaseConnectionOptimizer.instance = new DatabaseConnectionOptimizer();
    }
    return DatabaseConnectionOptimizer.instance;
  }

  async optimizedFetch(url: string, options: RequestInit = {}): Promise<Response | null> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          credentials: 'include'
        });

        clearTimeout(timeoutId);

        if (response.ok || response.status === 401) {
          return response;
        }

        // Handle server errors with exponential backoff
        if (response.status >= 500 && attempt < this.config.maxRetries - 1) {
          await this.delay(this.config.retryDelay * Math.pow(2, attempt));
          continue;
        }

        return response;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Don't retry on abort or network errors
        if (lastError.name === 'AbortError' || lastError.message.includes('NetworkError')) {
          break;
        }

        // Exponential backoff for other errors
        if (attempt < this.config.maxRetries - 1) {
          await this.delay(this.config.retryDelay * Math.pow(2, attempt));
        }
      }
    }

    // Return null instead of throwing to prevent unhandled rejections
    return null;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  updateConfig(config: Partial<ConnectionConfig>) {
    this.config = { ...this.config, ...config };
  }
}

export const dbConnectionOptimizer = DatabaseConnectionOptimizer.getInstance();

// Enhanced fetch wrapper for API calls
export async function optimizedApiCall(
  url: string, 
  options: RequestInit = {}
): Promise<any> {
  try {
    const response = await dbConnectionOptimizer.optimizedFetch(url, options);
    
    if (!response) {
      return null;
    }

    if (response.status === 401) {
      return null; // Not authenticated
    }

    if (!response.ok) {
      return null; // Failed request
    }

    return await response.json();
  } catch (error) {
    // Silent error handling to prevent console noise
    return null;
  }
}