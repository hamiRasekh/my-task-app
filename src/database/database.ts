import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { Platform } from 'react-native';
import { schema } from './schema';
import Task from './models/Task';
import Category from './models/Category';
import Cigarette from './models/Cigarette';
import TaskCompletion from './models/TaskCompletion';
import Reward from './models/Reward';
import Settings from './models/Settings';
import { logger } from '../utils/logger';

// Create SQLite adapter for Expo with better error handling
// Disable JSI for stability, especially with New Architecture
let adapter: SQLiteAdapter | null = null;

try {
  logger.debug('Creating SQLite adapter...', { platform: Platform.OS, jsi: false });
  adapter = new SQLiteAdapter({
    schema,
    dbName: 'my_task_app',
    // Disable JSI for stability - it may cause issues with New Architecture
    jsi: false,
    onSetUpError: (error) => {
      logger.error('Database setup error', error as Error);
      // Don't throw - allow app to continue
      if (Platform.OS === 'web') {
        logger.warn('Database setup failed on web, continuing with limited functionality');
      } else {
        logger.warn('Database setup error on native, attempting to continue');
      }
    },
  });
  logger.info('SQLite adapter created successfully');
} catch (error) {
  logger.error('Error creating database adapter', error as Error);
  adapter = null;
}

// Create database instance (Singleton pattern) with error handling
// Initialize with comprehensive error handling to prevent app crashes
let databaseInstance: Database | null = null;

// Initialize database function - safe and won't crash app
const createDatabaseInstance = (): Database | null => {
  if (databaseInstance) {
    return databaseInstance;
  }

  if (!adapter) {
    logger.error('Adapter not available, cannot create database');
    return null;
  }

  try {
    logger.debug('Creating database instance...', {
      modelClasses: ['Task', 'Category', 'Cigarette', 'TaskCompletion', 'Reward', 'Settings'],
      platform: Platform.OS,
    });
    
    databaseInstance = new Database({
      adapter,
      modelClasses: [
        Task,
        Category,
        Cigarette,
        TaskCompletion,
        Reward,
        Settings,
      ],
    });
    
    logger.info('Database instance created successfully');
    return databaseInstance;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Fatal error creating database instance', error as Error, {
      errorMessage,
      platform: Platform.OS,
    });
    // Don't throw - return null and let app continue without database
    // The app should handle null database gracefully
    databaseInstance = null;
    return null;
  }
};

// Initialize database immediately but safely
// If it fails, databaseInstance will be null and app can continue
try {
  databaseInstance = createDatabaseInstance();
  if (!databaseInstance) {
    logger.warn('Database initialization returned null - app will continue without database');
  }
} catch (error) {
  logger.error('Error during database initialization', error as Error);
  databaseInstance = null;
}

// Export database - will be null if initialization failed
// All repositories should check for null database
export const database = databaseInstance;

// Helper function to check if database is available
export const isDatabaseReady = (): boolean => {
  return databaseInstance !== null && adapter !== null;
};

// Initialize database function for lazy initialization
export const initializeDatabase = async (): Promise<Database | null> => {
  if (databaseInstance) {
    return databaseInstance;
  }
  
  logger.debug('Lazy initializing database...');
  databaseInstance = createDatabaseInstance();
  return databaseInstance;
};

// Export models for easy access
export { Task, Category, Cigarette, TaskCompletion, Reward, Settings };
