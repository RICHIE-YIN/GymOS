import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query';
import { get, post, put, patch, del } from '@/lib/api';
import {
  Client,
  PaginatedResponse,
  ClientSummary,
  CheckIn,
  WeightLog,
  NutritionLog,
  Measurement,
  ProgressPhoto,
  ActivityFeedItem,
  InviteClientFormData,
  MacroTargets,
} from '@/types';

// Query keys
export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...clientKeys.lists(), filters] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
  summary: () => [...clientKeys.all, 'summary'] as const,
  activity: () => [...clientKeys.all, 'activity'] as const,
  weightLogs: (clientId: string) => [...clientKeys.detail(clientId), 'weight'] as const,
  nutritionLogs: (clientId: string) => [...clientKeys.detail(clientId), 'nutrition'] as const,
  checkIns: (clientId: string) => [...clientKeys.detail(clientId), 'checkins'] as const,
  measurements: (clientId: string) => [...clientKeys.detail(clientId), 'measurements'] as const,
  photos: (clientId: string) => [...clientKeys.detail(clientId), 'photos'] as const,
  macroTargets: (clientId: string) => [...clientKeys.detail(clientId), 'macros'] as const,
};

// List clients with filters
export function useClients(params?: {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): UseQueryResult<PaginatedResponse<Client>> {
  return useQuery({
    queryKey: clientKeys.list(params || {}),
    queryFn: () =>
      get<PaginatedResponse<Client>>('/trainer/clients', params as Record<string, unknown>),
    staleTime: 30_000,
  });
}

// Get client summary stats
export function useClientSummary(): UseQueryResult<ClientSummary> {
  return useQuery({
    queryKey: clientKeys.summary(),
    queryFn: () => get<ClientSummary>('/trainer/clients/summary'),
    staleTime: 60_000,
  });
}

// Get single client
export function useClient(clientId: string): UseQueryResult<Client> {
  return useQuery({
    queryKey: clientKeys.detail(clientId),
    queryFn: () => get<Client>(`/trainer/clients/${clientId}`),
    enabled: !!clientId,
    staleTime: 30_000,
  });
}

// Get activity feed
export function useActivityFeed(limit = 20): UseQueryResult<ActivityFeedItem[]> {
  return useQuery({
    queryKey: [...clientKeys.activity(), limit],
    queryFn: () => get<ActivityFeedItem[]>('/trainer/activity', { limit }),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

// Get clients needing attention
export function useClientsNeedingAttention(): UseQueryResult<Client[]> {
  return useQuery({
    queryKey: [...clientKeys.lists(), 'attention'],
    queryFn: () => get<Client[]>('/trainer/clients/needs-attention'),
    staleTime: 60_000,
  });
}

// Get weight logs for a client
export function useWeightLogs(
  clientId: string,
  days = 90
): UseQueryResult<WeightLog[]> {
  return useQuery({
    queryKey: [...clientKeys.weightLogs(clientId), days],
    queryFn: () => get<WeightLog[]>(`/trainer/clients/${clientId}/weight-logs`, { days }),
    enabled: !!clientId,
    staleTime: 60_000,
  });
}

// Get nutrition logs for a client
export function useNutritionLogs(
  clientId: string,
  days = 30
): UseQueryResult<NutritionLog[]> {
  return useQuery({
    queryKey: [...clientKeys.nutritionLogs(clientId), days],
    queryFn: () => get<NutritionLog[]>(`/trainer/clients/${clientId}/nutrition-logs`, { days }),
    enabled: !!clientId,
    staleTime: 60_000,
  });
}

// Get macro targets for a client
export function useMacroTargets(clientId: string): UseQueryResult<MacroTargets> {
  return useQuery({
    queryKey: clientKeys.macroTargets(clientId),
    queryFn: () => get<MacroTargets>(`/trainer/clients/${clientId}/macro-targets`),
    enabled: !!clientId,
  });
}

// Get check-ins for a client
export function useCheckIns(clientId: string): UseQueryResult<CheckIn[]> {
  return useQuery({
    queryKey: clientKeys.checkIns(clientId),
    queryFn: () => get<CheckIn[]>(`/trainer/clients/${clientId}/check-ins`),
    enabled: !!clientId,
    staleTime: 30_000,
  });
}

// Get measurements for a client
export function useMeasurements(clientId: string): UseQueryResult<Measurement[]> {
  return useQuery({
    queryKey: clientKeys.measurements(clientId),
    queryFn: () => get<Measurement[]>(`/trainer/clients/${clientId}/measurements`),
    enabled: !!clientId,
  });
}

// Get progress photos for a client
export function useProgressPhotos(clientId: string): UseQueryResult<ProgressPhoto[]> {
  return useQuery({
    queryKey: clientKeys.photos(clientId),
    queryFn: () => get<ProgressPhoto[]>(`/trainer/clients/${clientId}/photos`),
    enabled: !!clientId,
  });
}

// Invite a new client
export function useInviteClient(): UseMutationResult<
  { success: boolean },
  Error,
  InviteClientFormData
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InviteClientFormData) =>
      post<{ success: boolean }>('/trainer/clients/invite', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientKeys.summary() });
    },
  });
}

// Update client macro targets
export function useUpdateMacroTargets(
  clientId: string
): UseMutationResult<MacroTargets, Error, Partial<MacroTargets>> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<MacroTargets>) =>
      put<MacroTargets>(`/trainer/clients/${clientId}/macro-targets`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.macroTargets(clientId) });
    },
  });
}

// Review a check-in
export function useReviewCheckIn(
  clientId: string
): UseMutationResult<CheckIn, Error, { checkInId: string; notes?: string }> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ checkInId, notes }) =>
      patch<CheckIn>(`/trainer/clients/${clientId}/check-ins/${checkInId}/review`, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.checkIns(clientId) });
      queryClient.invalidateQueries({ queryKey: clientKeys.summary() });
    },
  });
}

// Archive/deactivate a client
export function useArchiveClient(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (clientId: string) => del(`/trainer/clients/${clientId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientKeys.summary() });
    },
  });
}
