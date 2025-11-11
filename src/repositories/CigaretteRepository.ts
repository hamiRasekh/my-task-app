import { database } from '../database/database';
import Cigarette from '../database/models/Cigarette';
import { DateService } from '../services/DateService';
import { logger } from '../utils/logger';

export interface CigaretteData {
  date: string;
  count: number;
  dailyLimit: number;
  timestamps?: number[];
}

export class CigaretteRepository {
  /**
   * Create or update cigarette record for a date
   */
  static async upsertCigarette(data: CigaretteData): Promise<Cigarette> {
    try {
      logger.debug('Upserting cigarette', { date: data.date, count: data.count });
      const existing = await this.getCigaretteByDate(data.date);

      if (existing) {
        return await database.write(async () => {
          return await existing.update((cigarette) => {
            cigarette.count = data.count;
            cigarette.dailyLimit = data.dailyLimit;
            cigarette.timestamps = data.timestamps || [];
            cigarette.updatedAt = Date.now();
          });
        });
      } else {
        return await database.write(async () => {
          return await database.get<Cigarette>('cigarettes').create((cigarette) => {
            cigarette.date = data.date;
            cigarette.count = data.count;
            cigarette.dailyLimit = data.dailyLimit;
            cigarette.timestamps = data.timestamps || [];
            cigarette.createdAt = Date.now();
            cigarette.updatedAt = Date.now();
          });
        });
      }
    } catch (error) {
      logger.error('Error upserting cigarette', error as Error, { date: data.date });
      throw error;
    }
  }

  /**
   * Get cigarette record for a specific date
   */
  static async getCigaretteByDate(date: string): Promise<Cigarette | null> {
    try {
      logger.debug('Getting cigarette by date', { date });
      const allCigarettes = await database.get<Cigarette>('cigarettes').query().fetch();
      const cigarette = allCigarettes.find((c) => c.date === date);
      if (cigarette) {
        logger.debug('Cigarette found', { cigaretteId: cigarette.id, count: cigarette.count });
      } else {
        logger.debug('Cigarette not found for date', { date });
      }
      return cigarette || null;
    } catch (error) {
      logger.error('Error getting cigarette by date', error as Error, { date });
      return null;
    }
  }

  /**
   * Get today's cigarette record
   */
  static async getTodayCigarette(): Promise<Cigarette | null> {
    try {
      const today = DateService.getToday();
      return await this.getCigaretteByDate(today);
    } catch (error) {
      logger.error('Error getting today cigarette', error as Error);
      return null;
    }
  }

  /**
   * Get or create today's cigarette record
   */
  static async getOrCreateTodayCigarette(dailyLimit: number = 10): Promise<Cigarette> {
    try {
      logger.debug('Getting or creating today cigarette', { dailyLimit });
      const today = DateService.getToday();
      const existing = await this.getCigaretteByDate(today);

      if (existing) {
        logger.debug('Today cigarette found', { count: existing.count, limit: existing.dailyLimit });
        return existing;
      }

      logger.debug('Creating new today cigarette record');
      const cigarette = await this.upsertCigarette({
        date: today,
        count: 0,
        dailyLimit,
        timestamps: [],
      });
      logger.info('Today cigarette created', { cigaretteId: cigarette.id });
      return cigarette;
    } catch (error) {
      logger.error('Error getting or creating today cigarette', error as Error);
      throw error;
    }
  }

  /**
   * Add a cigarette (increment count)
   */
  static async addCigarette(): Promise<Cigarette> {
    try {
      logger.debug('Adding cigarette');
      const today = await this.getOrCreateTodayCigarette();
      const newCount = today.count + 1;
      const newTimestamps = [...today.timestamps, Date.now()];

      return await database.write(async () => {
        return await today.update((cigarette) => {
          cigarette.count = newCount;
          cigarette.timestamps = newTimestamps;
          cigarette.updatedAt = Date.now();
        });
      });
    } catch (error) {
      logger.error('Error adding cigarette', error as Error);
      throw error;
    }
  }

  /**
   * Remove a cigarette (decrement count)
   */
  static async removeCigarette(): Promise<Cigarette> {
    try {
      logger.debug('Removing cigarette');
      const today = await this.getTodayCigarette();
      
      if (!today || today.count === 0) {
        throw new Error('No cigarettes to remove');
      }

      const newCount = Math.max(0, today.count - 1);
      const newTimestamps = today.timestamps.slice(0, -1);

      return await database.write(async () => {
        return await today.update((cigarette) => {
          cigarette.count = newCount;
          cigarette.timestamps = newTimestamps;
          cigarette.updatedAt = Date.now();
        });
      });
    } catch (error) {
      logger.error('Error removing cigarette', error as Error);
      throw error;
    }
  }

  /**
   * Set daily limit for today
   */
  static async setDailyLimit(limit: number): Promise<Cigarette> {
    try {
      logger.debug('Setting daily limit', { limit });
      const today = await this.getOrCreateTodayCigarette(limit);
      
      return await database.write(async () => {
        return await today.update((cigarette) => {
          cigarette.dailyLimit = limit;
          cigarette.updatedAt = Date.now();
        });
      });
    } catch (error) {
      logger.error('Error setting daily limit', error as Error, { limit });
      throw error;
    }
  }

  /**
   * Get cigarettes for a date range
   */
  static async getCigarettesByDateRange(startDate: string, endDate: string): Promise<Cigarette[]> {
    try {
      logger.debug('Fetching cigarettes by date range', { startDate, endDate });
      const allCigarettes = await database.get<Cigarette>('cigarettes').query().fetch();
      
      const filtered = allCigarettes.filter(
        (c) =>
          DateService.compareDates(c.date, startDate) >= 0 &&
          DateService.compareDates(c.date, endDate) <= 0
      );
      logger.debug('Cigarettes by date range fetched', { count: filtered.length });
      return filtered;
    } catch (error) {
      logger.error('Error fetching cigarettes by date range', error as Error, { startDate, endDate });
      return [];
    }
  }

  /**
   * Get all cigarettes
   */
  static async getAllCigarettes(): Promise<Cigarette[]> {
    try {
      logger.debug('Fetching all cigarettes');
      const cigarettes = await database.get<Cigarette>('cigarettes').query().fetch();
      logger.debug('Cigarettes fetched', { count: cigarettes.length });
      return cigarettes;
    } catch (error) {
      logger.error('Error fetching all cigarettes', error as Error);
      return [];
    }
  }

  /**
   * Delete cigarette record for a date
   */
  static async deleteCigarette(date: string): Promise<void> {
    try {
      logger.debug('Deleting cigarette', { date });
      const cigarette = await this.getCigaretteByDate(date);
      if (cigarette) {
        await database.write(async () => {
          await cigarette.markAsDeleted();
        });
        logger.info('Cigarette deleted', { date });
      }
    } catch (error) {
      logger.error('Error deleting cigarette', error as Error, { date });
      throw error;
    }
  }
}

