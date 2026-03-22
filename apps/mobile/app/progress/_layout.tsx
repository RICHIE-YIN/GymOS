import { Stack } from 'expo-router';
import { Colors } from '../../src/constants/colors';

export default function ProgressLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="check-in" />
    </Stack>
  );
}
