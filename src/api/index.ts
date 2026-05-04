import { Logger } from '../utils/logger';
import { NOTIFYZEN_CONSTANTS } from '../constants';

/**
 * NotifyZen API Service
 * Centralized logic for all external network requests with smart logging.
 */
export class NotifyZenAPI {
  private static endpoints = NOTIFYZEN_CONSTANTS.ENDPOINTS;

  /**
   * Subscribe the device to specific notification topics and register/refresh FCM token.
   */
  public static async subscribe(platform: 'ios' | 'android' | 'web', payload: any, debug: boolean = false): Promise<void> {
    if (!payload.secret_key) {
      Logger.error('Missing secretKey: Subscription aborted. Please provide a valid secretKey in configuration.');
      return;
    }

    const isWeb = platform === NOTIFYZEN_CONSTANTS.PLATFORM.WEB;
    const endpoint = isWeb ? this.endpoints.WEB.SUBSCRIBE : this.endpoints.MOBILE.SUBSCRIBE;
    const url = `${this.endpoints.BASE_URL}${endpoint}`;

    Logger.debug(debug, `API Call: Subscribing & Syncing at ${url}`);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        const errorMsg = result.message || `HTTP ${response.status}: ${response.statusText}`;
        Logger.error(`API Error: ${errorMsg}`);
        return;
      }

      Logger.debug(debug, 'API Success: Subscription & Topic sync successful.');
    } catch (err: any) {
      Logger.error(`API Exception at ${url}:`, err.message);
    }
  }

  /**
   * Acknowledge that a notification was received/clicked.
   */
  public static async receive(platform: 'ios' | 'android' | 'web', payload: any, debug: boolean = false): Promise<void> {
    if (!payload.secrate_key) {
      Logger.error('Missing secretKey: Notification reporting aborted.');
      return;
    }

    const isWeb = platform === NOTIFYZEN_CONSTANTS.PLATFORM.WEB;
    const endpoint = isWeb ? this.endpoints.WEB.RECEIVE : this.endpoints.MOBILE.RECEIVE;
    const url = `${this.endpoints.BASE_URL}${endpoint}`;

    Logger.debug(debug, `API Call: Reporting interaction at ${url}`);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        const errorMsg = result.message || `HTTP ${response.status}: ${response.statusText}`;
        Logger.error(`API Error: ${errorMsg}`);
        return;
      }

      Logger.debug(debug, 'API Success: Interaction logged successfully.');
    } catch (err: any) {
      Logger.error(`API Exception at ${url}:`, err.message);
    }
  }
}
