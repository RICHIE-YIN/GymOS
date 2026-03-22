import prisma from '../../lib/prisma';
import { NotFoundError } from '../../middleware/error.middleware';

// Feature access matrix by plan
const FEATURE_ACCESS: Record<string, string[]> = {
  FREE: ['basic_workouts', 'basic_nutrition', 'progress_tracking'],
  BASIC: ['basic_workouts', 'basic_nutrition', 'progress_tracking', 'ai_coach', 'program_generation'],
  PRO: [
    'basic_workouts',
    'basic_nutrition',
    'progress_tracking',
    'ai_coach',
    'program_generation',
    'advanced_analytics',
    'trainer_messaging',
    'meal_planning',
  ],
  ELITE: [
    'basic_workouts',
    'basic_nutrition',
    'progress_tracking',
    'ai_coach',
    'program_generation',
    'advanced_analytics',
    'trainer_messaging',
    'meal_planning',
    'personal_trainer',
    'priority_support',
  ],
  TRAINER: [
    'basic_workouts',
    'basic_nutrition',
    'progress_tracking',
    'ai_coach',
    'program_generation',
    'advanced_analytics',
    'trainer_messaging',
    'meal_planning',
    'client_management',
    'trainer_tools',
  ],
};

export async function checkFeatureAccess(userId: string, feature: string): Promise<boolean> {
  const subscription = await prisma.subscription.findUnique({ where: { userId } });

  if (!subscription) return FEATURE_ACCESS['FREE'].includes(feature);

  // Check if trial is still active
  if (subscription.status === 'TRIALING') {
    const trialEnd = subscription.trialEndsAt;
    if (trialEnd && trialEnd > new Date()) {
      // Trial gives PRO access
      return FEATURE_ACCESS['PRO'].includes(feature);
    }
  }

  if (subscription.status !== 'ACTIVE' && subscription.status !== 'TRIALING') {
    return FEATURE_ACCESS['FREE'].includes(feature);
  }

  const allowedFeatures = FEATURE_ACCESS[subscription.planType] ?? FEATURE_ACCESS['FREE'];
  return allowedFeatures.includes(feature);
}

export async function getSubscription(userId: string) {
  const subscription = await prisma.subscription.findUnique({ where: { userId } });
  if (!subscription) throw new NotFoundError('Subscription not found.');

  const features = FEATURE_ACCESS[subscription.planType] ?? [];
  const isTrialActive =
    subscription.status === 'TRIALING' &&
    subscription.trialEndsAt !== null &&
    subscription.trialEndsAt > new Date();

  const trialDaysRemaining = isTrialActive && subscription.trialEndsAt
    ? Math.ceil((subscription.trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    ...subscription,
    features,
    isTrialActive,
    trialDaysRemaining,
  };
}

export async function createFreeTrialSubscription(userId: string) {
  const existing = await prisma.subscription.findUnique({ where: { userId } });
  if (existing) return existing;

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  return prisma.subscription.create({
    data: {
      userId,
      planType: 'FREE',
      status: 'TRIALING',
      provider: 'internal',
      trialEndsAt,
    },
  });
}

export async function updateSubscription(
  userId: string,
  data: {
    planType?: string;
    status?: string;
    provider?: string;
    providerSubscriptionId?: string;
    currentPeriodEnd?: Date;
  },
) {
  return prisma.subscription.update({
    where: { userId },
    data: {
      ...(data.planType && { planType: data.planType as any }),
      ...(data.status && { status: data.status as any }),
      ...(data.provider && { provider: data.provider }),
      ...(data.providerSubscriptionId !== undefined && { providerSubscriptionId: data.providerSubscriptionId }),
      ...(data.currentPeriodEnd && { currentPeriodEnd: data.currentPeriodEnd }),
    },
  });
}
