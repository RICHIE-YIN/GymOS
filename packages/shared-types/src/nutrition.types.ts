export enum MacroSourceType {
  SYSTEM = 'SYSTEM',
  TRAINER = 'TRAINER',
  USER = 'USER',
}

export enum MealType {
  BREAKFAST = 'BREAKFAST',
  LUNCH = 'LUNCH',
  DINNER = 'DINNER',
  SNACK = 'SNACK',
  PRE_WORKOUT = 'PRE_WORKOUT',
  POST_WORKOUT = 'POST_WORKOUT',
}

export enum MealCreatedByType {
  USER = 'USER',
  TRAINER = 'TRAINER',
  SYSTEM = 'SYSTEM',
  AI = 'AI',
}

export interface MacroPlan {
  id: string;
  userId: string;
  sourceType: MacroSourceType;
  trainerId?: string | null;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number | null;
  effectiveStartDate: string;
  effectiveEndDate?: string | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DailyNutritionLog {
  id: string;
  userId: string;
  logDate: string;
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  totalFiberG: number;
  waterMl?: number | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  meals?: Meal[];
}

export interface Meal {
  id: string;
  userId: string;
  dailyLogId?: string | null;
  title: string;
  mealType: MealType;
  loggedAt: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number | null;
  servingSize?: number | null;
  servingUnit?: string | null;
  notes?: string | null;
  imageUrl?: string | null;
  createdByType: MealCreatedByType;
  isTemplate: boolean;
  createdAt: string;
  updatedAt: string;
  ingredients?: MealIngredient[];
}

export interface MealIngredient {
  id: string;
  mealId: string;
  name: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number | null;
  externalFoodId?: string | null;
  barcode?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserMealPlanDay {
  id: string;
  userId: string;
  trainerId?: string | null;
  planName: string;
  dayLabel: string;
  dayOfWeek?: number | null;
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  items?: UserMealPlanItem[];
}

export interface UserMealPlanItem {
  id: string;
  mealPlanDayId: string;
  mealId: string;
  mealType: MealType;
  sortOrder: number;
  servingMultiplier: number;
  createdAt: string;
  updatedAt: string;
  meal?: Meal;
}
