import { Redirect } from 'expo-router';

export default function StartScreen() {
  console.log("--- PASSOU PELO INDEX DA RAIZ ---")
  return <Redirect href="/(auth)/login" />;
}