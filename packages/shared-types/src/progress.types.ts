export enum PhotoType {
  FRONT = 'FRONT',
  BACK = 'BACK',
  SIDE_LEFT = 'SIDE_LEFT',
  SIDE_RIGHT = 'SIDE_RIGHT',
  CUSTOM = 'CUSTOM',
}

export interface ProgressCheckIn {
  id: string;
  userId: string;
  checkInDate: string;
  weightKg?: number | null;
  bodyFatPercent?: number | null;
  muscleMassKg?: number | null;
  neckCm?: number | null;
  shouldersCm?: number | null;
  chestCm?: number | null;
  waistCm?: number | null;
  hipsCm?: number | null;
  leftBicepCm?: number | null;
  rightBicepCm?: number | null;
  leftForearmCm?: number | null;
  rightForearmCm?: number | null;
  leftThighCm?: number | null;
  rightThighCm?: number | null;
  leftCalfCm?: number | null;
  rightCalfCm?: number | null;
  energyLevel?: number | null;
  sleepQuality?: number | null;
  stressLevel?: number | null;
  notes?: string | null;
  trainerId?: string | null;
  createdAt: string;
  updatedAt: string;
  photos?: ProgressPhoto[];
}

export interface ProgressPhoto {
  id: string;
  userId: string;
  checkInId?: string | null;
  photoType: PhotoType;
  imageUrl: string;
  thumbnailUrl?: string | null;
  takenAt: string;
  notes?: string | null;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklySummary {
  id: string;
  userId: string;
  weekStartDate: string;
  weekEndDate: string;
  totalWorkouts: number;
  totalWorkoutMinutes: number;
  totalVolumeKg: number;
  totalCaloriesLogged: number;
  avgDailyCalories: number;
  avgDailyProteinG: number;
  avgDailyCarbsG: number;
  avgDailyFatG: number;
  weightAtStart?: number | null;
  weightAtEnd?: number | null;
  weightChange?: number | null;
  adherencePercent?: number | null;
  notes?: string | null;
  trainerId?: string | null;
  trainerFeedback?: string | null;
  createdAt: string;
  updatedAt: string;
}
