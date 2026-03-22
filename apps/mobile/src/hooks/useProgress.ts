import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../lib/api';

export interface CheckIn {
  id: string;
  date: string;
  weight: number;
  measurements?: {
    waist?: number;
    chest?: number;
    leftArm?: number;
    rightArm?: number;
    leftThigh?: number;
    rightThigh?: number;
  };
  notes?: string;
  photoUrl?: string;
}

export interface ProgressSummary {
  startWeight: number;
  currentWeight: number;
  weightChange: number;
  weeksActive: number;
  workoutsCompleted: number;
  compliancePercent: number;
  checkIns: CheckIn[];
}

export interface StrengthProgress {
  exerciseId: string;
  exerciseName: string;
  data: { date: string; weight: number; reps: number; estimated1rm: number }[];
}

export const progressKeys = {
  all: ['progress'] as const,
  summary: () => [...progressKeys.all, 'summary'] as const,
  checkIns: () => [...progressKeys.all, 'check-ins'] as const,
  strength: (exerciseId: string) => [...progressKeys.all, 'strength', exerciseId] as const,
  photos: () => [...progressKeys.all, 'photos'] as const,
};

export function useProgress() {
  const qc = useQueryClient();

  const summaryQuery = useQuery({
    queryKey: progressKeys.summary(),
    queryFn: () => apiGet<ProgressSummary>('/progress/summary'),
    staleTime: 5 * 60 * 1000,
  });

  const checkInsQuery = useQuery({
    queryKey: progressKeys.checkIns(),
    queryFn: () => apiGet<CheckIn[]>('/progress/check-ins'),
  });

  const checkInMutation = useMutation({
    mutationFn: (data: Omit<CheckIn, 'id'>) =>
      apiPost<CheckIn>('/progress/check-ins', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: progressKeys.all });
    },
  });

  return {
    summary: summaryQuery.data,
    isLoadingSummary: summaryQuery.isLoading,
    checkIns: checkInsQuery.data ?? [],
    submitCheckIn: checkInMutation.mutateAsync,
    isSubmitting: checkInMutation.isPending,
    checkInError: checkInMutation.error,
  };
}

export function useStrengthProgress(exerciseId: string) {
  return useQuery({
    queryKey: progressKeys.strength(exerciseId),
    queryFn: () => apiGet<StrengthProgress>(`/progress/strength/${exerciseId}`),
    enabled: !!exerciseId,
  });
}
