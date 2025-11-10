import { create } from 'zustand';
import { CigaretteRepository } from '../repositories/CigaretteRepository';
import Cigarette from '../database/models/Cigarette';
import { DateService } from '../services/DateService';

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
      const today = await CigaretteRepository.getOrCreateTodayCigarette();
      set({ todayCigarette: today, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addCigarette: async () => {
    try {
      await CigaretteRepository.addCigarette();
      await get().loadTodayCigarette();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  removeCigarette: async () => {
    try {
      await CigaretteRepository.removeCigarette();
      await get().loadTodayCigarette();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  setDailyLimit: async (limit: number) => {
    try {
      await CigaretteRepository.setDailyLimit(limit);
      await get().loadTodayCigarette();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  refresh: async () => {
    await get().loadTodayCigarette();
  },
}));

