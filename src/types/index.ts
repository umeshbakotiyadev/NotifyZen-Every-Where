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
  onNotificationClick?(callback: (payload: any) => void): () => void;
  requestPermission?(): Promise<boolean>;
}

export interface Topic {
  topic_name: string;
  topic_category_type: string;
}

export interface NotifyZenConfig {
  credentials: NotifyZenCredentials;
  secretKey: string;
  topics?: Array<Topic>;
  provider?: MessagingProvider;
  onTokenRefresh?: (token: string) => void;
  deviceModel?: string;
  appVersion?: string;
  debug?: boolean;
}
