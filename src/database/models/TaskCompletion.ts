import { Model } from '@nozbe/watermelondb';
import { field, relation, readonly, date } from '@nozbe/watermelondb/decorators';

export default class TaskCompletion extends Model {
  static table = 'task_completions';

  static associations = {
    tasks: { type: 'belongs_to', key: 'task_id' },
  } as const;

  @field('task_id') taskId!: string;
  @field('completed_at') completedAt!: number;
  @field('date') date!: string;
  @field('points_earned') pointsEarned!: number;
  @field('created_at') createdAt!: number;
  @field('updated_at') updatedAt!: number;

  @readonly @date('created_at') createdAtDate!: Date;
  @readonly @date('updated_at') updatedAtDate!: Date;
}

