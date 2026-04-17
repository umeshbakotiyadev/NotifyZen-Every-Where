import { initializeApp, type FirebaseApp } from 'firebase/app';
import type { NotifyZenConfig, NotificationPayload, NotificationListener, MessagingProvider, PlatformMode } from '../types';
import { NotifyZenAPI } from '../api';
import { Logger } from '../utils/logger';
import { NOTIFYZEN_CONSTANTS } from '../constants';

export class NotifyZen {
  private static instance: NotifyZen;
  private firebaseApp: FirebaseApp | null = null;
  private messagingProvider: MessagingProvider | null = null;
  private onMessageListeners: NotificationListener[] = [];
  private onClickListeners: NotificationListener[] = [];
  private token: string | null = null;
  private config: NotifyZenConfig | null = null;
  private unsubscribeMessage: (() => void) | null = null;
  private unsubscribeClick: (() => void) | null = null;
  private uniqueDeviceId: string | null = null;
  private deviceModel: string | null = null;
  private appVersion: string | null = null;
  private reportedNotificationIds: string[] = [];
  private platformMode: PlatformMode = NOTIFYZEN_CONSTANTS.PLATFORM.WEB;

  private constructor() { }

  public static getInstance(): NotifyZen {
    if (!NotifyZen.instance) {
      NotifyZen.instance = new NotifyZen();
    }
    return NotifyZen.instance;
  }

  public async initialize(config: NotifyZenConfig): Promise<void> {
    this.config = config;
    const debug = !!config.debug;

    if (!config.secretKey) {
      Logger.error('Initialization Error: "secretKey" is required to communicate with NotifyZen backend.');
      throw new Error('NotifyZen configuration missing secretKey');
    }

    try {
      if (config.credentials) {
        this.firebaseApp = initializeApp(config.credentials);
        Logger.debug(debug, 'Firebase initialized.');
      }

      this.platformMode = await this.autoDetectPlatform();
      await this.autoDetectUniqueId();

      if (config.provider) {
        this.messagingProvider = config.provider;
        Logger.debug(debug, 'Custom Messaging Provider injected.');
      } else if (typeof window !== 'undefined') {
        try {
          const { getMessaging, getToken, onMessage } = await import('firebase/messaging');
          const messaging = getMessaging(this.firebaseApp!);
          this.messagingProvider = {
            getToken: async () => await getToken(messaging, { vapidKey: config.credentials.vapidKey }),
            onMessage: (callback) => onMessage(messaging, callback),
          };
          Logger.debug(debug, 'Defaulted to Web Messaging Provider.');
        } catch (err: any) {
          Logger.error('Failed to load Web Firebase Messaging.');
        }
      }

      Logger.debug(debug, 'Successfully initialized.');

      await this.fetchAndSetToken();
      this.setupListeners();

      // Always sync with the backend to register the token/device
      const initialTopics = this.config?.topics || [];
      await this.subscribeToTopics(initialTopics);
    } catch (error: any) {
      Logger.error('Initialization error:', error.message);
      throw error;
    }
  }

  private async autoDetectPlatform(): Promise<PlatformMode> {
    try {
      if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
        try {
          const { Platform } = await import('react-native');
          return (Platform.OS as PlatformMode) || NOTIFYZEN_CONSTANTS.PLATFORM.WEB;
        } catch (e) {
          const userAgent = navigator.userAgent || '';
          if (/iPad|iPhone|iPod/.test(userAgent)) return NOTIFYZEN_CONSTANTS.PLATFORM.IOS;
          if (/Android/.test(userAgent)) return NOTIFYZEN_CONSTANTS.PLATFORM.ANDROID;
        }
      }
      if (typeof window !== 'undefined') return NOTIFYZEN_CONSTANTS.PLATFORM.WEB;
      return NOTIFYZEN_CONSTANTS.PLATFORM.WEB;
    } catch (err) {
      return NOTIFYZEN_CONSTANTS.PLATFORM.WEB;
    }
  }

  private async autoDetectUniqueId(): Promise<void> {
    const debug = !!this.config?.debug;
    const constants = NOTIFYZEN_CONSTANTS.FALLBACK;

    try {
      if (this.platformMode === NOTIFYZEN_CONSTANTS.PLATFORM.WEB) {
        const FingerprintJS = await import('@fingerprintjs/fingerprintjs');
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        this.uniqueDeviceId = result.visitorId;
        this.deviceModel = typeof navigator !== 'undefined' ? navigator.userAgent.split(' ')[0] : 'Web Browser';
        Logger.debug(debug, 'Auto-detected Web ID:', this.uniqueDeviceId);
      } else {
        try {
          const DeviceInfo = await import('react-native-device-info');
          if (DeviceInfo) {
            if (DeviceInfo.getDeviceId) this.uniqueDeviceId = await DeviceInfo.getDeviceId();
            if (DeviceInfo.getModel) this.deviceModel = await DeviceInfo.getModel();
            if (DeviceInfo.getVersion) this.appVersion = await DeviceInfo.getVersion();
            Logger.debug(debug, 'Auto-detected Native Info:', { id: this.uniqueDeviceId, model: this.deviceModel, version: this.appVersion });
          }
        } catch (e) {
          this.uniqueDeviceId = constants.DEVICE_ID_PREFIX + Math.random().toString(36).substr(2, 9);
          Logger.warn('Mobile Device ID fallback generated.');
        }
      }

      // Override with config if provided
      if (this.config?.deviceModel) this.deviceModel = this.config.deviceModel;
      if (this.config?.appVersion) this.appVersion = this.config.appVersion;
    } catch (err) {
      this.uniqueDeviceId = constants.UNKNOWN + '_' + Date.now();
      Logger.error('Failed to auto-detect device info.');
    }
  }

  public async subscribeToTopics(
    topics: Array<{ topic_name: string; topic_category_type: string }>,
    unsubscribeTopicNames: string[] = []
  ): Promise<void> {
    if (!this.token || !this.config) {
      Logger.warn('Cannot subscribe: Token missing or NotifyZen not initialized.');
      return;
    }

    try {
      // Ensure system-wide default topic is included
      const subscribe_topics = [NOTIFYZEN_CONSTANTS.FALLBACK.DEFAULT_TOPIC, ...topics];

      const payload: any = {
        secret_key: this.config.secretKey,
        device_id: this.uniqueDeviceId || NOTIFYZEN_CONSTANTS.FALLBACK.UNKNOWN,
        fcm_token: this.token,
        platform: this.platformMode,
        subscribe_topics,
        unsubscribe_topic_names: unsubscribeTopicNames,
      };

      if (this.deviceModel) payload.device_model = this.deviceModel;
      if (this.appVersion) payload.app_version = this.appVersion;

      Logger.debug(!!this.config.debug, 'Syncing subscription payload:', payload);

      await NotifyZenAPI.subscribe(this.platformMode, payload, !!this.config.debug);
    } catch (error: any) {
      Logger.error('Topic subscription/sync failed:', error.message);
    }
  }

  public async reportNotificationInteraction(notification: NotificationPayload): Promise<void> {
    if (!this.config || !notification.id) {
      Logger.warn('Notification interaction report skipped: Missing config or notification ID.');
      return;
    }

    const notificationId = notification.id;

    if (this.reportedNotificationIds.includes(notificationId)) {
      Logger.debug(!!this.config.debug, 'Notification already reported, skipping API call:', notificationId);
      return;
    }

    try {
      const payload = {
        secrate_key: this.config.secretKey,
        notification_message_id: notificationId,
        platform_type: this.platformMode,
        device_id: this.uniqueDeviceId || NOTIFYZEN_CONSTANTS.FALLBACK.UNKNOWN,
      };

      await NotifyZenAPI.receive(this.platformMode, payload, !!this.config.debug);
      
      this.reportedNotificationIds.push(notificationId);
      Logger.debug(!!this.config.debug, 'Notification interaction reported successfully:', notificationId);
    } catch (err) {
      Logger.error('Failed to report interaction to backend.');
    }
  }

  private async fetchAndSetToken(): Promise<void> {
    if (!this.messagingProvider) return;
    try {
      const currentToken = await this.messagingProvider.getToken();
      if (currentToken) {
        this.token = currentToken;
        if (this.config?.onTokenRefresh) {
          this.config.onTokenRefresh(this.token);
        }
      }
    } catch (error: any) {
      Logger.error('Error while fetching FCM token:', error.message);
    }
  }

  private setupListeners(): void {
    if (!this.messagingProvider) return;

    if (this.unsubscribeMessage) this.unsubscribeMessage();
    this.unsubscribeMessage = this.messagingProvider.onMessage((payload: any) => {
      const notification = this.mapPayload(payload);
      this.notifyListeners('onMessage', notification);
    });

    if (this.unsubscribeClick) this.unsubscribeClick();
    if (this.messagingProvider.onNotificationClick) {
      this.unsubscribeClick = this.messagingProvider.onNotificationClick((payload: any) => {
        const notification = this.mapPayload(payload);
        this.notifyListeners('onClick', notification);
      });
    }
  }

  private mapPayload(payload: any): NotificationPayload {
    const rawData = payload.data || {};
    return {
      id: payload.messageId || rawData.notification_id || rawData.id || 'notif_' + Date.now(),
      title: payload.notification?.title || rawData.title || NOTIFYZEN_CONSTANTS.FALLBACK.TITLE,
      body: payload.notification?.body || rawData.body || '',
      data: rawData,
      image: payload.notification?.image || payload.notification?.android?.imageUrl || '',
      timestamp: new Date().toISOString(),
    };
  }

  public addListener(event: 'onMessage' | 'onClick', listener: NotificationListener): () => void {
    const list = event === 'onMessage' ? this.onMessageListeners : this.onClickListeners;
    list.push(listener);

    return () => {
      if (event === 'onMessage') {
        this.onMessageListeners = this.onMessageListeners.filter((l) => l !== listener);
      } else {
        this.onClickListeners = this.onClickListeners.filter((l) => l !== listener);
      }
    };
  }

  private notifyListeners(event: 'onMessage' | 'onClick', notification: NotificationPayload): void {
    if (event === 'onMessage') {
      this.onMessageListeners.forEach((l) => l(notification));
    } else {
      // Auto-report Click Interaction to backend as requested
      this.reportNotificationInteraction(notification);
      this.onClickListeners.forEach((l) => l(notification));
    }
  }

  public getToken(): string | null {
    return this.token;
  }
}

export const notifyZen = NotifyZen.getInstance();
