import React, { createContext, useState, useContext, useEffect } from 'react';
import { Habit, HabitLog, HabitStatistics } from '../types';
import {
  getHabits,
  saveHabit,
  deleteHabit,
  getHabitLogs,
  saveHabitLog,
  getHabitStatistics,
  saveHabitStatistic,
} from '../database/mmkvStorage';
import { generateId, getCurrentDate, calculateStreak } from '../utils/helpers';
import { scheduleHabitReminder, cancelHabitReminder } from '../services/notificationService';

type HabitContextType = {
  habits: Habit[];
  habitLogs: HabitLog[];
  habitStats: HabitStatistics[];
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Habit>;
  updateHabit: (id: string, habitData: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  logHabit: (habitId: string, status: 'done' | 'failed', notes?: string) => Promise<void>;
  getHabitById: (id: string) => Habit | undefined;
  getHabitLogsByHabitId: (habitId: string) => HabitLog[];
  getHabitLogsByDate: (date: string) => HabitLog[];
  getHabitStatsByHabitId: (habitId: string) => HabitStatistics | undefined;
  refreshHabitStats: (habitId: string) => Promise<void>;
  refreshAllHabitStats: () => Promise<void>;
};

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [habitStats, setHabitStats] = useState<HabitStatistics[]>([]);

  // Load data from storage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedHabits = await getHabits();
        const loadedLogs = await getHabitLogs();
        const loadedStats = await getHabitStatistics();
        
        setHabits(loadedHabits);
        setHabitLogs(loadedLogs);
        setHabitStats(loadedStats);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, []);

  // Add a new habit
  const addHabit = async (habitData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Habit> => {
    const now = new Date().toISOString();
    const newHabit: Habit = {
      id: generateId(),
      ...habitData,
      createdAt: now,
      updatedAt: now,
    };

    await saveHabit(newHabit);
    setHabits(prevHabits => [...prevHabits, newHabit]);

    // Schedule reminder if set
    if (newHabit.reminder?.enabled) {
      scheduleHabitReminder(newHabit);
    }

    // Initialize statistics for the new habit
    const newStats: HabitStatistics = {
      habitId: newHabit.id,
      totalCompletions: 0,
      totalFailures: 0,
      currentStreak: 0,
      longestStreak: 0,
      completionRate: 0,
    };
    await saveHabitStatistic(newStats);
    setHabitStats(prevStats => [...prevStats, newStats]);

    return newHabit;
  };

  // Update an existing habit
  const updateHabit = async (id: string, habitData: Partial<Habit>) => {
    const existingHabit = habits.find(habit => habit.id === id);
    if (existingHabit) {
      const updatedHabit: Habit = {
        ...existingHabit,
        ...habitData,
        updatedAt: new Date().toISOString()
      };
      
      await saveHabit(updatedHabit);
      
      setHabits(prevHabits =>
        prevHabits.map(habit => (habit.id === id ? updatedHabit : habit))
      );

      // Update reminder if changed
      cancelHabitReminder(id);
      if (updatedHabit.reminder?.enabled) {
        scheduleHabitReminder(updatedHabit);
      }
    }
  };

  // Remove a habit
  const deleteHabitHandler = async (id: string) => {
    await deleteHabit(id);
    setHabits(prevHabits => prevHabits.filter(habit => habit.id !== id));
    
    // Cancel any reminders for this habit
    cancelHabitReminder(id);
  };

  // Log a habit completion or failure
  const logHabit = async (habitId: string, status: 'done' | 'failed', notes?: string) => {
    const now = new Date().toISOString();
    const newLog: HabitLog = {
      id: generateId(),
      habitId,
      date: getCurrentDate(),
      status,
      notes,
      createdAt: now,
    };

    await saveHabitLog(newLog);
    setHabitLogs(prevLogs => [...prevLogs, newLog]);

    // Update statistics
    await refreshHabitStats(habitId);
  };

  // Get a habit by ID
  const getHabitById = (id: string): Habit | undefined => {
    return habits.find(habit => habit.id === id);
  };

  // Get habit logs by habit ID
  const getHabitLogsByHabitId = (habitId: string): HabitLog[] => {
    return habitLogs.filter(log => log.habitId === habitId);
  };

  // Get habit logs by date
  const getHabitLogsByDate = (date: string): HabitLog[] => {
    return habitLogs.filter(log => log.date === date);
  };

  // Get habit statistics by habit ID
  const getHabitStatsByHabitId = (habitId: string): HabitStatistics | undefined => {
    return habitStats.find(stat => stat.habitId === habitId);
  };

  // Refresh statistics for a specific habit
  const refreshHabitStats = async (habitId: string) => {
    const logs = getHabitLogsByHabitId(habitId);
    
    const completions = logs.filter(log => log.status === 'done').length;
    const failures = logs.filter(log => log.status === 'failed').length;
    const total = completions + failures;
    const completionRate = total > 0 ? (completions / total) * 100 : 0;
    
    // Calculate current streak
    const currentStreak = calculateStreak(logs);
    
    // Find longest streak (this is a simplified version)
    let longestStreak = currentStreak;
    const existingStat = getHabitStatsByHabitId(habitId);
    if (existingStat && existingStat.longestStreak > longestStreak) {
      longestStreak = existingStat.longestStreak;
    }
    
    const updatedStats: HabitStatistics = {
      habitId,
      totalCompletions: completions,
      totalFailures: failures,
      currentStreak,
      longestStreak,
      completionRate,
    };
    
    await saveHabitStatistic(updatedStats);
    
    setHabitStats(prevStats =>
      prevStats.map(stat => (stat.habitId === habitId ? updatedStats : stat))
    );
  };

  // Refresh statistics for all habits
  const refreshAllHabitStats = async () => {
    for (const habit of habits) {
      await refreshHabitStats(habit.id);
    }
  };

  return (
    <HabitContext.Provider
      value={{
        habits,
        habitLogs,
        habitStats,
        addHabit,
        updateHabit,
        deleteHabit: deleteHabitHandler,
        logHabit,
        getHabitById,
        getHabitLogsByHabitId,
        getHabitLogsByDate,
        getHabitStatsByHabitId,
        refreshHabitStats,
        refreshAllHabitStats,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = (): HabitContextType => {
  const context = useContext(HabitContext);
  if (context === undefined) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
}; 