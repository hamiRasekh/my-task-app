import { create } from 'zustand';
import { TaskRepository } from '../repositories/TaskRepository';
import { CategoryRepository } from '../repositories/CategoryRepository';
import Task from '../database/models/Task';
import Category from '../database/models/Category';
import { TaskFormData } from '../types/task.types';
import { FilterOption, SortOption } from '../types/common.types';

interface TaskState {
  tasks: Task[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  filters: FilterOption | null;
  sortBy: SortOption;
  
  // Actions
  loadTasks: () => Promise<void>;
  loadCategories: () => Promise<void>;
  createTask: (data: TaskFormData) => Promise<void>;
  updateTask: (taskId: string, data: Partial<TaskFormData>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  uncompleteTask: (taskId: string) => Promise<void>;
  setFilters: (filters: FilterOption | null) => Promise<void>;
  setSortBy: (sortBy: SortOption) => void;
  refreshTasks: () => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  categories: [],
  loading: false,
  error: null,
  filters: null,
  sortBy: 'date',

  loadTasks: async () => {
    set({ loading: true, error: null });
    try {
      const { filters, sortBy } = get();
      let tasks = await TaskRepository.getTasks(filters || undefined);
      
      // Sort tasks
      tasks = sortTasks(tasks, sortBy);
      
      set({ tasks, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  loadCategories: async () => {
    try {
      const categories = await CategoryRepository.getAllCategories();
      if (categories.length === 0) {
        await CategoryRepository.initializeDefaultCategories();
        const newCategories = await CategoryRepository.getAllCategories();
        set({ categories: newCategories });
      } else {
        set({ categories });
      }
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  createTask: async (data: TaskFormData) => {
    try {
      const task = await TaskRepository.createTask(data);
      await get().loadTasks();
      return task;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateTask: async (taskId: string, data: Partial<TaskFormData>) => {
    try {
      await TaskRepository.updateTask(taskId, data);
      await get().loadTasks();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteTask: async (taskId: string) => {
    try {
      await TaskRepository.deleteTask(taskId);
      await get().loadTasks();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  completeTask: async (taskId: string) => {
    try {
      await TaskRepository.completeTask(taskId);
      await get().loadTasks();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  uncompleteTask: async (taskId: string) => {
    try {
      await TaskRepository.uncompleteTask(taskId);
      await get().loadTasks();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  setFilters: async (filters: FilterOption | null) => {
    set({ filters });
    await get().loadTasks();
  },

  setSortBy: (sortBy: SortOption) => {
    set({ sortBy });
    const { tasks } = get();
    const sortedTasks = sortTasks(tasks, sortBy);
    set({ tasks: sortedTasks });
  },

  refreshTasks: async () => {
    await get().loadTasks();
  },
}));

// Helper function to sort tasks
function sortTasks(tasks: Task[], sortBy: SortOption): Task[] {
  const sorted = [...tasks];
  
  switch (sortBy) {
    case 'date':
      sorted.sort((a, b) => {
        const dateA = a.scheduledDate;
        const dateB = b.scheduledDate;
        if (dateA < dateB) return -1;
        if (dateA > dateB) return 1;
        return 0;
      });
      break;
    case 'priority':
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      sorted.sort((a, b) => {
        const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
        return priorityB - priorityA;
      });
      break;
    case 'name':
      sorted.sort((a, b) => a.title.localeCompare(b.title, 'fa'));
      break;
    case 'created':
      sorted.sort((a, b) => b.createdAt - a.createdAt);
      break;
  }
  
  return sorted;
}

