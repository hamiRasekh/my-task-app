/**
 * Comprehensive logging utility for debugging
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  data?: any;
  stack?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private isDebugMode = true; // Always enable debug mode for comprehensive logging

  /**
   * Log a debug message
   */
  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Log an info message
   */
  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Log a warning message
   */
  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Log an error message
   */
  error(message: string, error?: Error | any, data?: any): void {
    const stack = error instanceof Error ? error.stack : undefined;
    const errorData = error instanceof Error ? { message: error.message, name: error.name } : error;
    this.log(LogLevel.ERROR, message, { ...data, error: errorData, stack });
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      data,
      stack: level === LogLevel.ERROR ? new Error().stack : undefined,
    };

    // Add to logs array
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Always log to console for comprehensive debugging
    const logMessage = `[${level}] ${message}`;
    const logData = data ? { data, timestamp: new Date(entry.timestamp).toISOString() } : { timestamp: new Date(entry.timestamp).toISOString() };

    switch (level) {
      case LogLevel.DEBUG:
        console.log(logMessage, logData);
        break;
      case LogLevel.INFO:
        console.info(logMessage, logData);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, logData);
        break;
      case LogLevel.ERROR:
        console.error(logMessage, logData);
        if (entry.stack) {
          console.error('Stack:', entry.stack);
        }
        break;
    }
  }

  /**
   * Get all logs
   */
  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter((log) => log.level === level);
    }
    return [...this.logs];
  }

  /**
   * Get recent logs
   */
  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logs.slice(-count);
  }

  /**
   * Get error logs only
   */
  getErrors(): LogEntry[] {
    return this.logs.filter((log) => log.level === LogLevel.ERROR);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Enable debug mode
   */
  enableDebugMode(): void {
    this.isDebugMode = true;
  }

  /**
   * Disable debug mode
   */
  disableDebugMode(): void {
    this.isDebugMode = false;
  }

  /**
   * Check if debug mode is enabled
   */
  isDebugEnabled(): boolean {
    return this.isDebugMode;
  }
}

// Export singleton instance
export const logger = new Logger();

// Note: Global error handler is now in index.ts to catch errors earlier in the app lifecycle

