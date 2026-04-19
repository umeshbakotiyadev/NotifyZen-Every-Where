import type { MessagingProvider } from '../types';
import { Logger } from '../utils/logger';

/**
 * Creates a MessagingProvider for React Native in NotifyZen Every Where.
 * Requires: @react-native-firebase/messaging
 * 
 * @param messagingInstance - The instance from @react-native-firebase/messaging
 */
export function createNativeProvider(messagingInstance: any): MessagingProvider {
  return {
    getToken: async () => {
      try {
        const authStatus = await messagingInstance.requestPermission();
        const enabled =
          authStatus === 1 || authStatus === 2; // Authorized or Proportional

        if (enabled) {
          const token = await messagingInstance.getToken();
          return token;
        }
        Logger.warn('Notification permission not granted on Native device.');
        return null;
      } catch (error: any) {
        Logger.error('Native Token Error:', error.message);
        return null;
      }
    },

    onMessage: (callback) => {
      const unsubscribe = messagingInstance.onMessage(async (remoteMessage: any) => {
        Logger.debug(true, 'Native: Foreground message received.');
        callback(remoteMessage);
      });
      return unsubscribe;
    },

    onNotificationOpenedApp: (callback) => {
      return messagingInstance.onNotificationOpenedApp((remoteMessage: any) => {
        Logger.debug(true, 'Native: Notification clicked from background.');
        callback(remoteMessage);
      });
    },

    getInitialNotification: async () => {
      const remoteMessage = await messagingInstance.getInitialNotification();
      if (remoteMessage) {
        Logger.debug(true, 'Native: Notification opened app from quit state.');
      }
      return remoteMessage;
    },

    setBackgroundMessageHandler: (callback) => {
      messagingInstance.setBackgroundMessageHandler(async (remoteMessage: any) => {
        Logger.debug(true, 'Native: Background message received.');
        callback(remoteMessage);
      });
    },

    requestPermission: async () => {
      const authStatus = await messagingInstance.requestPermission();
      return authStatus === 1 || authStatus === 2;
    },
  };
}
