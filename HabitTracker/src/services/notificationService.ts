import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Habit, HabitLog } from '../types';
import { getHabits, getHabitLogsByDate } from '../database/mmkvStorage';
import { getCurrentDate, formatTime } from '../utils/helpers';

// Flag to track if notifications are available
let notificationsAvailable = false;

// Initialize notifications
export const initNotifications = async () => {
  try {
    // Check if device is a physical device (notifications don't work well on simulators)
    if (!Device.isDevice) {
      console.warn('Notifications are not supported on simulator/emulator');
      return;
    }

    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.warn('Failed to get notification permissions');
      return;
    }

    // Configure notification settings
    await Notifications.setNotificationChannelAsync('habit-reminders', {
      name: 'Habit Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: true,
    });

    // Set notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    notificationsAvailable = true;
    console.log('Notifications initialized successfully');
  } catch (error) {
    console.error('Failed to initialize notifications:', error);
    notificationsAvailable = false;
  }
};

// Schedule a notification for a specific habit
export const scheduleHabitReminder = async (habit: Habit) => {
  if (!notificationsAvailable) {
    console.warn('Notifications are not available');
    return;
  }

  if (!habit.reminder || !habit.reminder.enabled) return;

  try {
    // Cancel any existing notification for this habit
    await cancelHabitReminder(habit.id);

    const [hours, minutes] = habit.reminder.time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    // If the time has already passed today, schedule for tomorrow
    if (date.getTime() < Date.now()) {
      date.setDate(date.getDate() + 1);
    }

    // For custom frequency, check if today is one of the custom days
    if (habit.frequency.type === 'custom' && habit.frequency.customDays) {
      const today = new Date().getDay(); // 0 = Sunday, 6 = Saturday
      if (!habit.frequency.customDays.includes(today)) {
        return; // Don't schedule if today is not a custom day
      }
    }

    // For weekly frequency, check if today is one of the selected days
    if (habit.frequency.type === 'weekly') {
      const today = new Date().getDay();
      const weekdayMap: Record<number, string> = {
        0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat'
      };
      const todayString = weekdayMap[today];
      if (!habit.frequency.days.includes(todayString as any)) {
        return; // Don't schedule if today is not a selected day
      }
    }

    // Schedule the notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Reminder: ${habit.name}`,
        body: `Don't forget to track your habit: ${habit.name}`,
        data: { habitId: habit.id },
      },
      trigger: {
        hour: hours,
        minute: minutes,
        repeats: true,
      },
      identifier: habit.id,
    });

    console.log(`Scheduled reminder for habit: ${habit.name}`);
  } catch (error) {
    console.error('Failed to schedule habit reminder:', error);
  }
};

// Schedule all habit reminders
export const scheduleAllHabitReminders = async () => {
  if (!notificationsAvailable) {
    console.warn('Notifications are not available');
    return;
  }

  try {
    const habits = await getHabits();
    
    // Cancel all existing notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // Schedule new notifications for each habit
    for (const habit of habits) {
      if (habit.reminder && habit.reminder.enabled) {
        await scheduleHabitReminder(habit);
      }
    }
    
    console.log(`Scheduled reminders for ${habits.length} habits`);
  } catch (error) {
    console.error('Failed to schedule all habit reminders:', error);
  }
};

// Schedule persistent evening reminders for incomplete habits
export const schedulePersistentEveningReminders = async (startTime: string, intervalMinutes: number) => {
  if (!notificationsAvailable) {
    console.warn('Notifications are not available');
    return;
  }

  try {
    // Get all scheduled notifications
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    // Cancel any existing persistent reminders
    for (const notification of scheduledNotifications) {
      if (notification.content.data?.isPersistentReminder) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }

    const [hours, minutes] = startTime.split(':').map(Number);
    const today = getCurrentDate();
    const logs = await getHabitLogsByDate(today);
    const habits = await getHabits();
    
    // Find habits that haven't been logged today
    const incompleteHabits = habits.filter(habit => {
      // For custom frequency, check if today is one of the custom days
      if (habit.frequency.type === 'custom' && habit.frequency.customDays) {
        const todayDay = new Date().getDay();
        if (!habit.frequency.customDays.includes(todayDay)) {
          return false; // Skip if today is not a custom day
        }
      }
      
      // For weekly frequency, check if today is one of the selected days
      if (habit.frequency.type === 'weekly') {
        const today = new Date().getDay();
        const weekdayMap: Record<number, string> = {
          0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat'
        };
        const todayString = weekdayMap[today];
        if (!habit.frequency.days.includes(todayString as any)) {
          return false; // Skip if today is not a selected day
        }
      }
      
      // Check if the habit has been logged today
      return !logs.some(log => log.habitId === habit.id);
    });
    
    if (incompleteHabits.length === 0) {
      return; // No incomplete habits to remind about
    }
    
    // Schedule reminders every intervalMinutes until midnight
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    // If start time has already passed, start from now
    const now = new Date();
    if (startDate < now) {
      startDate.setTime(now.getTime());
    }
    
    const endDate = new Date();
    endDate.setHours(23, 59, 0, 0);
    
    let currentTime = startDate.getTime();
    let notificationId = 1000; // Start from a different range to avoid conflicts
    
    while (currentTime < endDate.getTime()) {
      const notificationTime = new Date(currentTime);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Incomplete Habits',
          body: `You have ${incompleteHabits.length} habits to track today`,
          data: { isPersistentReminder: true },
        },
        trigger: {
          date: notificationTime,
        },
        identifier: `persistent-${notificationId}`,
      });
      
      // Move to the next interval
      currentTime += intervalMinutes * 60 * 1000;
      notificationId++;
    }
    
    console.log(`Scheduled ${notificationId - 1000} persistent reminders`);
  } catch (error) {
    console.error('Failed to schedule persistent evening reminders:', error);
  }
};

// Send an immediate notification
export const sendImmediateNotification = async (title: string, message: string) => {
  if (!notificationsAvailable) {
    console.warn('Notifications are not available');
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body: message,
      },
      trigger: null, // null means send immediately
    });
    
    console.log('Sent immediate notification');
  } catch (error) {
    console.error('Failed to send immediate notification:', error);
  }
};

// Cancel all notifications
export const cancelAllNotifications = async () => {
  if (!notificationsAvailable) {
    console.warn('Notifications are not available');
    return;
  }

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Cancelled all notifications');
  } catch (error) {
    console.error('Failed to cancel all notifications:', error);
  }
};

// Cancel a specific habit's notification
export const cancelHabitReminder = async (habitId: string) => {
  if (!notificationsAvailable) {
    console.warn('Notifications are not available');
    return;
  }

  try {
    await Notifications.cancelScheduledNotificationAsync(habitId);
    console.log(`Cancelled reminder for habit: ${habitId}`);
  } catch (error) {
    console.error(`Failed to cancel habit reminder for habit ${habitId}:`, error);
  }
}; 