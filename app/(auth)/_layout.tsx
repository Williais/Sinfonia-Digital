import { Stack } from 'expo-router';
import { Colors } from '../../constants/Colors';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Aqui definimos que a tela 'login' existe nessa pilha */}
      <Stack.Screen name="login" />
    </Stack>
  );
}