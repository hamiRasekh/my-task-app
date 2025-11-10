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

// Create SQLite adapter for Expo
// For web, JSI is not available, so we disable it
const adapter = new SQLiteAdapter({
  schema,
  dbName: 'my_task_app',
  // Use JSI for better performance (works on both iOS and Android with Expo, but not on web)
  jsi: Platform.OS !== 'web',
  onSetUpError: (error) => {
    console.error('Database setup error:', error);
    // On web, this might fail, but we'll try to continue
    if (Platform.OS === 'web') {
      console.warn('Database setup failed on web, continuing with limited functionality');
    }
  },
});

// Create database instance (Singleton pattern)
export const database = new Database({
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

// Export models for easy access
export { Task, Category, Cigarette, TaskCompletion, Reward, Settings };

