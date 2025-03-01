import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import { Text, FAB, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useHabits } from '../context/HabitContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import HabitItem from '../components/HabitItem';
import StatusAnimation from '../components/StatusAnimation';
import { getCurrentDate, formatDateToReadable } from '../utils/helpers';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { theme, isDarkMode } = useTheme();
  const { 
    habits, 
    habitLogs, 
    getHabitLogsByDate, 
    logHabit, 
    getHabitStatsByHabitId 
  } = useHabits();
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [todayHabits, setTodayHabits] = useState<any[]>([]);
  const [statusAnimation, setStatusAnimation] = useState<{
    visible: boolean;
    status: 'done' | 'failed';
  }>({
    visible: false,
    status: 'done',
  });
  
  // Get today's date
  const today = getCurrentDate();
  
  // Load habits on mount and when dependencies change
  useEffect(() => {
    loadTodayHabits();
  }, [habits, habitLogs]);
  
  // Load today's habits
  const loadTodayHabits = async () => {
    setLoading(true);
    
    try {
      // For demo purposes, simulate loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const filteredHabits = habits.filter(habit => {
        // Daily habits are always shown
        if (habit.frequency.type === 'daily') return true;
        
        // Weekly habits are shown on their selected days
        if (habit.frequency.type === 'weekly') {
          const today = new Date().getDay();
          const weekdayMap: Record<number, string> = {
            0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat'
          };
          const todayString = weekdayMap[today];
          return habit.frequency.days.includes(todayString as any);
        }
        
        // Custom frequency habits are shown on specified days
        if (habit.frequency.type === 'custom' && habit.frequency.customDays) {
          const dayOfWeek = new Date().getDay();
          return habit.frequency.customDays.includes(dayOfWeek);
        }
        
        return false;
      });
      
      // Get logs for today
      const todayLogs = getHabitLogsByDate(getCurrentDate());
      
      // Combine habits with their logs and stats
      const habitsWithData = filteredHabits.map(habit => {
        const log = todayLogs.find(log => log.habitId === habit.id);
        const stats = getHabitStatsByHabitId(habit.id);
        return { habit, log, stats };
      });
      
      setTodayHabits(habitsWithData);
    } catch (error) {
      console.error('Error loading today\'s habits:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadTodayHabits();
  };
  
  // Handle habit status change
  const handleStatusChange = async (habitId: string, status: 'done' | 'failed') => {
    try {
      await logHabit(habitId, status);
      
      // Show animation
      setStatusAnimation({
        visible: true,
        status,
      });
      
      // Refresh the list
      await loadTodayHabits();
    } catch (error) {
      console.error('Error updating habit status:', error);
    }
  };
  
  // Handle animation completion
  const handleAnimationComplete = () => {
    setStatusAnimation({
      ...statusAnimation,
      visible: false,
    });
  };
  
  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No habits for today</Text>
      <Text style={styles.emptySubtitle}>
        Add a new habit to start tracking your progress
      </Text>
    </View>
  );
  
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading your habits...</Text>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Today's date */}
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>{formatDateToReadable(today)}</Text>
      </View>
      
      {/* Habits list */}
      <FlatList
        data={todayHabits}
        keyExtractor={(item) => item.habit.id}
        renderItem={({ item }) => (
          <HabitItem
            habit={item.habit}
            log={item.log}
            onPress={() => navigation.navigate('HabitDetail', { habitId: item.habit.id })}
            onStatusChange={(status) => handleStatusChange(item.habit.id, status)}
            currentStreak={item.stats?.currentStreak}
          />
        )}
        contentContainerStyle={todayHabits.length === 0 ? { flex: 1 } : null}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      />
      
      {/* Add habit button */}
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        color="#fff"
        onPress={() => navigation.navigate('AddHabit')}
      />
      
      {/* Status animation */}
      {statusAnimation.visible && (
        <StatusAnimation
          status={statusAnimation.status}
          onAnimationComplete={handleAnimationComplete}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  dateContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default HomeScreen; 