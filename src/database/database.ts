import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import Task from './models/Task';
import Category from './models/Category';
import Cigarette from './models/Cigarette';
import TaskCompletion from './models/TaskCompletion';
import Reward from './models/Reward';
import Settings from './models/Settings';

// Create SQLite adapter for Expo
const adapter = new SQLiteAdapter({
  schema,
  dbName: 'my_task_app',
  // Use JSI for better performance (works on both iOS and Android with Expo)
  jsi: true,
  onSetUpError: (error) => {
    console.error('Database setup error:', error);
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

