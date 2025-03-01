export type HabitCategory = 'health' | 'work' | 'personal' | 'education' | 'social' | 'other';

export type WeekDay = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export type HabitFrequencyType = 'daily' | 'weekly' | 'custom';

export interface HabitFrequency {
  type: HabitFrequencyType;
  days: WeekDay[];
  customDays?: number[]; // For custom frequency patterns
}

export type HabitStatus = 'pending' | 'done' | 'failed';

export interface HabitReminder {
  enabled: boolean;
  time: string; // HH:MM format
  days: WeekDay[];
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  category: HabitCategory;
  icon?: string;
  frequency: HabitFrequency;
  reminder?: HabitReminder;
  createdAt: string;
  updatedAt?: string;
  archived?: boolean;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD format
  status: HabitStatus;
  notes?: string;
  createdAt: string;
}

export interface HabitStatistics {
  habitId: string;
  totalCompletions: number;
  totalFailures: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number; // percentage
}

export interface AppSettings {
  darkMode: boolean;
  notificationsEnabled: boolean;
  notificationStartTime: string; // HH:MM format
  notificationInterval: number; // minutes
}

export interface User {
  id: string;
  name: string;
  settings: AppSettings;
} 