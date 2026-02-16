import { Stack } from 'expo-router';

export default function AcervoStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="lista" />
      <Stack.Screen name="[id]" />   
    </Stack>
  );
}