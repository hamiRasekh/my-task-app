import * as FileSystem from 'expo-file-system';
import { database } from '../database/database';
import { Task } from '../database/models/Task';
import { Category } from '../database/models/Category';
import { Cigarette } from '../database/models/Cigarette';
import { TaskCompletion } from '../database/models/TaskCompletion';
import { Reward } from '../database/models/Reward';
import { Settings } from '../database/models/Settings';

export class ExportService {
  /**
   * Export all data to JSON
   */
  static async exportToJSON(): Promise<string> {
    try {
      const tasks = await database.get<Task>('tasks').query().fetch();
      const categories = await database.get<Category>('categories').query().fetch();
      const cigarettes = await database.get<Cigarette>('cigarettes').query().fetch();
      const taskCompletions = await database.get<TaskCompletion>('task_completions').query().fetch();
      const rewards = await database.get<Reward>('rewards').query().fetch();
      const settings = await database.get<Settings>('settings').query().fetch();

      const data = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        tasks: tasks.map((t) => t.toTaskType()),
        categories: categories.map((c) => ({
          id: c.id,
          name: c.name,
          color: c.color,
          icon: c.icon,
          isCustom: c.isCustom,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        })),
        cigarettes: cigarettes.map((c) => c.toCigaretteType()),
        taskCompletions: taskCompletions.map((tc) => ({
          id: tc.id,
          taskId: tc.taskId,
          completedAt: tc.completedAt,
          date: tc.date,
          pointsEarned: tc.pointsEarned,
          createdAt: tc.createdAt,
          updatedAt: tc.updatedAt,
        })),
        rewards: rewards.map((r) => ({
          id: r.id,
          taskId: r.taskId,
          points: r.points,
          type: r.type,
          date: r.date,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        })),
        settings: settings.map((s) => ({
          id: s.id,
          key: s.key,
          value: s.value,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
        })),
      };

      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  /**
   * Save export to file
   */
  static async saveExportToFile(filename: string = 'backup.json'): Promise<string> {
    try {
      const jsonData = await this.exportToJSON();
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(fileUri, jsonData);
      return fileUri;
    } catch (error) {
      console.error('Error saving export to file:', error);
      throw error;
    }
  }

  /**
   * Import data from JSON
   */
  static async importFromJSON(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);

      await database.write(async () => {
        // Import categories first
        if (data.categories) {
          for (const categoryData of data.categories) {
            await database.get<Category>('categories').create((category) => {
              category.name = categoryData.name;
              category.color = categoryData.color;
              category.icon = categoryData.icon;
              category.isCustom = categoryData.isCustom;
              category.createdAt = categoryData.createdAt || Date.now();
              category.updatedAt = categoryData.updatedAt || Date.now();
            });
          }
        }

        // Import tasks
        if (data.tasks) {
          for (const taskData of data.tasks) {
            await database.get<Task>('tasks').create((task) => {
              task.title = taskData.title;
              task.description = taskData.description;
              task.categoryId = taskData.categoryId;
              task.scheduledDate = taskData.scheduledDate;
              task.deadline = taskData.deadline;
              task.time = taskData.time;
              task.startTime = taskData.startTime;
              task.endTime = taskData.endTime;
              task.isContinuous = taskData.isContinuous;
              task.isCompleted = taskData.isCompleted;
              task.priority = taskData.priority;
              task.rewardPoints = taskData.rewardPoints;
              task.penaltyPoints = taskData.penaltyPoints;
              task.notificationEnabled = taskData.notificationEnabled;
              task.notificationTime = taskData.notificationTime;
              task.status = taskData.status;
              task.createdAt = taskData.createdAt || Date.now();
              task.updatedAt = taskData.updatedAt || Date.now();
            });
          }
        }

        // Import cigarettes
        if (data.cigarettes) {
          for (const cigaretteData of data.cigarettes) {
            await database.get<Cigarette>('cigarettes').create((cigarette) => {
              cigarette.date = cigaretteData.date;
              cigarette.count = cigaretteData.count;
              cigarette.dailyLimit = cigaretteData.dailyLimit;
              cigarette.timestamps = cigaretteData.timestamps || [];
              cigarette.createdAt = cigaretteData.createdAt || Date.now();
              cigarette.updatedAt = cigaretteData.updatedAt || Date.now();
            });
          }
        }

        // Import other data similarly...
      });
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  /**
   * Import from file
   */
  static async importFromFile(fileUri: string): Promise<void> {
    try {
      const jsonData = await FileSystem.readAsStringAsync(fileUri);
      await this.importFromJSON(jsonData);
    } catch (error) {
      console.error('Error importing from file:', error);
      throw error;
    }
  }
}

