export interface NotifyZenCredentials {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
  vapidKey?: string;
}

export interface NotificationPayload {
  id?: string;
  title: string;
  body: string;
  image?: string;
  data?: any;
  timestamp: string;
}

export type NotificationListener = (notification: NotificationPayload) => void;

export type PlatformMode = 'ios' | 'android' | 'web';

export interface MessagingProvider {
  getToken(): Promise<string | null>;
  onMessage(callback: (payload: any) => void): () => void;
  onNotificationOpenedApp?(callback: (payload: any) => void): () => void;
  getInitialNotification?(): Promise<any>;
  setBackgroundMessageHandler?(callback: (payload: any) => void): void;
  requestPermission?(): Promise<boolean>;
}

export interface Topic {
  topic_name: string;
  topic_category_type: string;
}

/**
 * Configuration options for initializing the NotifyZen SDK.
 */
export interface NotifyZenConfig {
  /**
   * Firebase credentials required to initialize FCM.
   * Obtain these from your Firebase Project Settings.
   */
  credentials: NotifyZenCredentials;

  /**
   * Your unique NotifyZen Secret Key.
   * Required for authenticating with the NotifyZen backend.
   */
  secretKey: string;

  /**
   * Optional initial topics to subscribe the device to.
   */
  topics?: Array<Topic>;

  /**
   * Optional custom messaging provider. 
   * Use this for advanced scenarios or custom notification handling.
   */
  provider?: MessagingProvider;

  /**
   * Callback executed when the FCM registration token is generated or updated.
   */
  onTokenRefresh?: (token: string) => void;

  /**
   * Callback executed when a notification is received while the app is in the foreground.
   */
  onMessage?: NotificationListener;

  /**
   * Callback executed when a notification is clicked by the user.
   */
  onClick?: NotificationListener;

  /**
   * Callback executed when a notification is received while the app is in the background.
   */
  onBackgroundMessage?: NotificationListener;

  /**
   * Callback executed when a notification causes the app to open from a background state (Mobile).
   */
  onNotificationOpenedApp?: NotificationListener;

  /**
   * Callback executed when the app is launched from a terminated state via a notification (Mobile).
   */
  onInitialNotification?: NotificationListener;

  /**
   * Manually specify the device model (e.g., "iPhone 13").
   * If not provided, it will be auto-detected where possible.
   */
  deviceModel?: string;

  /**
   * Manually specify the application version.
   * If not provided, it will be auto-detected where possible.
   */
  appVersion?: string;

  /**
   * Enable verbose logging in the console for troubleshooting.
   */
  debug?: boolean;

  /**
   * Strategy for reporting notification interactions to the backend.
   * - 'all': Report both received (listener) and clicked events.
   * - 'on_listener': Report only when a notification is received.
   * - 'on_click': Report only when a notification is clicked.
   * @default 'all'
   */
  update_via?: 'all' | 'on_listener' | 'on_click';
}
