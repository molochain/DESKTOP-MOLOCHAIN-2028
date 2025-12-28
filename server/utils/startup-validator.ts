// Simplified StartupValidator - no schema dependencies to avoid bundling issues
export class StartupValidator {
  static async validateEnvironment(): Promise<{ success: boolean; errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    console.log('[StartupValidator] Starting environment validation...');

    // Check environment variables
    if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
      errors.push('Database URL not configured (DATABASE_URL or POSTGRES_URL required)');
    } else {
      console.log('[StartupValidator] Database URL: configured');
    }

    // Check port configuration
    const port = parseInt(process.env.PORT || '5000');
    if (isNaN(port) || port < 1 || port > 65535) {
      errors.push(`Invalid port configuration: ${process.env.PORT}`);
    } else {
      console.log(`[StartupValidator] Port: ${port}`);
    }

    // Check NODE_ENV
    if (!process.env.NODE_ENV) {
      warnings.push('NODE_ENV not set, defaulting to development');
    } else {
      console.log(`[StartupValidator] NODE_ENV: ${process.env.NODE_ENV}`);
    }

    // Schema validation is done implicitly when the server starts
    // No need to validate it here - it will fail at runtime if there are issues
    console.log('[StartupValidator] Environment checks complete');

    return {
      success: errors.length === 0,
      errors,
      warnings
    };
  }

  static async performQuickHealthCheck(): Promise<boolean> {
    try {
      console.log('[StartupValidator] Performing startup health check...');
      const validation = await this.validateEnvironment();
      
      if (validation.warnings.length > 0) {
        console.warn('[StartupValidator] Warnings:', validation.warnings.join(', '));
      }
      
      if (!validation.success) {
        console.error('[StartupValidator] FAILED:', validation.errors.join('; '));
        console.error('[StartupValidator] Check environment configuration and file paths');
        return false;
      }
      
      console.log('[StartupValidator] Validation passed');
      return true;
    } catch (error: any) {
      console.error('[StartupValidator] Unexpected error:', error?.message || error);
      console.error('[StartupValidator] Stack:', error?.stack || 'no stack');
      return false;
    }
  }
}
