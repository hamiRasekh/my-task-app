import { create } from 'zustand';
import { SettingsRepository } from '../repositories/SettingsRepository';
import { AppSettings, NotificationSettings, DisplaySettings } from '../types/settings.types';

interface SettingsState {
  settings: AppSettings | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadSettings: () => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  updateDisplaySettings: (settings: Partial<DisplaySettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  loading: false,
  error: null,

  loadSettings: async () => {
    set({ loading: true, error: null });
    try {
      await SettingsRepository.initializeDefaultSettings();
      const settings = await SettingsRepository.getSettings();
      set({ settings, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateSettings: async (newSettings: Partial<AppSettings>) => {
    try {
      await SettingsRepository.updateSettings(newSettings);
      const settings = await SettingsRepository.getSettings();
      set({ settings });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateNotificationSettings: async (notificationSettings: Partial<NotificationSettings>) => {
    try {
      await SettingsRepository.updateNotificationSettings(notificationSettings);
      const settings = await SettingsRepository.getSettings();
      set({ settings });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateDisplaySettings: async (displaySettings: Partial<DisplaySettings>) => {
    try {
      await SettingsRepository.updateDisplaySettings(displaySettings);
      const settings = await SettingsRepository.getSettings();
      set({ settings });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
}));

