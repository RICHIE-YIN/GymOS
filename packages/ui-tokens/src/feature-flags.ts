export interface FeatureFlags {
  /** AI-powered coaching chat for clients */
  aiCoachEnabled: boolean;
  /** Trainer marketplace where clients can discover and hire trainers */
  trainerMarketplaceEnabled: boolean;
  /** In-app payment processing for trainer subscriptions */
  paymentsEnabled: boolean;
  /** Client progress photo uploads and viewing */
  progressPhotosEnabled: boolean;
  /** AI-generated grocery list from meal plans */
  groceryListEnabled: boolean;
  /** Public trainer profile discovery without account */
  publicTrainerDiscovery: boolean;
  /** In-app messaging between clients and trainers */
  messagingEnabled: boolean;
}

/**
 * Default feature flags for local development.
 * Enables core features; disables payment and marketplace flows.
 */
export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  aiCoachEnabled: true,
  trainerMarketplaceEnabled: false,
  paymentsEnabled: false,
  progressPhotosEnabled: true,
  groceryListEnabled: false,
  publicTrainerDiscovery: false,
  messagingEnabled: true,
};

/**
 * Production feature flags.
 * Enables stable, launched features and payments.
 */
export const PRODUCTION_FEATURE_FLAGS: FeatureFlags = {
  aiCoachEnabled: true,
  trainerMarketplaceEnabled: false,
  paymentsEnabled: true,
  progressPhotosEnabled: true,
  groceryListEnabled: true,
  publicTrainerDiscovery: false,
  messagingEnabled: true,
};

/**
 * Returns the appropriate feature flags for the given environment.
 * Falls back to DEFAULT_FEATURE_FLAGS for unknown environments.
 */
export function getFeatureFlags(env: 'development' | 'staging' | 'production'): FeatureFlags {
  switch (env) {
    case 'production':
      return PRODUCTION_FEATURE_FLAGS;
    case 'staging':
      // Staging mirrors production but with marketplace enabled for QA
      return {
        ...PRODUCTION_FEATURE_FLAGS,
        trainerMarketplaceEnabled: true,
        publicTrainerDiscovery: true,
      };
    case 'development':
    default:
      return DEFAULT_FEATURE_FLAGS;
  }
}
