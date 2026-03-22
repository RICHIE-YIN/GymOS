export enum UserRole {
  CLIENT = 'CLIENT',
  TRAINER = 'TRAINER',
  ADMIN = 'ADMIN',
}

export enum GoalType {
  LOSE_FAT = 'LOSE_FAT',
  BUILD_MUSCLE = 'BUILD_MUSCLE',
  RECOMPOSITION = 'RECOMPOSITION',
  MAINTENANCE = 'MAINTENANCE',
  STRENGTH = 'STRENGTH',
  ENDURANCE = 'ENDURANCE',
}

export enum ActivityLevel {
  SEDENTARY = 'SEDENTARY',
  LIGHTLY_ACTIVE = 'LIGHTLY_ACTIVE',
  MODERATELY_ACTIVE = 'MODERATELY_ACTIVE',
  VERY_ACTIVE = 'VERY_ACTIVE',
  EXTRA_ACTIVE = 'EXTRA_ACTIVE',
}

export enum ExperienceLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export enum EquipmentAccess {
  FULL_GYM = 'FULL_GYM',
  HOME_GYM = 'HOME_GYM',
  BODYWEIGHT = 'BODYWEIGHT',
  DUMBBELLS_ONLY = 'DUMBBELLS_ONLY',
}

export enum GenderType {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum UnitsPreference {
  IMPERIAL = 'IMPERIAL',
  METRIC = 'METRIC',
}

export enum DietaryStyle {
  NONE = 'NONE',
  HIGH_PROTEIN = 'HIGH_PROTEIN',
  VEGETARIAN = 'VEGETARIAN',
  VEGAN = 'VEGAN',
  HALAL = 'HALAL',
  KETO = 'KETO',
  PALEO = 'PALEO',
  GLUTEN_FREE = 'GLUTEN_FREE',
  DAIRY_FREE = 'DAIRY_FREE',
  LOW_CARB = 'LOW_CARB',
  MEDITERRANEAN = 'MEDITERRANEAN',
  INTERMITTENT_FASTING = 'INTERMITTENT_FASTING',
}

export enum RelationshipStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  TERMINATED = 'TERMINATED',
}

export interface User {
  id: string;
  role: UserRole;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  gender?: GenderType | null;
  dateOfBirth?: string | null;
  heightCm?: number | null;
  weightKg?: number | null;
  goalType?: GoalType | null;
  targetWeightKg?: number | null;
  activityLevel?: ActivityLevel | null;
  experienceLevel?: ExperienceLevel | null;
  equipmentAccess?: EquipmentAccess | null;
  dietaryStyle?: DietaryStyle | null;
  unitsPreference: UnitsPreference;
  workoutsPerWeek?: number | null;
  medicalNotes?: string | null;
  isOnboardingComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TrainerProfile {
  id: string;
  userId: string;
  bio?: string | null;
  specializations: string[];
  certifications: string[];
  yearsOfExperience?: number | null;
  maxClients?: number | null;
  currentClientCount: number;
  isAcceptingClients: boolean;
  hourlyRate?: number | null;
  currency: string;
  websiteUrl?: string | null;
  instagramHandle?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientTrainerRelationship {
  id: string;
  clientId: string;
  trainerId: string;
  status: RelationshipStatus;
  startDate?: string | null;
  endDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  client?: User;
  trainer?: User;
}
