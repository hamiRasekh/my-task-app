import { Model } from '@nozbe/watermelondb';
import { field, relation, date, readonly } from '@nozbe/watermelondb/decorators';
import { Task as TaskType } from '../../types/task.types';

export default class Task extends Model {
  static table = 'tasks';
  
  static associations = {
    categories: { type: 'belongs_to', key: 'category_id' },
    task_completions: { type: 'has_many', foreignKey: 'task_id' },
    rewards: { type: 'has_many', foreignKey: 'task_id' },
  } as const;

  @field('title') title!: string;
  @field('description') description?: string;
  @field('category_id') categoryId?: string;
  @field('scheduled_date') scheduledDate!: string;
  @field('deadline') deadline?: string;
  @field('time') time?: string;
  @field('start_time') startTime?: string;
  @field('end_time') endTime?: string;
  @field('is_continuous') isContinuous!: boolean;
  @field('is_completed') isCompleted!: boolean;
  @field('priority') priority!: string;
  @field('reward_points') rewardPoints!: number;
  @field('penalty_points') penaltyPoints!: number;
  @field('notification_enabled') notificationEnabled!: boolean;
  @field('notification_time') notificationTime?: string;
  @field('status') status!: string;
  @field('created_at') createdAt!: number;
  @field('updated_at') updatedAt!: number;

  @readonly @date('created_at') createdAtDate!: Date;
  @readonly @date('updated_at') updatedAtDate!: Date;

  toTaskType(): TaskType {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      categoryId: this.categoryId,
      scheduledDate: this.scheduledDate,
      deadline: this.deadline,
      time: this.time,
      startTime: this.startTime,
      endTime: this.endTime,
      isContinuous: this.isContinuous,
      isCompleted: this.isCompleted,
      priority: this.priority as any,
      rewardPoints: this.rewardPoints,
      penaltyPoints: this.penaltyPoints,
      notificationEnabled: this.notificationEnabled,
      notificationTime: this.notificationTime,
      status: this.status as any,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

