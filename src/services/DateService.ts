import PersianDate from 'persian-date';
import {
  getTodayPersianDate,
  getTomorrowPersianDate,
  formatPersianDate,
  comparePersianDates,
  addDaysToPersianDate,
} from '../utils/dateUtils';

export class DateService {
  /**
   * Get current Persian date
   */
  static getToday(): string {
    return getTodayPersianDate();
  }

  /**
   * Get tomorrow's Persian date
   */
  static getTomorrow(): string {
    return getTomorrowPersianDate();
  }

  /**
   * Format Persian date for display
   */
  static formatDate(date: string, format: string = 'YYYY/MM/DD'): string {
    return formatPersianDate(date, format);
  }

  /**
   * Compare two Persian dates
   * @returns negative if date1 < date2, positive if date1 > date2, 0 if equal
   */
  static compareDates(date1: string, date2: string): number {
    return comparePersianDates(date1, date2);
  }

  /**
   * Check if date is today
   */
  static isToday(date: string): boolean {
    return date === this.getToday();
  }

  /**
   * Check if date is tomorrow
   */
  static isTomorrow(date: string): boolean {
    return date === this.getTomorrow();
  }

  /**
   * Check if date is in the past
   */
  static isPast(date: string): boolean {
    return this.compareDates(date, this.getToday()) < 0;
  }

  /**
   * Check if date is in the future
   */
  static isFuture(date: string): boolean {
    return this.compareDates(date, this.getToday()) > 0;
  }

  /**
   * Add days to a Persian date
   */
  static addDays(date: string, days: number): string {
    return addDaysToPersianDate(date, days);
  }

  /**
   * Get Persian date with day name
   */
  static getDateWithDayName(date: string): string {
    try {
      const [year, month, day] = date.split('/').map(Number);
      const persianDate = new PersianDate([year, month - 1, day]);
      // Try to get day name using format, if it fails use manual calculation
      let dayName = '';
      try {
        dayName = persianDate.format('dddd');
      } catch {
        // If format doesn't work, calculate day of week manually
        // PersianDate uses JavaScript Date internally
        const jsDate = persianDate.toDate();
        const dayOfWeek = jsDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        // Convert to Persian week (Saturday = 0, Sunday = 1, ..., Friday = 6)
        const persianDayOfWeek = (dayOfWeek + 1) % 7;
        const dayNames = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
        dayName = dayNames[persianDayOfWeek] || '';
      }
      return dayName ? `${dayName}، ${date}` : date;
    } catch (error) {
      console.error('Error formatting date with day name:', error);
      return date;
    }
  }

  /**
   * Get month name in Persian
   */
  static getMonthName(date: string): string {
    const [, month] = date.split('/').map(Number);
    const months = [
      'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
      'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
    ];
    return months[month - 1] || '';
  }

  /**
   * Get date range for a month
   */
  static getMonthRange(year: number, month: number): { start: string; end: string } {
    const startDate = new PersianDate([year, month - 1, 1]);
    const endDate = new PersianDate([year, month - 1, startDate.daysInMonth()]);
    return {
      start: startDate.format('YYYY/MM/DD'),
      end: endDate.format('YYYY/MM/DD'),
    };
  }

  /**
   * Get current month range
   */
  static getCurrentMonthRange(): { start: string; end: string } {
    const today = new PersianDate();
    return this.getMonthRange(today.year(), today.month());
  }

  /**
   * Convert time string to minutes since midnight
   */
  static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Format minutes since midnight to time string
   */
  static minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
}

