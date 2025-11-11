import { database } from '../database/database';
import Settings from '../database/models/Settings';
import { AppSettings, NotificationSettings, DisplaySettings } from '../types/settings.types';
import { DEFAULT_TASK_PRIORITY, DEFAULT_CIGARETTE_LIMIT } from '../utils/constants';
import { logger } from '../utils/logger';

export class SettingsRepository {
  private static readonly SETTINGS_KEY = 'app_settings';

  /**
   * Get app settings
   */
  static async getSettings(): Promise<AppSettings> {
    try {
      if (!database) {
        logger.warn('Database not available, returning default settings');
        return this.getDefaultSettings();
      }
      
      const settingsRecord = await this.getSettingsRecord();
      
      if (settingsRecord) {
        return settingsRecord.getValue<AppSettings>();
      }

      // Return default settings
      return this.getDefaultSettings();
    } catch (error) {
      logger.error('Error getting settings', error as Error);
      return this.getDefaultSettings();
    }
  }

  /**
   * Update app settings
   */
  static async updateSettings(settings: Partial<AppSettings>): Promise<Settings> {
    try {
      if (!database) {
        logger.warn('Database not available, cannot update settings');
        throw new Error('Database is not available');
      }
      
      const currentSettings = await this.getSettings();
      const newSettings: AppSettings = {
        ...currentSettings,
        ...settings,
        notifications: {
          ...currentSettings.notifications,
          ...settings.notifications,
        },
        display: {
          ...currentSettings.display,
          ...settings.display,
        },
      };

      return await database.write(async () => {
        const existing = await this.getSettingsRecord();
        
        if (existing) {
          return await existing.update((s) => {
            s.setValue(newSettings);
            s.updatedAt = Date.now();
          });
        } else {
          return await database.get<Settings>('settings').create((s) => {
            s.key = this.SETTINGS_KEY;
            s.setValue(newSettings);
            s.createdAt = Date.now();
            s.updatedAt = Date.now();
          });
        }
      });
    } catch (error) {
      logger.error('Error updating settings', error as Error);
      throw error;
    }
  }

  /**
   * Get notification settings
   */
  static async getNotificationSettings(): Promise<NotificationSettings> {
    const settings = await this.getSettings();
    return settings.notifications;
  }

  /**
   * Update notification settings
   */
  static async updateNotificationSettings(
    notificationSettings: Partial<NotificationSettings>
  ): Promise<Settings> {
    const currentSettings = await this.getSettings();
    return await this.updateSettings({
      notifications: {
        ...currentSettings.notifications,
        ...notificationSettings,
      },
    });
  }

  /**
   * Get display settings
   */
  static async getDisplaySettings(): Promise<DisplaySettings> {
    const settings = await this.getSettings();
    return settings.display;
  }

  /**
   * Update display settings
   */
  static async updateDisplaySettings(
    displaySettings: Partial<DisplaySettings>
  ): Promise<Settings> {
    const currentSettings = await this.getSettings();
    return await this.updateSettings({
      display: {
        ...currentSettings.display,
        ...displaySettings,
      },
    });
  }

  /**
   * Get settings record from database
   */
  private static async getSettingsRecord(): Promise<Settings | null> {
    try {
      if (!database) {
        logger.warn('Database not available, cannot get settings record');
        return null;
      }
      
      const settings = await database
        .get<Settings>('settings')
        .query()
        .where('key', this.SETTINGS_KEY)
        .fetch();
      
      return settings.length > 0 ? settings[0] : null;
    } catch (error) {
      logger.error('Error getting settings record', error as Error);
      return null;
    }
  }

  /**
   * Get default settings
   */
  private static getDefaultSettings(): AppSettings {
    return {
      notifications: {
        enabled: true,
        sound: true,
        vibration: true,
        dailySummary: true,
        taskReminders: true,
        deadlineReminders: true,
        cigaretteWarnings: true,
      },
      display: {
        sortBy: 'date',
        itemsPerPage: 20,
        compactView: false,
        theme: 'dark',
      },
      language: 'fa',
      defaultTaskPriority: DEFAULT_TASK_PRIORITY,
      defaultCigaretteLimit: DEFAULT_CIGARETTE_LIMIT,
    };
  }

  /**
   * Initialize default settings
   */
  static async initializeDefaultSettings(): Promise<void> {
    try {
      if (!database) {
        logger.warn('Database not available, skipping settings initialization');
        return;
      }
      
      logger.debug('Initializing default settings');
      const existing = await this.getSettingsRecord().catch(() => null);
      
      if (!existing) {
        logger.info('Creating default settings');
        const defaultSettings = this.getDefaultSettings();
        
        if (!database) {
          logger.warn('Database not available during settings creation');
          return;
        }
        
        await database.write(async () => {
          try {
            await database.get<Settings>('settings').create((s) => {
              s.key = this.SETTINGS_KEY;
              s.setValue(defaultSettings);
              s.createdAt = Date.now();
              s.updatedAt = Date.now();
            });
            logger.info('Default settings created successfully');
          } catch (error) {
            logger.warn('Error creating default settings', error as Error);
            // Don't throw - settings will use defaults
          }
        });
      } else {
        logger.debug('Settings already initialized');
      }
    } catch (error) {
      logger.error('Error initializing default settings', error as Error);
      // Don't throw - allow app to continue with default settings
    }
  }
}

