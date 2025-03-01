import { Habit, HabitLog, HabitStatistics, User } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Initialize storage
let storage;
let usingFallback = false;

try {
  // Try to import MMKV
  const { MMKV } = require('react-native-mmkv');
  
  // Initialize MMKV storage
  storage = new MMKV({
    id: 'habit-tracker-storage',
    encryptionKey: 'habit-tracker-secure-key',
  });
  
  console.log('Using MMKV storage');
} catch (error) {
  console.warn('Failed to initialize MMKV, falling back to AsyncStorage:', error);
  usingFallback = true;
  
  // Create a fallback implementation using AsyncStorage
  storage = {
    getString: async (key: string) => {
      try {
        return await AsyncStorage.getItem(key);
      } catch (e) {
        console.error(`Error getting ${key} from AsyncStorage:`, e);
        return null;
      }
    },
    set: async (key: string, value: string) => {
      try {
        await AsyncStorage.setItem(key, value);
        return true;
      } catch (e) {
        console.error(`Error setting ${key} to AsyncStorage:`, e);
        return false;
      }
    },
    delete: async (key: string) => {
      try {
        await AsyncStorage.removeItem(key);
        return true;
      } catch (e) {
        console.error(`Error deleting ${key} from AsyncStorage:`, e);
        return false;
      }
    },
    clearAll: async () => {
      try {
        await AsyncStorage.clear();
        return true;
      } catch (e) {
        console.error('Error clearing AsyncStorage:', e);
        return false;
      }
    }
  };
}

// Keys for different data types
const KEYS = {
  HABITS: 'habits',
  HABIT_LOGS: 'habit-logs',
  HABIT_STATS: 'habit-stats',
  USER: 'user',
};

// Helper functions to get and set data
const getItem = async <T>(key: string): Promise<T | null> => {
  try {
    let value;
    if (usingFallback) {
      value = await storage.getString(key);
    } else {
      value = storage.getString(key);
    }
    
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`Error parsing ${key} from storage:`, error);
    return null;
  }
};

const setItem = async <T>(key: string, value: T): Promise<boolean> => {
  try {
    const jsonValue = JSON.stringify(value);
    if (usingFallback) {
      await storage.set(key, jsonValue);
    } else {
      storage.set(key, jsonValue);
    }
    return true;
  } catch (error) {
    console.error(`Error storing ${key} to storage:`, error);
    return false;
  }
};

// Habit functions
export const getHabits = async (): Promise<Habit[]> => {
  return await getItem<Habit[]>(KEYS.HABITS) || [];
};

export const saveHabits = async (habits: Habit[]): Promise<boolean> => {
  return await setItem(KEYS.HABITS, habits);
};

export const getHabitById = async (id: string): Promise<Habit | undefined> => {
  const habits = await getHabits();
  return habits.find(habit => habit.id === id);
};

export const saveHabit = async (habit: Habit): Promise<boolean> => {
  const habits = await getHabits();
  const existingIndex = habits.findIndex(h => h.id === habit.id);
  
  if (existingIndex >= 0) {
    habits[existingIndex] = habit;
  } else {
    habits.push(habit);
  }
  
  return await saveHabits(habits);
};

export const deleteHabit = async (id: string): Promise<boolean> => {
  const habits = await getHabits();
  const filteredHabits = habits.filter(habit => habit.id !== id);
  
  if (filteredHabits.length === habits.length) {
    return false; // No habit was removed
  }
  
  return await saveHabits(filteredHabits);
};

// Habit Log functions
export const getHabitLogs = async (): Promise<HabitLog[]> => {
  return await getItem<HabitLog[]>(KEYS.HABIT_LOGS) || [];
};

export const saveHabitLogs = async (logs: HabitLog[]): Promise<boolean> => {
  return await setItem(KEYS.HABIT_LOGS, logs);
};

export const getHabitLogsByHabitId = async (habitId: string): Promise<HabitLog[]> => {
  const logs = await getHabitLogs();
  return logs.filter(log => log.habitId === habitId);
};

export const getHabitLogsByDate = async (date: string): Promise<HabitLog[]> => {
  const logs = await getHabitLogs();
  return logs.filter(log => log.date === date);
};

export const saveHabitLog = async (log: HabitLog): Promise<boolean> => {
  const logs = await getHabitLogs();
  const existingIndex = logs.findIndex(l => l.id === log.id);
  
  if (existingIndex >= 0) {
    logs[existingIndex] = log;
  } else {
    logs.push(log);
  }
  
  return await saveHabitLogs(logs);
};

export const deleteHabitLog = async (id: string): Promise<boolean> => {
  const logs = await getHabitLogs();
  const filteredLogs = logs.filter(log => log.id !== id);
  
  if (filteredLogs.length === logs.length) {
    return false; // No log was removed
  }
  
  return await saveHabitLogs(filteredLogs);
};

// Habit Statistics functions
export const getHabitStatistics = async (): Promise<HabitStatistics[]> => {
  return await getItem<HabitStatistics[]>(KEYS.HABIT_STATS) || [];
};

export const saveHabitStatistics = async (stats: HabitStatistics[]): Promise<boolean> => {
  return await setItem(KEYS.HABIT_STATS, stats);
};

export const getHabitStatisticsByHabitId = async (habitId: string): Promise<HabitStatistics | undefined> => {
  const stats = await getHabitStatistics();
  return stats.find(stat => stat.habitId === habitId);
};

export const saveHabitStatistic = async (stat: HabitStatistics): Promise<boolean> => {
  const stats = await getHabitStatistics();
  const existingIndex = stats.findIndex(s => s.habitId === stat.habitId);
  
  if (existingIndex >= 0) {
    stats[existingIndex] = stat;
  } else {
    stats.push(stat);
  }
  
  return await saveHabitStatistics(stats);
};

// User functions
export const getUser = async (): Promise<User | null> => {
  return await getItem<User>(KEYS.USER);
};

export const saveUser = async (user: User): Promise<boolean> => {
  return await setItem(KEYS.USER, user);
};

// Clear all data (for testing or reset)
export const clearAllData = async (): Promise<void> => {
  if (usingFallback) {
    await storage.clearAll();
  } else {
    storage.clearAll();
  }
}; 