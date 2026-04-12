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
    const isWeb = platform === NOTIFYZEN_CONSTANTS.PLATFORM.WEB;
    const endpoint = isWeb ? this.endpoints.WEB.SUBSCRIBE : this.endpoints.MOBILE.SUBSCRIBE;
    const url = `${this.endpoints.BASE_URL}${endpoint}`;
    
    Logger.debug(debug, `API Call: Subscribing & Syncing at ${url}`);
    Logger.debug(debug, 'Payload:', JSON.stringify(payload, null, 2));

    try {
      // In a real implementation, this would be a fetch call:
      // await fetch(url, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
      await new Promise((resolve) => setTimeout(resolve, 800));
      Logger.debug(debug, 'API Success: Subscription & Token sync successful.');
    } catch (err: any) {
      Logger.error(`API Error: Subscription failed at ${url}`, err.message);
      throw err;
    }
  }

  /**
   * Acknowledge that a notification was received/clicked.
   */
  public static async receive(platform: 'ios' | 'android' | 'web', payload: any, debug: boolean = false): Promise<void> {
    const isWeb = platform === NOTIFYZEN_CONSTANTS.PLATFORM.WEB;
    const endpoint = isWeb ? this.endpoints.WEB.RECEIVE : this.endpoints.MOBILE.RECEIVE;
    const url = `${this.endpoints.BASE_URL}${endpoint}`;

    Logger.debug(debug, `API Call: Reporting notification reception at ${url}`);
    Logger.debug(debug, 'Payload:', JSON.stringify(payload, null, 2));

    try {
      // In a real implementation:
      // await fetch(url, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
      await new Promise((resolve) => setTimeout(resolve, 400));
      Logger.debug(debug, 'API Success: Notification reception acknowledged.');
    } catch (err: any) {
      Logger.error(`API Error: Failed to report reception at ${url}`, err.message);
      throw err;
    }
  }
}
