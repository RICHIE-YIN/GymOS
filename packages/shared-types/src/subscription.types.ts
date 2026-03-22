export enum PlanType {
  FREE_TRIAL = 'FREE_TRIAL',
  BASIC = 'BASIC',
  PLUS = 'PLUS',
  PREMIUM = 'PREMIUM',
  TRAINER_PRO = 'TRAINER_PRO',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  PAST_DUE = 'PAST_DUE',
  TRIALING = 'TRIALING',
  PAUSED = 'PAUSED',
  INCOMPLETE = 'INCOMPLETE',
  EXPIRED = 'EXPIRED',
}

export enum BillingInterval {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUALLY = 'ANNUALLY',
}

export interface PlanFeatures {
  maxWorkoutPrograms: number | null;
  maxMealPlans: number | null;
  maxClients: number | null;
  aiProgramGeneration: boolean;
  aiNutritionCalculation: boolean;
  trainerMessaging: boolean;
  progressPhotos: boolean;
  advancedAnalytics: boolean;
  customBranding: boolean;
  prioritySupport: boolean;
  exportData: boolean;
}

export interface SubscriptionPlan {
  id: string;
  planType: PlanType;
  name: string;
  description: string;
  priceMonthly: number;
  priceAnnually: number;
  currency: string;
  features: PlanFeatures;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planType: PlanType;
  status: SubscriptionStatus;
  billingInterval: BillingInterval;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialStart?: string | null;
  trialEnd?: string | null;
  cancelledAt?: string | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  priceAmount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}
