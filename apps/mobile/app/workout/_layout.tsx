import { Stack } from 'expo-router';
import { Colors } from '../../src/constants/colors';

export default function WorkoutLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_bottom',
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="active" />
      <Stack.Screen name="summary" />
    </Stack>
  );
}
