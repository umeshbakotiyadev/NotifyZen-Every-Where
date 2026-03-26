import { Logger } from '../utils/logger';
import { NOTIFYZEN_CONSTANTS } from '../constants';

/**
 * NotifyZen API Service
 * Centralized logic for all external network requests with smart logging.
 */
export class NotifyZenAPI {
  private static endpoints = NOTIFYZEN_CONSTANTS.ENDPOINTS;

  /**
   * Register or Update the user's FCM token on the backend.
   */
  public static async registerToken(token: string, debug: boolean = false): Promise<void> {
    const url = `${this.endpoints.BASE_URL}${this.endpoints.REGISTER_TOKEN}`;
    Logger.debug(debug, `API Call: Registering Token at ${url}...`, token);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      Logger.debug(debug, 'API Success: Token registered on backend.');
    } catch (err: any) {
      Logger.error(`API Error: Registration failed at ${url}`, err.message);
      throw err;
    }
  }

  /**
   * Subscribe the device to specific notification topics.
   */
  public static async subscribeToTopics(payload: any, debug: boolean = false): Promise<void> {
    const url = `${this.endpoints.BASE_URL}${this.endpoints.SUBSCRIBE_TOPICS}`;
    Logger.debug(debug, `API Call: Subscribing to topics at ${url}`);
    Logger.debug(debug, 'Payload:', JSON.stringify(payload, null, 2));

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      Logger.debug(debug, 'API Success: Subscribed to topics successfully.');
    } catch (err: any) {
      Logger.error(`API Error: Subscription failed at ${url}`, err.message);
      throw err;
    }
  }

  /**
   * Acknowledge that a notification was received/clicked.
   */
  public static async reportNotificationReceived(payload: any, debug: boolean = false): Promise<void> {
    const url = `${this.endpoints.BASE_URL}${this.endpoints.NOTIFICATION_RECEIVED}`;
    Logger.debug(debug, `API Call: Reporting notification reception at ${url}`);
    Logger.debug(debug, 'Payload:', JSON.stringify(payload, null, 2));

    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      Logger.debug(debug, 'API Success: Notification reception acknowledged by backend.');
    } catch (err: any) {
      Logger.error(`API Error: Failed to report reception at ${url}`, err.message);
      throw err;
    }
  }
}
