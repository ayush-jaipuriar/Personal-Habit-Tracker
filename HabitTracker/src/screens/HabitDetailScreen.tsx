import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, IconButton, Divider, List, Chip, ProgressBar } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../context/ThemeContext';
import { useHabits } from '../context/HabitContext';
import { formatDateToReadable, getCurrentDate } from '../utils/helpers';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import StatusAnimation from '../components/StatusAnimation';

type Props = NativeStackScreenProps<RootStackParamList, 'HabitDetail'>;

const HabitDetailScreen = ({ route, navigation }: Props) => {
  const { habitId } = route.params;
  const { theme } = useTheme();
  const { habits, habitLogs, habitStats, logHabit, deleteHabit } = useHabits();
  
  const [habit, setHabit] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationStatus, setAnimationStatus] = useState<'done' | 'failed'>('done');
  
  // Load habit data
  useEffect(() => {
    const foundHabit = habits.find(h => h.id === habitId);
    if (foundHabit) {
      setHabit(foundHabit);
      
      // Get habit stats
      const foundStats = habitStats.find(s => s.habitId === habitId);
      setStats(foundStats);
      
      // Get recent logs (last 10)
      const habitLogEntries = habitLogs
        .filter(log => log.habitId === habitId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);
      setRecentLogs(habitLogEntries);
    } else {
      // Habit not found, go back
      Alert.alert('Error', 'Habit not found');
      navigation.goBack();
    }
  }, [habitId, habits, habitLogs, habitStats]);
  
  // Handle marking habit as done/failed
  const handleStatusChange = (status: 'done' | 'failed') => {
    if (!habit) return;
    
    const today = getCurrentDate();
    const alreadyLoggedToday = recentLogs.some(log => log.date === today);
    
    if (alreadyLoggedToday) {
      Alert.alert(
        'Already Logged',
        'You have already logged this habit today. Do you want to update it?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Update', 
            onPress: () => {
              logHabit(habit.id, status);
              setAnimationStatus(status);
              setShowAnimation(true);
            } 
          }
        ]
      );
    } else {
      logHabit(habit.id, status);
      setAnimationStatus(status);
      setShowAnimation(true);
    }
  };
  
  // Handle deleting habit
  const confirmDelete = () => {
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deleteHabit(habit.id);
            navigation.goBack();
          } 
        }
      ]
    );
  };
  
  if (!habit || !stats) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text>Loading...</Text>
      </View>
    );
  }
  
  // Calculate today's status
  const today = getCurrentDate();
  const todayLog = recentLogs.find(log => log.date === today);
  const todayStatus = todayLog ? todayLog.status : 'pending';
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        {/* Habit header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.headerRow}>
              <View style={styles.headerIcon}>
                <Icon 
                  name={habit.icon || 'checkbox-marked-circle-outline'} 
                  size={40} 
                  color={theme.colors.categoryColors[habit.category]}
                />
              </View>
              <View style={styles.headerContent}>
                <Text style={styles.habitTitle}>{habit.name}</Text>
                <Chip 
                  style={[styles.categoryChip, { backgroundColor: theme.colors.categoryColors[habit.category] }]}
                  textStyle={{ color: '#fff' }}
                >
                  {habit.category}
                </Chip>
              </View>
              <IconButton
                icon="pencil"
                size={24}
                onPress={() => navigation.navigate('EditHabit', { habitId: habit.id })}
              />
            </View>
            
            <Text style={styles.habitDescription}>{habit.description}</Text>
            
            <View style={styles.frequencyContainer}>
              <Text style={styles.frequencyLabel}>Frequency: </Text>
              <Text>{habit.frequency.type === 'daily' ? 'Daily' : 
                     habit.frequency.type === 'weekly' ? `Weekly (${habit.frequency.days.join(', ')})` :
                     'Custom'}</Text>
            </View>
            
            <View style={styles.reminderContainer}>
              <Text style={styles.reminderLabel}>Reminder: </Text>
              <Text>{habit.reminder ? `${habit.reminder.time}` : 'None'}</Text>
            </View>
          </Card.Content>
        </Card>
        
        {/* Stats section */}
        <Card style={styles.statsCard}>
          <Card.Title title="Statistics" />
          <Card.Content>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.currentStreak}</Text>
                <Text style={styles.statLabel}>Current Streak</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.longestStreak}</Text>
                <Text style={styles.statLabel}>Longest Streak</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.completionRate}%</Text>
                <Text style={styles.statLabel}>Completion Rate</Text>
              </View>
            </View>
            
            <Divider style={styles.divider} />
            
            <Text style={styles.progressLabel}>Overall Progress</Text>
            <ProgressBar 
              progress={stats.completionRate / 100} 
              color={theme.colors.primary}
              style={styles.progressBar}
            />
            
            <View style={styles.statsDetails}>
              <Text>Total completions: {stats.totalCompletions}</Text>
              <Text>Days tracked: {stats.totalDays}</Text>
              <Text>Last completed: {stats.lastCompletedDate ? formatDateToReadable(stats.lastCompletedDate) : 'Never'}</Text>
            </View>
          </Card.Content>
        </Card>
        
        {/* Today's status */}
        <Card style={styles.todayCard}>
          <Card.Title title="Today's Status" />
          <Card.Content>
            <View style={styles.todayStatusContainer}>
              {todayStatus === 'pending' ? (
                <View style={styles.pendingContainer}>
                  <Text style={styles.pendingText}>Not logged yet</Text>
                  <View style={styles.actionButtons}>
                    <Button 
                      mode="contained" 
                      onPress={() => handleStatusChange('done')}
                      style={[styles.actionButton, { backgroundColor: theme.colors.success }]}
                    >
                      Mark as Done
                    </Button>
                    <Button 
                      mode="contained" 
                      onPress={() => handleStatusChange('failed')}
                      style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
                    >
                      Mark as Failed
                    </Button>
                  </View>
                </View>
              ) : (
                <View style={styles.loggedContainer}>
                  <Icon 
                    name={todayStatus === 'done' ? 'check-circle' : 'close-circle'} 
                    size={40} 
                    color={todayStatus === 'done' ? theme.colors.success : theme.colors.error}
                  />
                  <Text style={styles.loggedText}>
                    {todayStatus === 'done' ? 'Completed' : 'Failed'} today
                  </Text>
                  <View style={styles.actionButtons}>
                    <Button 
                      mode="outlined" 
                      onPress={() => handleStatusChange(todayStatus === 'done' ? 'failed' : 'done')}
                    >
                      Change Status
                    </Button>
                  </View>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>
        
        {/* Recent logs */}
        <Card style={styles.logsCard}>
          <Card.Title title="Recent Activity" />
          <Card.Content>
            {recentLogs.length > 0 ? (
              recentLogs.map((log, index) => (
                <List.Item
                  key={index}
                  title={formatDateToReadable(log.date)}
                  description={log.note || 'No notes'}
                  left={props => (
                    <List.Icon 
                      {...props} 
                      icon={log.status === 'done' ? 'check-circle' : 'close-circle'} 
                      color={log.status === 'done' ? theme.colors.success : theme.colors.error}
                    />
                  )}
                />
              ))
            ) : (
              <Text style={styles.emptyText}>No activity recorded yet</Text>
            )}
          </Card.Content>
        </Card>
        
        {/* Delete button */}
        <View style={styles.deleteContainer}>
          <Button 
            mode="outlined" 
            onPress={confirmDelete}
            textColor={theme.colors.error}
            style={styles.deleteButton}
          >
            Delete Habit
          </Button>
        </View>
      </ScrollView>
      
      {/* Status animation overlay */}
      {showAnimation && (
        <StatusAnimation 
          status={animationStatus} 
          onAnimationComplete={() => setShowAnimation(false)} 
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    margin: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  categoryChip: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  habitDescription: {
    marginTop: 8,
    marginBottom: 8,
  },
  frequencyContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  frequencyLabel: {
    fontWeight: 'bold',
  },
  reminderContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  reminderLabel: {
    fontWeight: 'bold',
  },
  statsCard: {
    margin: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  divider: {
    marginVertical: 12,
  },
  progressLabel: {
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  statsDetails: {
    marginTop: 12,
  },
  todayCard: {
    margin: 8,
  },
  todayStatusContainer: {
    alignItems: 'center',
    padding: 8,
  },
  pendingContainer: {
    alignItems: 'center',
  },
  pendingText: {
    fontSize: 16,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  actionButton: {
    marginHorizontal: 8,
  },
  loggedContainer: {
    alignItems: 'center',
  },
  loggedText: {
    fontSize: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  logsCard: {
    margin: 8,
  },
  emptyText: {
    textAlign: 'center',
    padding: 16,
    opacity: 0.7,
  },
  deleteContainer: {
    padding: 16,
    alignItems: 'center',
  },
  deleteButton: {
    borderColor: 'red',
  },
});

export default HabitDetailScreen; 