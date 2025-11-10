import { Priority, TaskStatus, RewardType, BaseEntity } from './common.types';

export interface Task extends BaseEntity {
  title: string;
  description?: string;
  categoryId?: string;
  scheduledDate: string; // Persian date (YYYY/MM/DD)
  deadline?: string; // Persian date
  time?: string; // HH:mm format
  startTime?: string; // HH:mm format
  endTime?: string; // HH:mm format
  isContinuous: boolean;
  isCompleted: boolean;
  priority: Priority;
  rewardPoints: number;
  penaltyPoints: number;
  notificationEnabled: boolean;
  notificationTime?: string; // HH:mm format
  status: TaskStatus;
}

export interface TaskFormData {
  title: string;
  description?: string;
  categoryId?: string;
  scheduledDate: string;
  deadline?: string;
  time?: string;
  startTime?: string;
  endTime?: string;
  isContinuous: boolean;
  priority: Priority;
  rewardPoints: number;
  penaltyPoints: number;
  notificationEnabled: boolean;
  notificationTime?: string;
}

