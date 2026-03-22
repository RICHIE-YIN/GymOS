import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query';
import { get, post } from '@/lib/api';
import { MessageThread, Message } from '@/types';

export const messageKeys = {
  all: ['messages'] as const,
  threads: () => [...messageKeys.all, 'threads'] as const,
  thread: (threadId: string) => [...messageKeys.all, 'thread', threadId] as const,
};

export function useMessageThreads(): UseQueryResult<MessageThread[]> {
  return useQuery({
    queryKey: messageKeys.threads(),
    queryFn: () => get<MessageThread[]>('/trainer/messages/threads'),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useMessageThread(threadId: string): UseQueryResult<MessageThread> {
  return useQuery({
    queryKey: messageKeys.thread(threadId),
    queryFn: () => get<MessageThread>(`/trainer/messages/threads/${threadId}`),
    enabled: !!threadId,
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
}

export function useSendMessage(
  threadId: string
): UseMutationResult<Message, Error, { content: string }> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { content: string }) =>
      post<Message>(`/trainer/messages/threads/${threadId}/send`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.thread(threadId) });
      queryClient.invalidateQueries({ queryKey: messageKeys.threads() });
    },
  });
}

export function useMarkThreadRead(
  threadId: string
): UseMutationResult<void, Error, void> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => post<void>(`/trainer/messages/threads/${threadId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.thread(threadId) });
      queryClient.invalidateQueries({ queryKey: messageKeys.threads() });
    },
  });
}
