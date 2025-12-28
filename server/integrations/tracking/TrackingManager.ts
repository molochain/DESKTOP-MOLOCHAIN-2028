import { TrackingProvider, TrackingInfo, TrackingError } from './types';

export class TrackingManager {
  private providers: Map<string, TrackingProvider> = new Map();

  registerProvider(provider: TrackingProvider) {
    if (!provider.isEnabled) {
      // Provider disabled - not registered in tracking manager
      return;
    }
    this.providers.set(provider.name.toLowerCase(), provider);
    // Registered tracking provider - logged via Winston
  }

  async getTracking(trackingNumber: string, provider?: string): Promise<TrackingInfo> {
    if (provider) {
      const specificProvider = this.providers.get(provider.toLowerCase());
      if (!specificProvider) {
        throw new TrackingError(
          `Provider ${provider} not found`,
          "PROVIDER_NOT_FOUND",
          provider,
          trackingNumber
        );
      }
      return specificProvider.getTracking(trackingNumber);
    }

    // Try to auto-detect provider if not specified
    for (const [name, provider] of Array.from(this.providers)) {
      if (provider.validateTrackingNumber(trackingNumber)) {
        try {
          return await provider.getTracking(trackingNumber);
        } catch (error) {
          if (error instanceof TrackingError) {
            throw error;
          }
          throw new TrackingError(
            "Failed to get tracking info",
            "TRACKING_FAILED",
            name,
            trackingNumber,
            error
          );
        }
      }
    }

    throw new TrackingError(
      "No compatible provider found for tracking number",
      "NO_PROVIDER_FOUND",
      "unknown",
      trackingNumber
    );
  }

  getProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  hasProvider(name: string): boolean {
    return this.providers.has(name.toLowerCase());
  }
}

// Create singleton instance
export const trackingManager = new TrackingManager();
