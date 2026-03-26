/**
 * NotifyZen Global Constants
 * Centralized mapping for all immutable configuration values.
 */

export const NOTIFYZEN_CONSTANTS = {
  // Brand & Logs
  LOGGER_PREFIX: '[NotifyZen]',
  LOGGER_GUIDANCE_STYLE: 'font-weight: bold; color: #3b82f6;',
  
  // Platform Identifiers
  PLATFORM: {
    WEB: 'web' as const,
    IOS: 'ios' as const,
    ANDROID: 'android' as const,
  },

  // Default Fallbacks
  FALLBACK: {
    TITLE: 'New Notification',
    DEVICE_ID_PREFIX: 'id_',
    WEB_ID_PREFIX: 'web_',
    UNKNOWN: 'unknown_device',
  },

  // API Configuration
  ENDPOINTS: {
    BASE_URL: 'http://localhost:3000/api',
    REGISTER_TOKEN: '/notifications/register',
    SUBSCRIBE_TOPICS: '/notifications/subscribe',
    NOTIFICATION_RECEIVED: '/notifications/received',
  }
} as const;
