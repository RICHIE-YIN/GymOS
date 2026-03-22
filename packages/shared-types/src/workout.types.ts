export enum MuscleGroup {
  CHEST = 'CHEST',
  BACK = 'BACK',
  SHOULDERS = 'SHOULDERS',
  BICEPS = 'BICEPS',
  TRICEPS = 'TRICEPS',
  FOREARMS = 'FOREARMS',
  CORE = 'CORE',
  GLUTES = 'GLUTES',
  QUADS = 'QUADS',
  HAMSTRINGS = 'HAMSTRINGS',
  CALVES = 'CALVES',
  FULL_BODY = 'FULL_BODY',
}

export enum Equipment {
  BARBELL = 'BARBELL',
  DUMBBELL = 'DUMBBELL',
  CABLE = 'CABLE',
  MACHINE = 'MACHINE',
  BODYWEIGHT = 'BODYWEIGHT',
  KETTLEBELL = 'KETTLEBELL',
  RESISTANCE_BAND = 'RESISTANCE_BAND',
  SMITH_MACHINE = 'SMITH_MACHINE',
  TRAP_BAR = 'TRAP_BAR',
  EZ_BAR = 'EZ_BAR',
  PULL_UP_BAR = 'PULL_UP_BAR',
  DIP_BARS = 'DIP_BARS',
  BENCH = 'BENCH',
  NONE = 'NONE',
}

export enum Difficulty {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export enum MovementPattern {
  PUSH = 'PUSH',
  PULL = 'PULL',
  HINGE = 'HINGE',
  SQUAT = 'SQUAT',
  CARRY = 'CARRY',
  ROTATION = 'ROTATION',
  ISOMETRIC = 'ISOMETRIC',
}

export enum ProgramSourceType {
  SYSTEM = 'SYSTEM',
  TRAINER = 'TRAINER',
  USER = 'USER',
  AI = 'AI',
}

export enum SplitType {
  FULL_BODY = 'FULL_BODY',
  UPPER_LOWER = 'UPPER_LOWER',
  PUSH_PULL_LEGS = 'PUSH_PULL_LEGS',
  BODY_PART = 'BODY_PART',
  ARNOLD = 'ARNOLD',
  BRO_SPLIT = 'BRO_SPLIT',
  CUSTOM = 'CUSTOM',
}

export enum SessionStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
}

export interface Exercise {
  id: string;
  name: string;
  description?: string | null;
  primaryMuscleGroup: MuscleGroup;
  secondaryMuscleGroups: MuscleGroup[];
  equipment: Equipment;
  movementPattern: MovementPattern;
  difficulty: Difficulty;
  instructions: string[];
  tips?: string | null;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  isUnilateral: boolean;
  isCompound: boolean;
  createdByUserId?: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutProgram {
  id: string;
  userId: string;
  trainerId?: string | null;
  sourceType: ProgramSourceType;
  name: string;
  description?: string | null;
  splitType: SplitType;
  durationWeeks: number;
  daysPerWeek: number;
  difficulty: Difficulty;
  equipmentRequired: Equipment[];
  goals: string[];
  isActive: boolean;
  isTemplate: boolean;
  isPublic: boolean;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
  weeks?: WorkoutWeek[];
}

export interface WorkoutWeek {
  id: string;
  programId: string;
  weekNumber: number;
  name?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  days?: WorkoutDay[];
}

export interface WorkoutDay {
  id: string;
  weekId: string;
  programId: string;
  dayNumber: number;
  name: string;
  targetMuscleGroups: MuscleGroup[];
  notes?: string | null;
  estimatedDurationMinutes?: number | null;
  isRestDay: boolean;
  createdAt: string;
  updatedAt: string;
  exercises?: WorkoutDayExercise[];
}

export interface WorkoutDayExercise {
  id: string;
  workoutDayId: string;
  exerciseId: string;
  sortOrder: number;
  sets: number;
  repsMin?: number | null;
  repsMax?: number | null;
  reps?: number | null;
  durationSeconds?: number | null;
  restSeconds?: number | null;
  tempo?: string | null;
  rpe?: number | null;
  weightKg?: number | null;
  weightPercent1RM?: number | null;
  notes?: string | null;
  isSuperset: boolean;
  supersetGroupId?: string | null;
  createdAt: string;
  updatedAt: string;
  exercise?: Exercise;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  workoutDayId?: string | null;
  programId?: string | null;
  name: string;
  status: SessionStatus;
  scheduledDate?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  durationMinutes?: number | null;
  totalVolumeKg?: number | null;
  caloriesBurned?: number | null;
  notes?: string | null;
  rpe?: number | null;
  mood?: number | null;
  createdAt: string;
  updatedAt: string;
  setLogs?: WorkoutSetLog[];
}

export interface WorkoutSetLog {
  id: string;
  sessionId: string;
  exerciseId: string;
  setNumber: number;
  reps?: number | null;
  weightKg?: number | null;
  durationSeconds?: number | null;
  distanceMeters?: number | null;
  rpe?: number | null;
  isWarmup: boolean;
  isDropSet: boolean;
  isFailure: boolean;
  notes?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  exercise?: Exercise;
}
