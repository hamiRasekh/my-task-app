/**
 * Comprehensive logging utility for debugging
 */

import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

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
  private logFilePath: string | null = null;

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
   * Initialize log file
   */
  private async initializeLogFile(): Promise<void> {
    if (this.logFilePath) return;
    
    try {
      if (Platform.OS !== 'web') {
        const logDir = `${FileSystem.documentDirectory}logs/`;
        const dirInfo = await FileSystem.getInfoAsync(logDir);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(logDir, { intermediates: true });
        }
        
        const fileName = `app-logs-${new Date().toISOString().split('T')[0]}.json`;
        this.logFilePath = `${logDir}${fileName}`;
      }
    } catch (error) {
      console.error('Error initializing log file:', error);
    }
  }

  /**
   * Write log to file
   */
  private async writeToFile(entry: LogEntry): Promise<void> {
    try {
      await this.initializeLogFile();
      if (!this.logFilePath || Platform.OS === 'web') return;

      const logLine = JSON.stringify(entry) + '\n';
      await FileSystem.appendAsStringAsync(this.logFilePath, logLine);
    } catch (error) {
      // Silently fail - don't break app if file writing fails
      console.error('Error writing to log file:', error);
    }
  }

  /**
   * Get log file path
   */
  async getLogFilePath(): Promise<string | null> {
    await this.initializeLogFile();
    return this.logFilePath;
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

    // Write to file asynchronously
    this.writeToFile(entry).catch(() => {
      // Silently fail
    });

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

