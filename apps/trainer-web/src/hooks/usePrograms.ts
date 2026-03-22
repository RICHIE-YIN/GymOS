import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query';
import { get, post, put, del } from '@/lib/api';
import {
  Program,
  ProgramTemplate,
  PaginatedResponse,
  AssignProgramFormData,
  GoalType,
  ExperienceLevel,
  SplitType,
} from '@/types';

// Query keys
export const programKeys = {
  all: ['programs'] as const,
  lists: () => [...programKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...programKeys.lists(), filters] as const,
  details: () => [...programKeys.all, 'detail'] as const,
  detail: (id: string) => [...programKeys.details(), id] as const,
  templates: () => [...programKeys.all, 'templates'] as const,
  template: (id: string) => [...programKeys.templates(), id] as const,
  clientProgram: (clientId: string) => [...programKeys.all, 'client', clientId] as const,
};

// Template filters
export interface TemplateFilters {
  goal?: GoalType;
  splitType?: SplitType;
  experienceLevel?: ExperienceLevel;
  durationWeeks?: number;
  search?: string;
  page?: number;
  pageSize?: number;
}

// List all templates
export function useTemplates(filters?: TemplateFilters): UseQueryResult<PaginatedResponse<ProgramTemplate>> {
  return useQuery({
    queryKey: [...programKeys.templates(), filters],
    queryFn: () =>
      get<PaginatedResponse<ProgramTemplate>>('/trainer/templates', filters as Record<string, unknown>),
    staleTime: 60_000,
  });
}

// Get single template
export function useTemplate(templateId: string): UseQueryResult<ProgramTemplate> {
  return useQuery({
    queryKey: programKeys.template(templateId),
    queryFn: () => get<ProgramTemplate>(`/trainer/templates/${templateId}`),
    enabled: !!templateId,
  });
}

// Get current program for a client
export function useClientProgram(clientId: string): UseQueryResult<Program | null> {
  return useQuery({
    queryKey: programKeys.clientProgram(clientId),
    queryFn: () => get<Program | null>(`/trainer/clients/${clientId}/program`),
    enabled: !!clientId,
    staleTime: 30_000,
  });
}

// Get program detail
export function useProgram(programId: string): UseQueryResult<Program> {
  return useQuery({
    queryKey: programKeys.detail(programId),
    queryFn: () => get<Program>(`/trainer/programs/${programId}`),
    enabled: !!programId,
  });
}

// List all trainer programs
export function usePrograms(filters?: {
  status?: string;
  page?: number;
  pageSize?: number;
}): UseQueryResult<PaginatedResponse<Program>> {
  return useQuery({
    queryKey: programKeys.list(filters || {}),
    queryFn: () => get<PaginatedResponse<Program>>('/trainer/programs', filters as Record<string, unknown>),
    staleTime: 60_000,
  });
}

// Create a new program template
export function useCreateTemplate(): UseMutationResult<
  ProgramTemplate,
  Error,
  Partial<ProgramTemplate>
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ProgramTemplate>) =>
      post<ProgramTemplate>('/trainer/templates', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: programKeys.templates() });
    },
  });
}

// Duplicate a template
export function useDuplicateTemplate(): UseMutationResult<ProgramTemplate, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) =>
      post<ProgramTemplate>(`/trainer/templates/${templateId}/duplicate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: programKeys.templates() });
    },
  });
}

// Delete a template
export function useDeleteTemplate(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) => del(`/trainer/templates/${templateId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: programKeys.templates() });
    },
  });
}

// Assign program to client
export function useAssignProgram(
  clientId: string
): UseMutationResult<Program, Error, AssignProgramFormData> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AssignProgramFormData) =>
      post<Program>(`/trainer/clients/${clientId}/assign-program`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: programKeys.clientProgram(clientId) });
    },
  });
}

// Generate program with AI
export function useGenerateProgram(): UseMutationResult<
  Program,
  Error,
  {
    clientId: string;
    goal: GoalType;
    daysPerWeek: number;
    durationWeeks: number;
    equipment: string[];
    experienceLevel: ExperienceLevel;
    notes?: string;
  }
> {
  return useMutation({
    mutationFn: (data) => post<Program>('/trainer/programs/generate', data),
  });
}

// Update a program
export function useUpdateProgram(programId: string): UseMutationResult<Program, Error, Partial<Program>> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Program>) =>
      put<Program>(`/trainer/programs/${programId}`, data),
    onSuccess: (program) => {
      queryClient.invalidateQueries({ queryKey: programKeys.detail(programId) });
      if (program.clientId) {
        queryClient.invalidateQueries({
          queryKey: programKeys.clientProgram(program.clientId),
        });
      }
    },
  });
}
