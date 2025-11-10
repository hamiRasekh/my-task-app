import { database } from '../database/database';
import Task from '../database/models/Task';
import { TaskFormData, Task as TaskType } from '../types/task.types';
import { Priority, TaskStatus, FilterOption } from '../types/common.types';
import { DateService } from '../services/DateService';

export class TaskRepository {
  /**
   * Create a new task
   */
  static async createTask(data: TaskFormData): Promise<Task> {
    return await database.write(async () => {
      const status: TaskStatus = DateService.isPast(data.scheduledDate)
        ? 'overdue'
        : 'pending';

      return await database.get<Task>('tasks').create((task) => {
        task.title = data.title;
        task.description = data.description;
        task.categoryId = data.categoryId;
        task.scheduledDate = data.scheduledDate;
        task.deadline = data.deadline;
        task.time = data.time;
        task.startTime = data.startTime;
        task.endTime = data.endTime;
        task.isContinuous = data.isContinuous;
        task.isCompleted = false;
        task.priority = data.priority;
        task.rewardPoints = data.rewardPoints;
        task.penaltyPoints = data.penaltyPoints;
        task.notificationEnabled = data.notificationEnabled;
        task.notificationTime = data.notificationTime;
        task.status = status;
        task.createdAt = Date.now();
        task.updatedAt = Date.now();
      });
    });
  }

  /**
   * Update an existing task
   */
  static async updateTask(taskId: string, data: Partial<TaskFormData>): Promise<Task> {
    return await database.write(async () => {
      const task = await database.get<Task>('tasks').find(taskId);
      
      return await task.update((task) => {
        if (data.title !== undefined) task.title = data.title;
        if (data.description !== undefined) task.description = data.description;
        if (data.categoryId !== undefined) task.categoryId = data.categoryId;
        if (data.scheduledDate !== undefined) {
          task.scheduledDate = data.scheduledDate;
          // Update status based on new date
          task.status = DateService.isPast(data.scheduledDate) ? 'overdue' : 'pending';
        }
        if (data.deadline !== undefined) task.deadline = data.deadline;
        if (data.time !== undefined) task.time = data.time;
        if (data.startTime !== undefined) task.startTime = data.startTime;
        if (data.endTime !== undefined) task.endTime = data.endTime;
        if (data.isContinuous !== undefined) task.isContinuous = data.isContinuous;
        if (data.priority !== undefined) task.priority = data.priority;
        if (data.rewardPoints !== undefined) task.rewardPoints = data.rewardPoints;
        if (data.penaltyPoints !== undefined) task.penaltyPoints = data.penaltyPoints;
        if (data.notificationEnabled !== undefined) task.notificationEnabled = data.notificationEnabled;
        if (data.notificationTime !== undefined) task.notificationTime = data.notificationTime;
        task.updatedAt = Date.now();
      });
    });
  }

  /**
   * Delete a task
   */
  static async deleteTask(taskId: string): Promise<void> {
    await database.write(async () => {
      const task = await database.get<Task>('tasks').find(taskId);
      await task.markAsDeleted();
    });
  }

  /**
   * Get a task by ID
   */
  static async getTaskById(taskId: string): Promise<Task | null> {
    try {
      return await database.get<Task>('tasks').find(taskId);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get all tasks
   */
  static async getAllTasks(): Promise<Task[]> {
    return await database.get<Task>('tasks').query().fetch();
  }

  /**
   * Get tasks with filters
   */
  static async getTasks(filters?: FilterOption): Promise<Task[]> {
    const allTasks = await this.getAllTasks();
    
    return allTasks.filter((task) => {
      if (filters?.categoryId && task.categoryId !== filters.categoryId) {
        return false;
      }
      
      if (filters?.status) {
        if (filters.status === 'completed' && !task.isCompleted) {
          return false;
        }
        if (filters.status === 'pending' && task.isCompleted) {
          return false;
        }
        if (filters.status === 'overdue' && (task.isCompleted || !DateService.isPast(task.scheduledDate))) {
          return false;
        }
      }
      
      if (filters?.date && task.scheduledDate !== filters.date) {
        return false;
      }
      
      if (filters?.priority && task.priority !== filters.priority) {
        return false;
      }
      
      return true;
    });
  }

  /**
   * Get tasks for a specific date
   */
  static async getTasksByDate(date: string): Promise<Task[]> {
    return await database
      .get<Task>('tasks')
      .query()
      .where('scheduled_date', date)
      .fetch();
  }

  /**
   * Get today's tasks
   */
  static async getTodayTasks(): Promise<Task[]> {
    const today = DateService.getToday();
    return await this.getTasksByDate(today);
  }

  /**
   * Get overdue tasks
   */
  static async getOverdueTasks(): Promise<Task[]> {
    const today = DateService.getToday();
    const allTasks = await this.getAllTasks();
    return allTasks.filter(
      (task) => !task.isCompleted && DateService.isPast(task.scheduledDate)
    );
  }

  /**
   * Mark task as completed
   */
  static async completeTask(taskId: string): Promise<Task> {
    return await database.write(async () => {
      const task = await database.get<Task>('tasks').find(taskId);
      return await task.update((task) => {
        task.isCompleted = true;
        task.status = 'completed';
        task.updatedAt = Date.now();
      });
    });
  }

  /**
   * Mark task as incomplete
   */
  static async uncompleteTask(taskId: string): Promise<Task> {
    return await database.write(async () => {
      const task = await database.get<Task>('tasks').find(taskId);
      const status: TaskStatus = DateService.isPast(task.scheduledDate)
        ? 'overdue'
        : 'pending';
      
      return await task.update((task) => {
        task.isCompleted = false;
        task.status = status;
        task.updatedAt = Date.now();
      });
    });
  }

  /**
   * Update task status based on dates
   */
  static async updateTaskStatuses(): Promise<void> {
    const tasks = await this.getAllTasks();
    const today = DateService.getToday();

    await database.write(async () => {
      for (const task of tasks) {
        if (!task.isCompleted) {
          const status: TaskStatus = DateService.isPast(task.scheduledDate)
            ? 'overdue'
            : 'pending';
          
          if (task.status !== status) {
            await task.update((t) => {
              t.status = status;
              t.updatedAt = Date.now();
            });
          }
        }
      }
    });
  }
}

