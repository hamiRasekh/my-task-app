import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';
import { Cigarette as CigaretteType } from '../../types/cigarette.types';

export default class Cigarette extends Model {
  static table = 'cigarettes';

  @field('date') date!: string;
  @field('count') count!: number;
  @field('daily_limit') dailyLimit!: number;
  @field('timestamps') timestampsStr!: string; // JSON string
  
  @field('created_at') createdAt!: number;
  @field('updated_at') updatedAt!: number;

  @readonly @date('created_at') createdAtDate!: Date;
  @readonly @date('updated_at') updatedAtDate!: Date;

  get timestamps(): number[] {
    try {
      return JSON.parse(this.timestampsStr || '[]');
    } catch {
      return [];
    }
  }

  set timestamps(value: number[]) {
    this.timestampsStr = JSON.stringify(value);
  }

  toCigaretteType(): CigaretteType {
    return {
      id: this.id,
      date: this.date,
      count: this.count,
      dailyLimit: this.dailyLimit,
      timestamps: this.timestamps,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

