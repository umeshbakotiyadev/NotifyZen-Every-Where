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
    Logger.debug(!!configRef.current.debug, 'Notification received:', notification.title);
  }, []);

  const handleClick = useCallback((notification: NotificationPayload) => {
    Logger.debug(!!configRef.current.debug, 'Notification clicked:', notification.title);
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

    return () => {
      unsubMessage();
      unsubClick();
    };
  }, [credentials, handleMessage, handleClick, handleTokenRefresh]);

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
    onNotificationClick: (cb: (n: NotificationPayload) => void) => notifyZen.addListener('onClick', cb),
    subscribeToTopics: (topics: Array<Topic>, unsubscribeTopics: string[] = []) =>
      notifyZen.subscribeToTopics(topics, unsubscribeTopics),
  };
}
