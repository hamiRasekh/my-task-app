import PersianDate from 'persian-date';

// Convert Persian date to timestamp
export const persianDateToTimestamp = (persianDate: string): number => {
  const [year, month, day] = persianDate.split('/').map(Number);
  const date = new PersianDate([year, month - 1, day]);
  return date.valueOf();
};

// Convert timestamp to Persian date
export const timestampToPersianDate = (timestamp: number): string => {
  const date = new PersianDate(new Date(timestamp));
  return date.format('YYYY/MM/DD');
};

// Get today's Persian date
export const getTodayPersianDate = (): string => {
  const today = new PersianDate();
  return today.format('YYYY/MM/DD');
};

// Get tomorrow's Persian date
export const getTomorrowPersianDate = (): string => {
  const tomorrow = new PersianDate();
  tomorrow.add('day', 1);
  return tomorrow.format('YYYY/MM/DD');
};

// Format Persian date for display
export const formatPersianDate = (date: string, format: string = 'YYYY/MM/DD'): string => {
  const [year, month, day] = date.split('/').map(Number);
  const persianDate = new PersianDate([year, month - 1, day]);
  return persianDate.format(format);
};

// Get Persian month name
export const getPersianMonthName = (month: number): string => {
  const months = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];
  return months[month - 1] || '';
};

// Get Persian day name
export const getPersianDayName = (day: number): string => {
  const days = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
  return days[day] || '';
};

// Compare two Persian dates
export const comparePersianDates = (date1: string, date2: string): number => {
  const timestamp1 = persianDateToTimestamp(date1);
  const timestamp2 = persianDateToTimestamp(date2);
  return timestamp1 - timestamp2;
};

// Check if date is today
export const isToday = (date: string): boolean => {
  return date === getTodayPersianDate();
};

// Check if date is tomorrow
export const isTomorrow = (date: string): boolean => {
  return date === getTomorrowPersianDate();
};

// Add days to Persian date
export const addDaysToPersianDate = (date: string, days: number): string => {
  const [year, month, day] = date.split('/').map(Number);
  const persianDate = new PersianDate([year, month - 1, day]);
  persianDate.add('day', days);
  return persianDate.format('YYYY/MM/DD');
};

// Get date range for reports
export const getDateRange = (startDate: string, endDate: string): string[] => {
  const dates: string[] = [];
  let currentDate = startDate;
  
  while (comparePersianDates(currentDate, endDate) <= 0) {
    dates.push(currentDate);
    currentDate = addDaysToPersianDate(currentDate, 1);
  }
  
  return dates;
};

