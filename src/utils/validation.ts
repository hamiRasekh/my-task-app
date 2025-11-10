// Validation utilities

export const validateTaskTitle = (title: string): boolean => {
  return title.trim().length > 0 && title.trim().length <= 100;
};

export const validatePersianDate = (date: string): boolean => {
  const dateRegex = /^\d{4}\/\d{2}\/\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  const [year, month, day] = date.split('/').map(Number);
  
  // Basic validation
  if (year < 1300 || year > 1500) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  
  return true;
};

export const validateTime = (time: string): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

export const validateCigaretteLimit = (limit: number): boolean => {
  return limit > 0 && limit <= 100;
};

export const validateCigaretteCount = (count: number): boolean => {
  return count >= 0 && count <= 1000;
};

export const validatePriority = (priority: string): boolean => {
  return ['low', 'medium', 'high'].includes(priority);
};

