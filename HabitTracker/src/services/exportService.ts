import { PermissionsAndroid, Platform } from 'react-native';
import { Habit, HabitLog, HabitStatistics } from '../types';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { formatDateToReadable } from '../utils/helpers';

// Request storage permissions (for Android)
export const requestStoragePermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Storage Permission',
        message: 'Habit Tracker needs access to your storage to export data',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.error('Failed to request permission:', err);
    return false;
  }
};

// Export habits to JSON
export const exportHabitsToJson = async (
  habits: Habit[],
  logs: HabitLog[],
  stats: HabitStatistics[]
): Promise<boolean> => {
  try {
    // Create a data object with all the information
    const exportData = {
      habits,
      logs,
      stats,
      exportDate: new Date().toISOString(),
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(exportData, null, 2);

    // Create a temporary file
    const fileName = `habit_tracker_export_${new Date().getTime()}.json`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;

    // Write the file
    await FileSystem.writeAsStringAsync(filePath, jsonString);

    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath);
      return true;
    } else {
      console.error('Sharing is not available on this device');
      return false;
    }
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    return false;
  }
};

// Export habits to CSV
export const exportHabitsToCSV = async (
  habits: Habit[],
  logs: HabitLog[],
  stats: HabitStatistics[]
): Promise<boolean> => {
  try {
    // Create CSV for habits
    const habitsCsv = [
      'ID,Name,Description,Category,Frequency,Created At,Updated At',
      ...habits.map(
        habit =>
          `"${habit.id}","${habit.name}","${habit.description || ''}","${habit.category}","${
            habit.frequency
          }","${habit.createdAt}","${habit.updatedAt}"`
      ),
    ].join('\n');

    // Create CSV for logs
    const logsCsv = [
      'ID,Habit ID,Date,Status,Notes,Created At',
      ...logs.map(
        log =>
          `"${log.id}","${log.habitId}","${log.date}","${log.status}","${log.notes || ''}","${
            log.createdAt
          }"`
      ),
    ].join('\n');

    // Create CSV for stats
    const statsCsv = [
      'Habit ID,Total Completions,Total Failures,Current Streak,Longest Streak,Completion Rate',
      ...stats.map(
        stat =>
          `"${stat.habitId}","${stat.totalCompletions}","${stat.totalFailures}","${
            stat.currentStreak
          }","${stat.longestStreak}","${stat.completionRate.toFixed(2)}%"`
      ),
    ].join('\n');

    // Combine all CSVs with headers
    const combinedCsv = [
      '# HABIT TRACKER EXPORT',
      `# Date: ${formatDateToReadable(new Date())}`,
      '',
      '# HABITS',
      habitsCsv,
      '',
      '# LOGS',
      logsCsv,
      '',
      '# STATISTICS',
      statsCsv,
    ].join('\n');

    // Create a temporary file
    const fileName = `habit_tracker_export_${new Date().getTime()}.csv`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;

    // Write the file
    await FileSystem.writeAsStringAsync(filePath, combinedCsv);

    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath);
      return true;
    } else {
      console.error('Sharing is not available on this device');
      return false;
    }
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return false;
  }
}; 