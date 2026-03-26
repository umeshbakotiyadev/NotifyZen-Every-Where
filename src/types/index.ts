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

export interface NotifyZenConfig {
  credentials: NotifyZenCredentials;
  secretKey: string;
  platformMode?: PlatformMode; // Automatically detected if not provided
  uniqueDeviceId?: string; // Automatically generated if not provided
  topics?: string[];
  provider?: MessagingProvider;
  onTokenRefresh?: (token: string) => void;
  debug?: boolean;
}
