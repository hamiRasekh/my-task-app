import { create } from 'zustand';
import { CigaretteRepository } from '../repositories/CigaretteRepository';
import Cigarette from '../database/models/Cigarette';
import { DateService } from '../services/DateService';
import { logger } from '../utils/logger';

interface CigaretteState {
  todayCigarette: Cigarette | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadTodayCigarette: () => Promise<void>;
  addCigarette: () => Promise<void>;
  removeCigarette: () => Promise<void>;
  setDailyLimit: (limit: number) => Promise<void>;
  refresh: () => Promise<void>;
}

export const useCigaretteStore = create<CigaretteState>((set, get) => ({
  todayCigarette: null,
  loading: false,
  error: null,

  loadTodayCigarette: async () => {
    set({ loading: true, error: null });
    try {
      logger.debug('Loading today cigarette from store');
      const today = await CigaretteRepository.getOrCreateTodayCigarette().catch((error) => {
        logger.error('Error loading today cigarette in store', error);
        throw error;
      });
      logger.debug('Today cigarette loaded', { count: today.count, limit: today.dailyLimit });
      set({ todayCigarette: today, loading: false });
    } catch (error: any) {
      logger.error('Error in loadTodayCigarette store action', error);
      set({ error: error?.message || 'خطا در بارگذاری داده سیگار', loading: false, todayCigarette: null });
    }
  },

  addCigarette: async () => {
    try {
      logger.debug('Adding cigarette from store');
      await CigaretteRepository.addCigarette();
      await get().loadTodayCigarette();
      logger.info('Cigarette added from store');
    } catch (error: any) {
      logger.error('Error adding cigarette from store', error);
      set({ error: error?.message || 'خطا در افزودن سیگار' });
      throw error;
    }
  },

  removeCigarette: async () => {
    try {
      logger.debug('Removing cigarette from store');
      await CigaretteRepository.removeCigarette();
      await get().loadTodayCigarette();
      logger.info('Cigarette removed from store');
    } catch (error: any) {
      logger.error('Error removing cigarette from store', error);
      set({ error: error?.message || 'خطا در حذف سیگار' });
      throw error;
    }
  },

  setDailyLimit: async (limit: number) => {
    try {
      logger.debug('Setting daily limit from store', { limit });
      await CigaretteRepository.setDailyLimit(limit);
      await get().loadTodayCigarette();
      logger.info('Daily limit set from store', { limit });
    } catch (error: any) {
      logger.error('Error setting daily limit from store', error, { limit });
      set({ error: error?.message || 'خطا در تنظیم حد مجاز' });
      throw error;
    }
  },

  refresh: async () => {
    await get().loadTodayCigarette();
  },
}));

