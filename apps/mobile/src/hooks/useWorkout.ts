import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch } from '../lib/api';

// ── Types ─────────────────────────────────────────────────────────────────
export interface Exercise {
  id: string;
  name: string;
  muscleGroups: string[];
  equipment: string;
  instructions: string[];
  videoUrl?: string;
  imageUrl?: string;
}

export interface WorkoutSet {
  id?: string;
  setNumber: number;
  targetReps: number;
  targetWeight?: number;
  actualReps?: number;
  actualWeight?: number;
  completed: boolean;
  rpe?: number; // Rate of Perceived Exertion 1-10
}

export interface WorkoutExercise {
  id: string;
  exercise: Exercise;
  sets: WorkoutSet[];
  restSeconds: number;
  notes?: string;
  previousPerformance?: {
    weight: number;
    reps: number;
    date: string;
  };
}

export interface WorkoutDay {
  id: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  name: string;
  type: 'strength' | 'cardio' | 'rest' | 'active-recovery' | 'mobility';
  exercises: WorkoutExercise[];
  estimatedDuration: number; // minutes
  isCompleted: boolean;
  completedAt?: string;
}

export interface WorkoutProgram {
  id: string;
  name: string;
  description: string;
  durationWeeks: number;
  currentWeek: number;
  days: WorkoutDay[];
}

export interface ActiveWorkoutSession {
  id: string;
  workoutDayId: string;
  startTime: string;
  exercises: WorkoutExercise[];
  currentExerciseIndex: number;
  currentSetIndex: number;
}

export interface WorkoutSummary {
  id: string;
  workoutDayId: string;
  duration: number; // seconds
  totalSets: number;
  totalReps: number;
  totalVolume: number; // kg or lbs
  exercisesCompleted: number;
  personalRecords: PersonalRecord[];
  completedAt: string;
}

export interface PersonalRecord {
  exerciseName: string;
  type: '1rm' | 'max-reps' | 'max-volume';
  value: number;
  previousValue: number;
}

// ── Query keys ─────────────────────────────────────────────────────────────
export const workoutKeys = {
  all: ['workouts'] as const,
  program: () => [...workoutKeys.all, 'program'] as const,
  todayWorkout: () => [...workoutKeys.all, 'today'] as const,
  session: (id: string) => [...workoutKeys.all, 'session', id] as const,
  history: () => [...workoutKeys.all, 'history'] as const,
  summary: (id: string) => [...workoutKeys.all, 'summary', id] as const,
};

// ── Hooks ─────────────────────────────────────────────────────────────────
export function useWorkoutProgram() {
  return useQuery({
    queryKey: workoutKeys.program(),
    queryFn: () => apiGet<WorkoutProgram>('/workouts/program'),
  });
}

export function useTodayWorkout() {
  return useQuery({
    queryKey: workoutKeys.todayWorkout(),
    queryFn: () => apiGet<WorkoutDay>('/workouts/today'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useWorkoutSession(sessionId?: string) {
  const qc = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: workoutKeys.session(sessionId ?? ''),
    queryFn: () => apiGet<ActiveWorkoutSession>(`/workouts/sessions/${sessionId}`),
    enabled: !!sessionId,
  });

  const startSessionMutation = useMutation({
    mutationFn: (workoutDayId: string) =>
      apiPost<ActiveWorkoutSession>('/workouts/sessions', { workoutDayId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: workoutKeys.all });
    },
  });

  const logSetMutation = useMutation({
    mutationFn: (data: {
      sessionId: string;
      exerciseId: string;
      setNumber: number;
      actualReps: number;
      actualWeight: number;
      rpe?: number;
    }) => apiPost(`/workouts/sessions/${data.sessionId}/sets`, data),
    onSuccess: () => {
      if (sessionId) {
        qc.invalidateQueries({ queryKey: workoutKeys.session(sessionId) });
      }
    },
  });

  const completeSessionMutation = useMutation({
    mutationFn: (sid: string) =>
      apiPatch<WorkoutSummary>(`/workouts/sessions/${sid}/complete`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: workoutKeys.all });
    },
  });

  return {
    session: sessionQuery.data,
    isLoadingSession: sessionQuery.isLoading,
    startSession: startSessionMutation.mutateAsync,
    isStarting: startSessionMutation.isPending,
    logSet: logSetMutation.mutateAsync,
    isLoggingSet: logSetMutation.isPending,
    completeSession: completeSessionMutation.mutateAsync,
    isCompleting: completeSessionMutation.isPending,
  };
}

export function useWorkoutSummary(summaryId: string) {
  return useQuery({
    queryKey: workoutKeys.summary(summaryId),
    queryFn: () => apiGet<WorkoutSummary>(`/workouts/summaries/${summaryId}`),
    enabled: !!summaryId,
  });
}

export function useWorkoutHistory() {
  return useQuery({
    queryKey: workoutKeys.history(),
    queryFn: () => apiGet<WorkoutSummary[]>('/workouts/history'),
    staleTime: 5 * 60 * 1000,
  });
}
