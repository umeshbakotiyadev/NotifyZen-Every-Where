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
    DEFAULT_TOPIC: {
      topic_name: 'active-users',
      topic_category_type: 'default',
    },
  },

  // API Configuration
  ENDPOINTS: {
    BASE_URL: 'http://localhost:5000/api',
    MOBILE: {
      SUBSCRIBE: '/mobile/subscribe-topic-name',
      RECEIVE: '/mobile/receive-notification',
    },
    WEB: {
      SUBSCRIBE: '/web/subscribe-topic-name',
      RECEIVE: '/web/receive-notification',
    }
  }
} as const;
