import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

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

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#D48C70',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        return null;
      }

      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

      try {
        const pushTokenString = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        
        token = pushTokenString;

        if (token && userId) {
            const { error } = await supabase
            .from('profiles')
            .update({ push_token: token })
            .eq('id', userId);
            
            if (error) console.error(error);
        }

      } catch (e) {
        console.error(e);
      }
    }

    return token;
  }

  async triggerPushNotification(title: string, body: string) {
    try {
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('push_token')
            .not('push_token', 'is', null);

        if (error || !profiles) {
            return;
        }

        const tokens = [...new Set(profiles.map(p => p.push_token).filter(t => t && t.length > 10))];

        if (tokens.length === 0) return;

        const messages = tokens.map(token => ({
            to: token,
            sound: 'default',
            title: title,
            body: body,
            data: { data: 'goes here' },
            channelId: 'default',
        }));

        await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(messages),
        });

    } catch (error) {
        console.error(error);
    }
  }
}

export const notificationService = new NotificationService();