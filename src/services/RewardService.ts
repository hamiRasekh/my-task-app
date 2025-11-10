import { REWARD_POINTS } from '../utils/constants';
import { DateService } from './DateService';
import { Reward } from '../database/models/Reward';
import { database } from '../database/database';
import { RewardType } from '../types/common.types';

export class RewardService {
  /**
   * Calculate reward points for completing a task
   */
  static calculateTaskReward(
    taskCompleted: boolean,
    isOverdue: boolean,
    rewardPoints: number,
    penaltyPoints: number
  ): number {
    if (taskCompleted) {
      return rewardPoints;
    } else if (isOverdue) {
      return -penaltyPoints;
    }
    return 0;
  }

  /**
   * Calculate streak bonus
   */
  static calculateStreakBonus(streakDays: number): number {
    if (streakDays >= 7) {
      return REWARD_POINTS.streakBonus * Math.floor(streakDays / 7);
    }
    return 0;
  }

  /**
   * Calculate cigarette reward/penalty
   */
  static calculateCigaretteReward(
    count: number,
    limit: number
  ): number {
    if (count <= limit) {
      return REWARD_POINTS.underCigaretteLimit;
    } else {
      return REWARD_POINTS.overCigaretteLimit;
    }
  }

  /**
   * Create a reward record
   */
  static async createReward(
    taskId: string | null,
    points: number,
    type: RewardType,
    date: string
  ): Promise<Reward> {
    return await database.write(async () => {
      return await database.get<Reward>('rewards').create((reward) => {
        reward.taskId = taskId || undefined;
        reward.points = points;
        reward.type = type;
        reward.date = date;
        reward.createdAt = Date.now();
        reward.updatedAt = Date.now();
      });
    });
  }

  /**
   * Get total points for a date range
   */
  static async getTotalPoints(startDate: string, endDate: string): Promise<number> {
    const rewards = await database
      .get<Reward>('rewards')
      .query(
        database.collections.get('rewards').query()
          .where('date', '>=', startDate)
          .where('date', '<=', endDate)
      )
      .fetch();

    return rewards.reduce((total, reward) => total + reward.points, 0);
  }

  /**
   * Get points breakdown by type
   */
  static async getPointsBreakdown(startDate: string, endDate: string): Promise<{
    rewards: number;
    penalties: number;
    total: number;
  }> {
    const rewards = await database
      .get<Reward>('rewards')
      .query(
        database.collections.get('rewards').query()
          .where('date', '>=', startDate)
          .where('date', '<=', endDate)
      )
      .fetch();

    let rewardsTotal = 0;
    let penaltiesTotal = 0;

    rewards.forEach((reward) => {
      if (reward.type === 'reward') {
        rewardsTotal += reward.points;
      } else {
        penaltiesTotal += Math.abs(reward.points);
      }
    });

    return {
      rewards: rewardsTotal,
      penalties: penaltiesTotal,
      total: rewardsTotal - penaltiesTotal,
    };
  }

  /**
   * Get today's points
   */
  static async getTodayPoints(): Promise<number> {
    const today = DateService.getToday();
    return await this.getTotalPoints(today, today);
  }

  /**
   * Get this month's points
   */
  static async getMonthPoints(): Promise<number> {
    const { start, end } = DateService.getCurrentMonthRange();
    return await this.getTotalPoints(start, end);
  }
}

