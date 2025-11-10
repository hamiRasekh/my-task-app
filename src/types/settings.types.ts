import { BaseEntity } from './common.types';

export interface Settings extends BaseEntity {
  key: string;
  value: string; // JSON string
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  dailySummary: boolean;
  taskReminders: boolean;
  deadlineReminders: boolean;
  cigaretteWarnings: boolean;
}

export interface DisplaySettings {
  sortBy: 'date' | 'priority' | 'name' | 'created';
  filterBy?: string;
  itemsPerPage: number;
  compactView: boolean;
  theme: 'dark' | 'light';
}

export interface AppSettings {
  notifications: NotificationSettings;
  display: DisplaySettings;
  language: 'fa' | 'en';
  defaultTaskPriority: 'low' | 'medium' | 'high';
  defaultCigaretteLimit: number;
}

