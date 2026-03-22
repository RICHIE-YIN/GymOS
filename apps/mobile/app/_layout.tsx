import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../src/lib/queryClient';
import { hydrateStore, useAppStore } from '../src/lib/store';

export default function RootLayout() {
  const { isLoading } = useAppStore();

  useEffect(() => {
    hydrateStore();
  }, []);

  if (isLoading) {
    // Splash is shown by Expo while loading
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="workout" />
          <Stack.Screen name="nutrition" />
          <Stack.Screen name="progress" />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
