import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform, LogBox } from 'react-native';
import { supabase } from '../lib/supabase';

LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  async registerForPushNotificationsAsync(userId: string) {
    let token;

    const isExpoGo = Constants.appOwnership === 'expo';

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#D48C70',
      });
    }

    if (Device.isDevice) {
      if (isExpoGo && Platform.OS === 'android') {
        console.log('Ambiente Expo Go detectado. Pulando registro de Push para evitar erros.');
        return null; 
      }

      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
          return null;
        }

        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
        
        token = (await Notifications.getExpoPushTokenAsync({
          projectId: projectId,
        })).data;
        
      } catch (e) {
        console.log("Erro ao gerar token:", e);
      }
    }

    if (token && userId) {
      await supabase
        .from('profiles')
        .update({ push_token: token })
        .eq('id', userId);
    }

    return token;
  }

  async triggerPushNotification(title: string, body: string) {
  const { data } = await supabase.from('profiles').select('push_token').not('push_token', 'is', null);
  const tokens = data?.map(i => i.push_token) || [];

  if (tokens.length === 0) return;

  await supabase.functions.invoke('send-push', {
    body: { tokens, title, body }
  });
}
}

export const notificationService = new NotificationService();