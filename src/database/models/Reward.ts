import { Model } from '@nozbe/watermelondb';
import { field, relation, readonly, date } from '@nozbe/watermelondb/decorators';

export default class Reward extends Model {
  static table = 'rewards';

  static associations = {
    tasks: { type: 'belongs_to', key: 'task_id' },
  } as const;

  @field('task_id') taskId?: string;
  @field('points') points!: number;
  @field('type') type!: string;
  @field('date') date!: string;
  @field('created_at') createdAt!: number;
  @field('updated_at') updatedAt!: number;

  @readonly @date('created_at') createdAtDate!: Date;
  @readonly @date('updated_at') updatedAtDate!: Date;
}

