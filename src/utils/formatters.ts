// Formatting utilities

export const formatTime = (time: string): string => {
  return time; // Already in HH:mm format
};

export const formatPriority = (priority: string): string => {
  const priorities: Record<string, string> = {
    low: 'کم',
    medium: 'متوسط',
    high: 'زیاد',
  };
  return priorities[priority] || priority;
};

export const formatTaskStatus = (status: string): string => {
  const statuses: Record<string, string> = {
    pending: 'در انتظار',
    completed: 'انجام شده',
    overdue: 'گذشته از موعد',
  };
  return statuses[status] || status;
};

export const formatNumber = (num: number): string => {
  return num.toLocaleString('fa-IR');
};

export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  const percentage = Math.round((value / total) * 100);
  return `${percentage}%`;
};

export const formatDateRange = (startDate: string, endDate: string): string => {
  return `${startDate} تا ${endDate}`;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

