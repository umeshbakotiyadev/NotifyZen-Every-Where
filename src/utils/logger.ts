import { NOTIFYZEN_CONSTANTS } from '../constants';

/**
 * Smart Logger for NotifyZen Every Where.
 * Automatically silences logs in production environments unless forced.
 */

const isProd = typeof process !== 'undefined' && process.env?.NODE_ENV === 'production';

export class Logger {
  private static prefix = NOTIFYZEN_CONSTANTS.LOGGER_PREFIX;

  public static log(message: string, ...args: any[]): void {
    if (isProd) return;
    console.log(`${this.prefix} ${message}`, ...args);
  }

  public static warn(message: string, ...args: any[]): void {
    if (isProd) return;
    console.warn(`${this.prefix} ${message}`, ...args);
  }

  public static error(message: string, ...args: any[]): void {
    if (isProd) return;
    console.error(`${this.prefix} ${message}`, ...args);
  }

  public static debug(debugFlag: boolean, message: string, ...args: any[]): void {
    if (isProd || !debugFlag) return;
    console.log(`${this.prefix} [Debug] ${message}`, ...args);
  }

  public static guidance(message: string): void {
    if (isProd) return;
    console.log(
      `\n%c${this.prefix} Guidance%c\n${message}\n`, 
      NOTIFYZEN_CONSTANTS.LOGGER_GUIDANCE_STYLE, 
      'font-weight: normal; color: inherit;'
    );
  }
}
