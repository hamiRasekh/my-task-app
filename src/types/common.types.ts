// Common types used across the application

export type Priority = 'low' | 'medium' | 'high';

export type TaskStatus = 'pending' | 'completed' | 'overdue';

export type RewardType = 'reward' | 'penalty';

export type SortOption = 'date' | 'priority' | 'name' | 'created';

export type FilterOption = {
  categoryId?: string;
  status?: TaskStatus;
  date?: string;
  priority?: Priority;
};

export interface BaseEntity {
  id: string;
  createdAt: number;
  updatedAt: number;
}

