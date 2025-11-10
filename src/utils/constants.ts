// Application constants

export const APP_NAME = 'مدیریت کار و ردیابی سیگار';

export const DATE_FORMAT = 'YYYY/MM/DD';
export const TIME_FORMAT = 'HH:mm';

export const DEFAULT_CIGARETTE_LIMIT = 10;
export const DEFAULT_TASK_PRIORITY = 'medium' as const;

export const NOTIFICATION_CHANNELS = {
  TASK_REMINDER: 'task-reminder',
  DEADLINE_REMINDER: 'deadline-reminder',
  DAILY_SUMMARY: 'daily-summary',
  CIGARETTE_WARNING: 'cigarette-warning',
};

export const STORAGE_KEYS = {
  SETTINGS: 'app_settings',
  LAST_BACKUP: 'last_backup',
};

export const PRIORITY_WEIGHTS = {
  low: 1,
  medium: 2,
  high: 3,
};

export const REWARD_POINTS = {
  taskCompleted: 10,
  taskOverdue: -5,
  streakBonus: 5,
  underCigaretteLimit: 10,
  overCigaretteLimit: -5,
};

