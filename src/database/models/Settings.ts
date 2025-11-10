import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

export default class Settings extends Model {
  static table = 'settings';

  @field('key') key!: string;
  @field('value') value!: string;
  @field('created_at') createdAt!: number;
  @field('updated_at') updatedAt!: number;

  @readonly @date('created_at') createdAtDate!: Date;
  @readonly @date('updated_at') updatedAtDate!: Date;

  getValue<T>(): T {
    try {
      return JSON.parse(this.value);
    } catch {
      return this.value as any;
    }
  }

  setValue<T>(value: T): void {
    this.value = JSON.stringify(value);
  }
}

