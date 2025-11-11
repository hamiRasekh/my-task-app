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
let adapterInitialized = false;

// Initialize adapter lazily - don't crash on import
const initializeAdapter = (): SQLiteAdapter | null => {
  if (adapter) {
    return adapter;
  }
  
  if (adapterInitialized) {
    return null; // Already tried and failed
  }
  
  adapterInitialized = true;
  
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
    return adapter;
  } catch (error) {
    logger.error('Error creating database adapter', error as Error);
    adapter = null;
    return null;
  }
};

// Create database instance (Singleton pattern) with error handling
// Initialize lazily to prevent app crashes on startup
let databaseInstance: Database | null = null;
let databaseInitialized = false;

// Initialize database function - safe and won't crash app
const createDatabaseInstance = (): Database | null => {
  if (databaseInstance) {
    return databaseInstance;
  }

  if (databaseInitialized && !databaseInstance) {
    return null; // Already tried and failed
  }

  databaseInitialized = true;

  const dbAdapter = initializeAdapter();
  if (!dbAdapter) {
    logger.error('Adapter not available, cannot create database');
    return null;
  }

  try {
    logger.debug('Creating database instance...', {
      modelClasses: ['Task', 'Category', 'Cigarette', 'TaskCompletion', 'Reward', 'Settings'],
      platform: Platform.OS,
    });
    
    databaseInstance = new Database({
      adapter: dbAdapter,
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
    databaseInstance = null;
    return null;
  }
};

// Export database with lazy initialization - don't initialize on import
// This prevents crashes during module loading
// Use a safe proxy that handles errors gracefully
export const database: Database = new Proxy({} as Database, {
  get(target, prop) {
    try {
      if (!databaseInstance) {
        // Lazy initialize on first access
        databaseInstance = createDatabaseInstance();
        if (!databaseInstance) {
          // If initialization failed, return a safe fallback
          logger.error('Database access attempted but not available');
          // Return a mock object that throws on use but doesn't crash on access
          return () => {
            throw new Error('Database is not available. Please check logs for details.');
          };
        }
      }
      const value = databaseInstance[prop as keyof Database];
      if (typeof value === 'function') {
        return value.bind(databaseInstance);
      }
      return value;
    } catch (error) {
      logger.error('Error accessing database property', error as Error, { property: String(prop) });
      // Return a safe fallback function
      return () => {
        throw new Error('Database is not available');
      };
    }
  },
  set(target, prop, value) {
    try {
      if (!databaseInstance) {
        databaseInstance = createDatabaseInstance();
        if (!databaseInstance) {
          logger.error('Cannot set database property - database not available');
          return false;
        }
      }
      (databaseInstance as any)[prop] = value;
      return true;
    } catch (error) {
      logger.error('Error setting database property', error as Error);
      return false;
    }
  },
}) as Database;

// Helper function to check if database is available
export const isDatabaseReady = (): boolean => {
  if (!databaseInstance) {
    // Try to initialize
    databaseInstance = createDatabaseInstance();
  }
  return databaseInstance !== null && adapter !== null;
};

// Initialize database function for explicit initialization
export const initializeDatabase = async (): Promise<Database | null> => {
  if (databaseInstance) {
    return databaseInstance;
  }
  
  logger.debug('Explicitly initializing database...');
  databaseInstance = createDatabaseInstance();
  return databaseInstance;
};

// Export models for easy access
export { Task, Category, Cigarette, TaskCompletion, Reward, Settings };
