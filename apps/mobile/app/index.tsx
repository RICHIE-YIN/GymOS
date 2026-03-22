import { Redirect } from 'expo-router';
import { useAppStore } from '../src/lib/store';

export default function Root() {
  const { isAuthenticated, user } = useAppStore();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (user && !user.onboardingComplete) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  return <Redirect href="/(tabs)/" />;
}
