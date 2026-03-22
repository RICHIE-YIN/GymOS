import type {
  UserRole,
  GoalType,
  ActivityLevel,
  ExperienceLevel,
  EquipmentAccess,
  GenderType,
  UnitsPreference,
  DietaryStyle,
  User,
  UserProfile,
} from './user.types';
import type { MacroPlan } from './nutrition.types';
import type { WorkoutProgram, SplitType, Difficulty } from './workout.types';

// -------------------------
// Generic response wrappers
// -------------------------

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
  timestamp: string;
}

export interface PaginatedResponse<T = unknown> {
  success: boolean;
  data: T[];
  pagination: Pagination;
  message?: string;
  error?: ApiError;
  timestamp: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
  statusCode: number;
}

// -------------------------
// Auth DTOs
// -------------------------

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  profile?: UserProfile;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface RegisterResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// -------------------------
// Onboarding DTOs
// -------------------------

export interface OnboardingRequest {
  gender?: GenderType;
  dateOfBirth?: string;
  heightCm?: number;
  weightKg?: number;
  goalType?: GoalType;
  targetWeightKg?: number;
  activityLevel?: ActivityLevel;
  experienceLevel?: ExperienceLevel;
  equipmentAccess?: EquipmentAccess;
  dietaryStyle?: DietaryStyle;
  unitsPreference?: UnitsPreference;
  workoutsPerWeek?: number;
  medicalNotes?: string;
}

export interface OnboardingResponse {
  profile: UserProfile;
  isOnboardingComplete: boolean;
}

// -------------------------
// Macro calculation DTOs
// -------------------------

export interface MacroCalculateRequest {
  heightCm: number;
  weightKg: number;
  age: number;
  gender: GenderType;
  activityLevel: ActivityLevel;
  goalType: GoalType;
  targetWeightKg?: number;
  dietaryStyle?: DietaryStyle;
}

export interface MacroCalculateResponse {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  bmr: number;
  tdee: number;
  caloricAdjustment: number;
  weeklyWeightChangeKg: number;
  estimatedWeeksToGoal?: number;
  notes?: string;
  macroPlan?: MacroPlan;
}

// -------------------------
// Program generation DTOs
// -------------------------

export interface GenerateProgramRequest {
  goalType: GoalType;
  experienceLevel: ExperienceLevel;
  equipmentAccess: EquipmentAccess;
  daysPerWeek: number;
  durationWeeks?: number;
  splitType?: SplitType;
  difficulty?: Difficulty;
  focusMuscleGroups?: string[];
  excludeExercises?: string[];
  additionalNotes?: string;
}

export interface GenerateProgramResponse {
  program: WorkoutProgram;
  generationNotes?: string;
}

// -------------------------
// Query / filter params
// -------------------------

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

export interface WorkoutSessionQueryParams extends PaginationParams, DateRangeParams {
  programId?: string;
  status?: string;
}

export interface NutritionLogQueryParams extends PaginationParams, DateRangeParams {
  includesMeals?: boolean;
}

export interface ProgressCheckInQueryParams extends PaginationParams, DateRangeParams {
  includesPhotos?: boolean;
}
