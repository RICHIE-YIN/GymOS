// GymOS Trainer Web - Core Types

export type UserRole = 'trainer' | 'admin' | 'client';

export type GoalType =
  | 'weight_loss'
  | 'muscle_gain'
  | 'strength'
  | 'endurance'
  | 'general_fitness'
  | 'flexibility'
  | 'sport_performance';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export type SplitType =
  | 'full_body'
  | 'upper_lower'
  | 'push_pull_legs'
  | 'bro_split'
  | 'custom';

export type ClientStatus = 'active' | 'inactive' | 'needs_attention' | 'pending';

export type ProgramStatus = 'active' | 'completed' | 'paused' | 'draft';

export type MessageRole = 'trainer' | 'client';

export interface Trainer {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  specialties: string[];
  certifications: string[];
  role: UserRole;
  clientCount: number;
  createdAt: string;
}

export interface ClientMetrics {
  currentWeight?: number;
  startingWeight?: number;
  targetWeight?: number;
  weightUnit: 'kg' | 'lbs';
  height?: number;
  heightUnit: 'cm' | 'ft';
  bodyFat?: number;
  bmi?: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
  goal: GoalType;
  experienceLevel: ExperienceLevel;
  status: ClientStatus;
  trainerId: string;
  metrics: ClientMetrics;
  complianceRate: number; // 0-100
  lastActiveAt: string;
  joinedAt: string;
  currentProgramId?: string;
  checkInsDue: number;
  weightTrend: 'up' | 'down' | 'stable';
  weightTrendValue?: number; // change in last 30 days
}

export interface ClientSummary {
  totalClients: number;
  activeThisWeek: number;
  checkInsDue: number;
  avgCompliance: number;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroups: string[];
  equipment: string[];
  category: 'strength' | 'cardio' | 'flexibility' | 'plyometric';
  instructions?: string;
  videoUrl?: string;
  imageUrl?: string;
}

export interface ExerciseSet {
  setNumber: number;
  reps?: number;
  weight?: number;
  weightUnit?: 'kg' | 'lbs';
  duration?: number; // seconds
  distance?: number;
  distanceUnit?: 'km' | 'miles' | 'm';
  restSeconds: number;
  rpe?: number; // 1-10
  notes?: string;
}

export interface ProgramExercise {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  sets: ExerciseSet[];
  order: number;
  notes?: string;
  supersetGroupId?: string;
}

export interface ProgramDay {
  id: string;
  dayNumber: number;
  name: string;
  focus?: string;
  exercises: ProgramExercise[];
  isRestDay: boolean;
  notes?: string;
}

export interface ProgramWeek {
  id: string;
  weekNumber: number;
  days: ProgramDay[];
  notes?: string;
}

export interface Program {
  id: string;
  name: string;
  description?: string;
  goal: GoalType;
  splitType: SplitType;
  durationWeeks: number;
  daysPerWeek: number;
  experienceLevel: ExperienceLevel;
  weeks: ProgramWeek[];
  status: ProgramStatus;
  trainerId: string;
  clientId?: string;
  isTemplate: boolean;
  assignedAt?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProgramTemplate {
  id: string;
  name: string;
  description?: string;
  goal: GoalType;
  splitType: SplitType;
  durationWeeks: number;
  daysPerWeek: number;
  experienceLevel: ExperienceLevel;
  trainerId: string;
  useCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MacroTargets {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
}

export interface NutritionLog {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes?: string;
}

export interface WeightLog {
  date: string;
  weight: number;
  unit: 'kg' | 'lbs';
  bodyFat?: number;
  notes?: string;
}

export interface Measurement {
  date: string;
  chest?: number;
  waist?: number;
  hips?: number;
  thighs?: number;
  arms?: number;
  shoulders?: number;
  unit: 'cm' | 'inches';
}

export interface ProgressPhoto {
  id: string;
  url: string;
  takenAt: string;
  angle: 'front' | 'back' | 'side';
  notes?: string;
}

export interface CheckIn {
  id: string;
  clientId: string;
  date: string;
  weight?: number;
  weightUnit?: 'kg' | 'lbs';
  energyLevel?: number; // 1-5
  sleepHours?: number;
  stressLevel?: number; // 1-5
  notes?: string;
  photos?: ProgressPhoto[];
  workoutsCompleted?: number;
  workoutsTotal?: number;
  nutritionAdherence?: number; // 0-100
  trainerId: string;
  reviewedAt?: string;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderRole: MessageRole;
  senderName: string;
  senderAvatarUrl?: string;
  content: string;
  sentAt: string;
  readAt?: string;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'file' | 'video';
  url: string;
  name: string;
  size?: number;
}

export interface MessageThread {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatarUrl?: string;
  trainerId: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  messages: Message[];
}

export interface ActivityFeedItem {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatarUrl?: string;
  type:
    | 'workout_completed'
    | 'check_in_submitted'
    | 'login'
    | 'message_sent'
    | 'program_started'
    | 'goal_reached';
  description: string;
  occurredAt: string;
}

export interface AnalyticsSummary {
  totalClients: number;
  activeClients: number;
  retentionRate: number;
  avgComplianceRate: number;
  checkInCompletionRate: number;
  totalWorkoutsThisMonth: number;
  revenueThisMonth?: number;
}

export interface RetentionDataPoint {
  month: string;
  retained: number;
  churned: number;
  new: number;
}

export interface ComplianceDataPoint {
  week: string;
  rate: number;
}

export interface PopularSplit {
  splitType: SplitType;
  count: number;
  percentage: number;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface InviteClientFormData {
  name: string;
  email: string;
  goal: GoalType;
  message?: string;
}

export interface AssignProgramFormData {
  source: 'ai' | 'template' | 'new' | 'library';
  templateId?: string;
  goal: GoalType;
  daysPerWeek: number;
  durationWeeks: number;
  equipment: string[];
  experienceLevel: ExperienceLevel;
  notes?: string;
}

export interface TrainerProfileFormData {
  name: string;
  bio: string;
  specialties: string[];
  certifications: string[];
  phone?: string;
}

// Auth types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthState {
  trainer: Trainer | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
