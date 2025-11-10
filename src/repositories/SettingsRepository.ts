import { database } from '../database/database';
import Settings from '../database/models/Settings';
import { AppSettings, NotificationSettings, DisplaySettings } from '../types/settings.types';
import { DEFAULT_TASK_PRIORITY, DEFAULT_CIGARETTE_LIMIT } from '../utils/constants';

export class SettingsRepository {
  private static readonly SETTINGS_KEY = 'app_settings';

  /**
   * Get app settings
   */
  static async getSettings(): Promise<AppSettings> {
    const settingsRecord = await this.getSettingsRecord();
    
    if (settingsRecord) {
      return settingsRecord.getValue<AppSettings>();
    }

    // Return default settings
    return this.getDefaultSettings();
  }

  /**
   * Update app settings
   */
  static async updateSettings(settings: Partial<AppSettings>): Promise<Settings> {
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
      const settings = await database
        .get<Settings>('settings')
        .query()
        .where('key', this.SETTINGS_KEY)
        .fetch();
      
      return settings.length > 0 ? settings[0] : null;
    } catch (error) {
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
    const existing = await this.getSettingsRecord();
    
    if (!existing) {
      const defaultSettings = this.getDefaultSettings();
      await database.write(async () => {
        await database.get<Settings>('settings').create((s) => {
          s.key = this.SETTINGS_KEY;
          s.setValue(defaultSettings);
          s.createdAt = Date.now();
          s.updatedAt = Date.now();
        });
      });
    }
  }
}

