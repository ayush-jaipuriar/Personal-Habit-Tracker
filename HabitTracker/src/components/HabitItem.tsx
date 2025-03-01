import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card, Text, IconButton, ProgressBar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Habit, HabitLog, HabitStatus } from '../types';
import { useTheme } from '../context/ThemeContext';
import { formatDateToReadable, isToday } from '../utils/helpers';

interface HabitItemProps {
  habit: Habit;
  log?: HabitLog;
  onPress: () => void;
  onStatusChange?: (status: 'done' | 'failed') => void;
  showStatus?: boolean;
  showProgress?: boolean;
  completionRate?: number;
  currentStreak?: number;
}

const HabitItem: React.FC<HabitItemProps> = ({
  habit,
  log,
  onPress,
  onStatusChange,
  showStatus = true,
  showProgress = false,
  completionRate = 0,
  currentStreak = 0,
}) => {
  const { theme, isDarkMode } = useTheme();
  
  // Get the category color or use a default
  const categoryColor = theme.colors.categoryColors[habit.category] || theme.colors.primary;
  
  // Get the icon for the habit category
  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'health':
        return 'heart';
      case 'work':
        return 'briefcase';
      case 'personal':
        return 'account';
      case 'education':
        return 'school';
      case 'social':
        return 'account-group';
      default:
        return 'star';
    }
  };
  
  // Get the status icon and color
  const getStatusIcon = (status?: HabitStatus): { icon: string; color: string } => {
    switch (status) {
      case 'done':
        return { icon: 'check-circle', color: theme.colors.success };
      case 'failed':
        return { icon: 'close-circle', color: theme.colors.error };
      default:
        return { icon: 'circle-outline', color: theme.colors.disabled };
    }
  };
  
  const statusInfo = getStatusIcon(log?.status);
  
  return (
    <Card
      style={[
        styles.card,
        {
          backgroundColor: isDarkMode ? theme.colors.surface : '#fff',
          borderLeftColor: categoryColor,
          borderLeftWidth: 4,
        },
      ]}
      onPress={onPress}
    >
      <Card.Content style={styles.content}>
        <View style={styles.leftContent}>
          <Icon name={getCategoryIcon(habit.category)} size={24} color={categoryColor} style={styles.categoryIcon} />
          <View style={styles.textContainer}>
            <Text style={styles.title}>{habit.name}</Text>
            <Text style={styles.subtitle}>
              {habit.frequency.type === 'daily'
                ? 'Daily'
                : habit.frequency.type === 'weekly'
                ? 'Weekly'
                : 'Custom'}
            </Text>
            {habit.description && (
              <Text style={styles.description} numberOfLines={2}>
                {habit.description}
              </Text>
            )}
            {showProgress && (
              <View style={styles.progressContainer}>
                <ProgressBar
                  progress={completionRate / 100}
                  color={categoryColor}
                  style={styles.progressBar}
                />
                <Text style={styles.progressText}>{completionRate.toFixed(0)}% completed</Text>
              </View>
            )}
            {currentStreak > 0 && (
              <View style={styles.streakContainer}>
                <Icon name="fire" size={16} color={theme.colors.warning} />
                <Text style={styles.streakText}>{currentStreak} day streak</Text>
              </View>
            )}
          </View>
        </View>
        
        {showStatus && onStatusChange && (
          <View style={styles.statusContainer}>
            {log?.status ? (
              <View style={styles.statusButtons}>
                <IconButton
                  icon={statusInfo.icon}
                  iconColor={statusInfo.color}
                  size={28}
                  onPress={() => {}}
                  disabled
                />
                <Text style={[styles.statusText, { color: statusInfo.color }]}>
                  {log.status === 'done' ? 'Done' : 'Failed'}
                </Text>
              </View>
            ) : (
              <View style={styles.statusButtons}>
                <IconButton
                  icon="check-circle"
                  iconColor={theme.colors.success}
                  size={28}
                  onPress={() => onStatusChange('done')}
                />
                <IconButton
                  icon="close-circle"
                  iconColor={theme.colors.error}
                  size={28}
                  onPress={() => onStatusChange('failed')}
                />
              </View>
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 2,
    borderRadius: 8,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  description: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.8,
  },
  statusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  streakText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: 'bold',
  },
});

export default HabitItem; 