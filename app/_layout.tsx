import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Colors } from "../constants/Colors";
import { supabase } from "../lib/supabase";
import { notificationService } from "../services/notification.service";

export default function RootLayout() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(undefined); // undefined = carregando
  const [isReady, setIsReady] = useState(false);
  
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) setIsReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) setIsReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      supabase
        .from('profiles')
        .select('instrument, nickname')
        .eq('id', session.user.id)
        .single()
        .then(({ data }) => {
          setProfile(data || null);
          setIsReady(true);
          notificationService.registerForPushNotificationsAsync(session.user.id);
        });
    } else {
      setProfile(undefined);
    }
  }, [session]);

  useEffect(() => {

    if (!isReady || profile === undefined) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[1] === 'onboarding' || segments[0] === 'onboarding';

    if (!session) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else {
      const precisaOnboarding =
        !profile ||
        !profile.instrument ||
        profile.instrument.trim() === '' ||
        profile.instrument === 'null' ||
        !profile.nickname ||
        profile.nickname.trim() === '';

      if (precisaOnboarding) {

        if (!inOnboarding) {
          router.replace('/(auth)/onboarding');
        }
      } else {

        if (inAuthGroup || inOnboarding) {
          router.replace('/(tabs)');
        }
      }
    }
  }, [session, profile, segments, isReady]);

  if (!isReady) return null;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.dark.background }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ animation: "fade" }} />
        <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
        <Stack.Screen name="index" />
      </Stack>
    </View>
  );
}