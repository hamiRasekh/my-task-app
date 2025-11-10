import { BaseEntity } from './common.types';

export interface Cigarette extends BaseEntity {
  date: string; // Persian date (YYYY/MM/DD)
  count: number;
  dailyLimit: number;
  timestamps: number[]; // Array of timestamps when cigarettes were smoked
}

export interface CigaretteStats {
  today: number;
  weekly: number;
  monthly: number;
  average: number;
  max: number;
  min: number;
  streak: number; // consecutive days under limit
  percentage: number; // percentage of limit used today
}

export interface CigaretteReport {
  date: string;
  count: number;
  limit: number;
  percentage: number;
}

