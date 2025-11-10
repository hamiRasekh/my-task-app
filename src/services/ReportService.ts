import { DateService } from './DateService';
import { Task } from '../database/models/Task';
import { Cigarette } from '../database/models/Cigarette';
import { TaskCompletion } from '../database/models/TaskCompletion';
import { database } from '../database/database';
import { CigaretteReport, CigaretteStats } from '../types/cigarette.types';

export class ReportService {
  /**
   * Get task completion statistics for a date range
   */
  static async getTaskStats(startDate: string, endDate: string): Promise<{
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    completionRate: number;
  }> {
    const tasks = await database
      .get<Task>('tasks')
      .query()
      .fetch();

    const filteredTasks = tasks.filter(
      (task) =>
        DateService.compareDates(task.scheduledDate, startDate) >= 0 &&
        DateService.compareDates(task.scheduledDate, endDate) <= 0
    );

    const total = filteredTasks.length;
    const completed = filteredTasks.filter((t) => t.isCompleted).length;
    const pending = filteredTasks.filter((t) => !t.isCompleted && !DateService.isPast(t.scheduledDate)).length;
    const overdue = filteredTasks.filter((t) => !t.isCompleted && DateService.isPast(t.scheduledDate)).length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      completed,
      pending,
      overdue,
      completionRate: Math.round(completionRate),
    };
  }

  /**
   * Get task completions by category
   */
  static async getTaskStatsByCategory(startDate: string, endDate: string): Promise<Map<string, {
    total: number;
    completed: number;
    completionRate: number;
  }>> {
    const tasks = await database
      .get<Task>('tasks')
      .query()
      .fetch();

    const filteredTasks = tasks.filter(
      (task) =>
        DateService.compareDates(task.scheduledDate, startDate) >= 0 &&
        DateService.compareDates(task.scheduledDate, endDate) <= 0
    );

    const statsByCategory = new Map<string, { total: number; completed: number; completionRate: number }>();

    filteredTasks.forEach((task) => {
      const categoryId = task.categoryId || 'بدون دسته';
      const current = statsByCategory.get(categoryId) || { total: 0, completed: 0, completionRate: 0 };
      current.total++;
      if (task.isCompleted) {
        current.completed++;
      }
      current.completionRate = current.total > 0 ? (current.completed / current.total) * 100 : 0;
      statsByCategory.set(categoryId, current);
    });

    return statsByCategory;
  }

  /**
   * Get daily task completion for a date range
   */
  static async getDailyTaskCompletion(startDate: string, endDate: string): Promise<Map<string, {
    total: number;
    completed: number;
  }>> {
    const tasks = await database
      .get<Task>('tasks')
      .query()
      .fetch();

    const dailyStats = new Map<string, { total: number; completed: number }>();

    let currentDate = startDate;
    while (DateService.compareDates(currentDate, endDate) <= 0) {
      const dayTasks = tasks.filter((task) => task.scheduledDate === currentDate);
      dailyStats.set(currentDate, {
        total: dayTasks.length,
        completed: dayTasks.filter((t) => t.isCompleted).length,
      });
      currentDate = DateService.addDays(currentDate, 1);
    }

    return dailyStats;
  }

  /**
   * Get cigarette statistics
   */
  static async getCigaretteStats(startDate: string, endDate: string): Promise<CigaretteStats> {
    const cigarettes = await database
      .get<Cigarette>('cigarettes')
      .query()
      .fetch();

    const filteredCigarettes = cigarettes.filter(
      (c) =>
        DateService.compareDates(c.date, startDate) >= 0 &&
        DateService.compareDates(c.date, endDate) <= 0
    );

    const today = DateService.getToday();
    const todayData = filteredCigarettes.find((c) => c.date === today);

    // Calculate weekly average (last 7 days)
    const weekStart = DateService.addDays(today, -6);
    const weekData = filteredCigarettes.filter(
      (c) => DateService.compareDates(c.date, weekStart) >= 0 && DateService.compareDates(c.date, today) <= 0
    );

    // Calculate monthly data
    const { start: monthStart } = DateService.getCurrentMonthRange();
    const monthData = filteredCigarettes.filter(
      (c) => DateService.compareDates(c.date, monthStart) >= 0 && DateService.compareDates(c.date, today) <= 0
    );

    const counts = filteredCigarettes.map((c) => c.count);
    const average = counts.length > 0 ? counts.reduce((a, b) => a + b, 0) / counts.length : 0;
    const max = counts.length > 0 ? Math.max(...counts) : 0;
    const min = counts.length > 0 ? Math.min(...counts) : 0;

    // Calculate streak (consecutive days under limit)
    let streak = 0;
    let checkDate = today;
    while (true) {
      const dayData = filteredCigarettes.find((c) => c.date === checkDate);
      if (!dayData || dayData.count > dayData.dailyLimit) {
        break;
      }
      streak++;
      checkDate = DateService.addDays(checkDate, -1);
      if (DateService.compareDates(checkDate, startDate) < 0) {
        break;
      }
    }

    const todayCount = todayData?.count || 0;
    const todayLimit = todayData?.dailyLimit || 10;
    const percentage = todayLimit > 0 ? (todayCount / todayLimit) * 100 : 0;

    return {
      today: todayCount,
      weekly: weekData.reduce((sum, c) => sum + c.count, 0),
      monthly: monthData.reduce((sum, c) => sum + c.count, 0),
      average: Math.round(average),
      max,
      min,
      streak,
      percentage: Math.round(percentage),
    };
  }

  /**
   * Get cigarette reports for a date range
   */
  static async getCigaretteReports(startDate: string, endDate: string): Promise<CigaretteReport[]> {
    const cigarettes = await database
      .get<Cigarette>('cigarettes')
      .query()
      .fetch();

    const filteredCigarettes = cigarettes.filter(
      (c) =>
        DateService.compareDates(c.date, startDate) >= 0 &&
        DateService.compareDates(c.date, endDate) <= 0
    );

    return filteredCigarettes.map((c) => ({
      date: c.date,
      count: c.count,
      limit: c.dailyLimit,
      percentage: c.dailyLimit > 0 ? Math.round((c.count / c.dailyLimit) * 100) : 0,
    }));
  }

  /**
   * Get monthly cigarette consumption
   */
  static async getMonthlyCigaretteConsumption(year: number, month: number): Promise<CigaretteReport[]> {
    const { start, end } = DateService.getMonthRange(year, month);
    return await this.getCigaretteReports(start, end);
  }
}

