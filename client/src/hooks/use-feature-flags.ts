export interface FeatureFlags {}

export const featureFlags: FeatureFlags = {};

export function useFeatureFlags(): FeatureFlags {
  return featureFlags;
}
