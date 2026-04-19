import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging';
import type { MessagingProvider } from '../types';
import { Logger } from '../utils/logger';

/**
 * Creates a MessagingProvider for Web in NotifyZen Every Where.
 * Requires: firebase/messaging
 * 
 * @param firebaseApp - The initialized Firebase App instance
 * @param vapidKey - The VAPID key for web push
 */
export function createWebProvider(firebaseApp: any, vapidKey?: string): MessagingProvider {
  let messaging: Messaging;
  
  try {
    messaging = getMessaging(firebaseApp);
  } catch (err) {
    Logger.error('Failed to initialize Web Firebase Messaging. Service workers might be missing.');
  }

  return {
    getToken: async () => {
      try {
        if (!messaging) return null;
        return await getToken(messaging, { vapidKey });
      } catch (error: any) {
        Logger.error('Web Token Error:', error.message);
        return null;
      }
    },

    onMessage: (callback) => {
      if (!messaging) return () => {};
      return onMessage(messaging, (payload) => {
        Logger.debug(true, 'Web: Foreground message received.');
        callback(payload);
      });
    },

    // Web doesn't natively have these handlers in the same foreground context,
    // but we provide the stubs to satisfy the interface.
    // Usually these are handled by the Service Worker or standard browser events.
    onNotificationOpenedApp: () => () => {},
    getInitialNotification: async () => null,
    setBackgroundMessageHandler: () => {},
    
    requestPermission: async () => {
      if (typeof Notification === 'undefined') return false;
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    },
  };
}
