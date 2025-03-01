// Helper functions for the application

/**
 * Generate a unique ID
 * @returns A unique string ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

/**
 * Get the current date in YYYY-MM-DD format
 * @returns Current date string
 */
export const getCurrentDate = (): string => {
  const date = new Date();
  return formatDate(date);
};

/**
 * Format a date object to YYYY-MM-DD
 * @param date Date object
 * @returns Formatted date string
 */
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Parse a date string in YYYY-MM-DD format
 * @param dateString Date string in YYYY-MM-DD format
 * @returns Date object
 */
export const parseDate = (dateString: string): Date => {
  return new Date(dateString);
};

/**
 * Format a date to a human-readable string
 * @param date Date object or string
 * @returns Formatted date string (e.g., "Monday, January 1, 2023")
 */
export const formatDateToReadable = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Get the day of the week (0-6, where 0 is Sunday)
 * @param date Date object or string
 * @returns Day of the week (0-6)
 */
export const getDayOfWeek = (date: Date | string): number => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.getDay();
};

/**
 * Check if a date is today
 * @param date Date object or string
 * @returns Boolean indicating if the date is today
 */
export const isToday = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
};

/**
 * Get dates for the current week (Sunday to Saturday)
 * @returns Array of date strings for the current week
 */
export const getCurrentWeekDates = (): string[] => {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Calculate the date of the Sunday of this week
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - currentDay);
  
  // Generate dates for the whole week
  const weekDates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(sunday);
    date.setDate(sunday.getDate() + i);
    weekDates.push(formatDate(date));
  }
  
  return weekDates;
};

/**
 * Calculate the streak for a habit based on logs
 * @param logs Array of habit logs sorted by date (newest first)
 * @returns Current streak count
 */
export const calculateStreak = (logs: { date: string; status: string }[]): number => {
  if (logs.length === 0) return 0;
  
  // Sort logs by date (newest first)
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  let streak = 0;
  let currentDate = new Date();
  let expectedDateStr = formatDate(currentDate);
  
  // Check if the most recent log is from today or yesterday
  const mostRecentLog = sortedLogs[0];
  if (mostRecentLog.date !== expectedDateStr && 
      mostRecentLog.date !== formatDate(new Date(currentDate.setDate(currentDate.getDate() - 1)))) {
    // If the most recent log is not from today or yesterday, streak is broken
    return mostRecentLog.status === 'done' ? 1 : 0;
  }
  
  // Count consecutive 'done' logs
  for (const log of sortedLogs) {
    if (log.status !== 'done') break;
    
    if (log.date === expectedDateStr) {
      streak++;
      // Move to the previous day
      currentDate = new Date(expectedDateStr);
      currentDate.setDate(currentDate.getDate() - 1);
      expectedDateStr = formatDate(currentDate);
    } else if (parseDate(log.date) < parseDate(expectedDateStr)) {
      // There's a gap in the logs, streak is broken
      break;
    }
  }
  
  return streak;
};

/**
 * Format time from 24-hour format to 12-hour format
 * @param time Time string in HH:MM format
 * @returns Formatted time string (e.g., "8:00 PM")
 */
export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${String(minutes).padStart(2, '0')} ${period}`;
}; 