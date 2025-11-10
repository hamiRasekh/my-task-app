import { database } from '../database/database';
import Cigarette from '../database/models/Cigarette';
import { DateService } from '../services/DateService';

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
  }

  /**
   * Get cigarette record for a specific date
   */
  static async getCigaretteByDate(date: string): Promise<Cigarette | null> {
    try {
      const allCigarettes = await database.get<Cigarette>('cigarettes').query().fetch();
      const cigarette = allCigarettes.find((c) => c.date === date);
      return cigarette || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get today's cigarette record
   */
  static async getTodayCigarette(): Promise<Cigarette | null> {
    const today = DateService.getToday();
    return await this.getCigaretteByDate(today);
  }

  /**
   * Get or create today's cigarette record
   */
  static async getOrCreateTodayCigarette(dailyLimit: number = 10): Promise<Cigarette> {
    const today = DateService.getToday();
    const existing = await this.getCigaretteByDate(today);

    if (existing) {
      return existing;
    }

    return await this.upsertCigarette({
      date: today,
      count: 0,
      dailyLimit,
      timestamps: [],
    });
  }

  /**
   * Add a cigarette (increment count)
   */
  static async addCigarette(): Promise<Cigarette> {
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
  }

  /**
   * Remove a cigarette (decrement count)
   */
  static async removeCigarette(): Promise<Cigarette> {
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
  }

  /**
   * Set daily limit for today
   */
  static async setDailyLimit(limit: number): Promise<Cigarette> {
    const today = await this.getOrCreateTodayCigarette(limit);
    
    return await database.write(async () => {
      return await today.update((cigarette) => {
        cigarette.dailyLimit = limit;
        cigarette.updatedAt = Date.now();
      });
    });
  }

  /**
   * Get cigarettes for a date range
   */
  static async getCigarettesByDateRange(startDate: string, endDate: string): Promise<Cigarette[]> {
    const allCigarettes = await database.get<Cigarette>('cigarettes').query().fetch();
    
    return allCigarettes.filter(
      (c) =>
        DateService.compareDates(c.date, startDate) >= 0 &&
        DateService.compareDates(c.date, endDate) <= 0
    );
  }

  /**
   * Get all cigarettes
   */
  static async getAllCigarettes(): Promise<Cigarette[]> {
    return await database.get<Cigarette>('cigarettes').query().fetch();
  }

  /**
   * Delete cigarette record for a date
   */
  static async deleteCigarette(date: string): Promise<void> {
    const cigarette = await this.getCigaretteByDate(date);
    if (cigarette) {
      await database.write(async () => {
        await cigarette.markAsDeleted();
      });
    }
  }
}

