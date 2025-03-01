import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { 
  Text, 
  Switch, 
  List, 
  Divider, 
  Button, 
  Dialog, 
  Portal, 
  TextInput,
  TouchableRipple
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../context/ThemeContext';
import { useHabits } from '../context/HabitContext';
import { formatTime } from '../utils/helpers';
import { exportHabitsToJson, exportHabitsToCSV, requestStoragePermission } from '../services/exportService';
import { schedulePersistentEveningReminders, cancelAllNotifications } from '../services/notificationService';

const SettingsScreen = () => {
  const { theme, isDarkMode, toggleTheme, settings, updateSettings } = useTheme();
  const { habits, habitLogs, habitStats, refreshAllHabitStats } = useHabits();
  
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showIntervalDialog, setShowIntervalDialog] = useState(false);
  const [intervalMinutes, setIntervalMinutes] = useState(settings.notificationInterval.toString());
  
  // Handle dark mode toggle
  const handleDarkModeToggle = () => {
    toggleTheme();
  };
  
  // Handle notifications toggle
  const handleNotificationsToggle = () => {
    const newValue = !settings.notificationsEnabled;
    updateSettings({ notificationsEnabled: newValue });
    
    if (newValue) {
      // Re-schedule notifications
      schedulePersistentEveningReminders(
        settings.notificationStartTime,
        settings.notificationInterval
      );
    } else {
      // Cancel all notifications
      cancelAllNotifications();
    }
  };
  
  // Handle notification time change
  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    
    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      
      updateSettings({ notificationStartTime: timeString });
      
      // Re-schedule notifications if enabled
      if (settings.notificationsEnabled) {
        schedulePersistentEveningReminders(
          timeString,
          settings.notificationInterval
        );
      }
    }
  };
  
  // Handle notification interval change
  const handleIntervalChange = () => {
    const interval = parseInt(intervalMinutes);
    
    if (isNaN(interval) || interval < 1) {
      Alert.alert('Invalid Interval', 'Please enter a valid number greater than 0');
      return;
    }
    
    updateSettings({ notificationInterval: interval });
    setShowIntervalDialog(false);
    
    // Re-schedule notifications if enabled
    if (settings.notificationsEnabled) {
      schedulePersistentEveningReminders(
        settings.notificationStartTime,
        interval
      );
    }
  };
  
  // Handle export to JSON
  const handleExportJson = async () => {
    const hasPermission = await requestStoragePermission();
    
    if (hasPermission) {
      const success = await exportHabitsToJson(habits, habitLogs, habitStats);
      
      if (success) {
        Alert.alert('Export Successful', 'Your data has been exported to JSON format');
      } else {
        Alert.alert('Export Failed', 'There was an error exporting your data');
      }
    } else {
      Alert.alert('Permission Denied', 'Storage permission is required to export data');
    }
  };
  
  // Handle export to CSV
  const handleExportCsv = async () => {
    const hasPermission = await requestStoragePermission();
    
    if (hasPermission) {
      const success = await exportHabitsToCSV(habits, habitLogs, habitStats);
      
      if (success) {
        Alert.alert('Export Successful', 'Your data has been exported to CSV format');
      } else {
        Alert.alert('Export Failed', 'There was an error exporting your data');
      }
    } else {
      Alert.alert('Permission Denied', 'Storage permission is required to export data');
    }
  };
  
  // Handle refresh statistics
  const handleRefreshStats = () => {
    refreshAllHabitStats();
    Alert.alert('Statistics Updated', 'All habit statistics have been recalculated');
  };
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <List.Section>
        <List.Subheader>Appearance</List.Subheader>
        <TouchableRipple onPress={handleDarkModeToggle}>
          <List.Item
            title="Dark Mode"
            description="Use dark theme throughout the app"
            left={props => <List.Icon {...props} icon="theme-light-dark" />}
            right={props => <Switch value={isDarkMode} onValueChange={handleDarkModeToggle} />}
          />
        </TouchableRipple>
      </List.Section>
      
      <Divider />
      
      <List.Section>
        <List.Subheader>Notifications</List.Subheader>
        <TouchableRipple onPress={handleNotificationsToggle}>
          <List.Item
            title="Enable Notifications"
            description="Receive reminders for incomplete habits"
            left={props => <List.Icon {...props} icon="bell" />}
            right={props => <Switch value={settings.notificationsEnabled} onValueChange={handleNotificationsToggle} />}
          />
        </TouchableRipple>
        
        <TouchableRipple onPress={() => setShowTimePicker(true)} disabled={!settings.notificationsEnabled}>
          <List.Item
            title="Start Time"
            description={`Notifications start at ${formatTime(settings.notificationStartTime)}`}
            left={props => <List.Icon {...props} icon="clock" />}
            disabled={!settings.notificationsEnabled}
          />
        </TouchableRipple>
        
        <TouchableRipple onPress={() => setShowIntervalDialog(true)} disabled={!settings.notificationsEnabled}>
          <List.Item
            title="Reminder Interval"
            description={`Remind every ${settings.notificationInterval} minutes`}
            left={props => <List.Icon {...props} icon="timer" />}
            disabled={!settings.notificationsEnabled}
          />
        </TouchableRipple>
      </List.Section>
      
      <Divider />
      
      <List.Section>
        <List.Subheader>Data</List.Subheader>
        <TouchableRipple onPress={handleExportJson}>
          <List.Item
            title="Export as JSON"
            description="Export your habit data in JSON format"
            left={props => <List.Icon {...props} icon="file-export" />}
          />
        </TouchableRipple>
        
        <TouchableRipple onPress={handleExportCsv}>
          <List.Item
            title="Export as CSV"
            description="Export your habit data in CSV format"
            left={props => <List.Icon {...props} icon="file-delimited" />}
          />
        </TouchableRipple>
        
        <TouchableRipple onPress={handleRefreshStats}>
          <List.Item
            title="Refresh Statistics"
            description="Recalculate all habit statistics"
            left={props => <List.Icon {...props} icon="refresh" />}
          />
        </TouchableRipple>
      </List.Section>
      
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Habit Tracker v1.0.0</Text>
      </View>
      
      {/* Time picker */}
      {showTimePicker && (
        <DateTimePicker
          value={(() => {
            const [hours, minutes] = settings.notificationStartTime.split(':').map(Number);
            const date = new Date();
            date.setHours(hours, minutes, 0, 0);
            return date;
          })()}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleTimeChange}
        />
      )}
      
      {/* Interval dialog */}
      <Portal>
        <Dialog visible={showIntervalDialog} onDismiss={() => setShowIntervalDialog(false)}>
          <Dialog.Title>Reminder Interval</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Minutes"
              value={intervalMinutes}
              onChangeText={setIntervalMinutes}
              keyboardType="number-pad"
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowIntervalDialog(false)}>Cancel</Button>
            <Button onPress={handleIntervalChange}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  versionContainer: {
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  versionText: {
    opacity: 0.5,
  },
});

export default SettingsScreen; 