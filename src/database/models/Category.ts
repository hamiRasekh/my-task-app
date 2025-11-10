import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

export default class Category extends Model {
  static table = 'categories';

  @field('name') name!: string;
  @field('color') color!: string;
  @field('icon') icon?: string;
  @field('is_custom') isCustom!: boolean;
  @field('created_at') createdAt!: number;
  @field('updated_at') updatedAt!: number;

  @readonly @date('created_at') createdAtDate!: Date;
  @readonly @date('updated_at') updatedAtDate!: Date;
}

