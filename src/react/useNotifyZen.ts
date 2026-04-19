import { useState, useEffect, useCallback, useRef } from 'react';
import type { NotifyZenConfig, NotificationPayload, NotifyZenCredentials, PlatformMode, Topic } from '../types';
import { notifyZen } from '../core';
import { Logger } from '../utils/logger';

interface UseNotifyZenConfig extends Partial<Omit<NotifyZenConfig, 'credentials' | 'secretKey'>> {
  secretKey: string;
  topics?: Array<Topic>;
}

export function useNotifyZen(credentials: NotifyZenCredentials, config: UseNotifyZenConfig) {
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitializedRef = useRef(false);

  const configRef = useRef(config);
  configRef.current = config;

  const handleMessage = useCallback((notification: NotificationPayload) => {
    Logger.debug(!!configRef.current.debug, 'Notification received (Foreground):', notification);
    if (configRef.current.onMessage) configRef.current.onMessage(notification);
  }, []);

  const handleBackgroundMessage = useCallback((notification: NotificationPayload) => {
    Logger.debug(!!configRef.current.debug, 'Notification received (Background):', notification);
    if (configRef.current.onBackgroundMessage) configRef.current.onBackgroundMessage(notification);
  }, []);

  const handleNotificationOpenedApp = useCallback((notification: NotificationPayload) => {
    Logger.debug(!!configRef.current.debug, 'Notification opened app (Background):', notification);
    if (configRef.current.onNotificationOpenedApp) configRef.current.onNotificationOpenedApp(notification);
  }, []);

  const handleInitialNotification = useCallback((notification: NotificationPayload) => {
    Logger.debug(!!configRef.current.debug, 'Notification opened app (Quit):', notification);
    if (configRef.current.onInitialNotification) configRef.current.onInitialNotification(notification);
  }, []);

  const handleClick = useCallback((notification: NotificationPayload) => {
    Logger.debug(!!configRef.current.debug, 'Notification clicked:', notification);
    if (configRef.current.onClick) configRef.current.onClick(notification);
  }, []);

  const handleTokenRefresh = useCallback((token: string) => {
    setCurrentToken(token);
    if (configRef.current.onTokenRefresh) {
      configRef.current.onTokenRefresh(token);
    }
  }, []);

  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    async function init() {
      try {
        setIsInitializing(true);
        setError(null);
        await notifyZen.initialize({
          credentials,
          ...configRef.current,
          onTokenRefresh: handleTokenRefresh,
        });
        Logger.debug(!!configRef.current.debug, 'NotifyZen initialized successfully.');
      } catch (err: any) {
        setError(err.message);
        Logger.error('NotifyZen initialization error:', err.message);
      } finally {
        setIsInitializing(false);
      }
    }

    init();

    const unsubMessage = notifyZen.addListener('onMessage', handleMessage);
    const unsubClick = notifyZen.addListener('onClick', handleClick);
    const unsubOpened = notifyZen.addListener('onNotificationOpenedApp', handleNotificationOpenedApp);
    const unsubBackground = notifyZen.addListener('onBackgroundMessage', handleBackgroundMessage);
    const unsubInitial = notifyZen.addListener('onInitialNotification', handleInitialNotification);

    return () => {
      unsubMessage();
      unsubClick();
      unsubOpened();
      unsubBackground();
      unsubInitial();
    };
  }, [credentials, handleMessage, handleClick, handleTokenRefresh, handleNotificationOpenedApp, handleBackgroundMessage, handleInitialNotification]);

  useEffect(() => {
    const topics = config.topics;
    if (isInitializedRef.current && topics && !isInitializing) {
      notifyZen.subscribeToTopics(topics);
    }
  }, [JSON.stringify(config.topics), isInitializing]);

  return {
    currentToken,
    isInitializing,
    error,
    // Listener methods (Use these to subscribe manually)
    onNotification: (cb: (n: NotificationPayload) => void) => notifyZen.addListener('onMessage', cb),
    onBackgroundNotification: (cb: (n: NotificationPayload) => void) => notifyZen.addListener('onBackgroundMessage', cb),
    onNotificationOpenedApp: (cb: (n: NotificationPayload) => void) => notifyZen.addListener('onNotificationOpenedApp', cb),
    onInitialNotification: (cb: (n: NotificationPayload) => void) => notifyZen.addListener('onInitialNotification', cb),
    onNotificationClick: (cb: (n: NotificationPayload) => void) => notifyZen.addListener('onClick', cb),
    subscribeToTopics: (topics: Array<Topic>, unsubscribeTopics: string[] = []) =>
      notifyZen.subscribeToTopics(topics, unsubscribeTopics),
  };
}
