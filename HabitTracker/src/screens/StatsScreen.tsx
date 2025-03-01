import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Dimensions } from 'react-native';
import { Text, Card, Chip, ActivityIndicator } from 'react-native-paper';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useTheme } from '../context/ThemeContext';
import { useHabits } from '../context/HabitContext';
import { HabitCategory } from '../types';
import { formatDateToReadable, getCurrentDate } from '../utils/helpers';

const { width } = Dimensions.get('window');

const StatsScreen = () => {
  const { theme, isDarkMode } = useTheme();
  const { habits, habitLogs, habitStats } = useHabits();
  
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | null>(null);
  const [completionData, setCompletionData] = useState<any>({
    labels: [],
    datasets: [{ data: [] }],
  });
  const [categoryData, setCategoryData] = useState<any>([]);
  const [streakData, setStreakData] = useState<any>({
    labels: [],
    datasets: [{ data: [] }],
  });
  
  // Load stats on mount
  useEffect(() => {
    loadStats();
    // Simulate loading for demo purposes
    setTimeout(() => setLoading(false), 1000);
  }, [habits, habitLogs, habitStats, selectedCategory]);
  
  // Handle category filter
  const toggleCategory = (category: HabitCategory) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };
  
  // Load statistics data
  const loadStats = () => {
    // Filter habits by category if selected
    const filteredHabits = selectedCategory
      ? habits.filter(habit => habit.category === selectedCategory)
      : habits;
    
    const filteredStats = filteredHabits.map(habit => {
      return habitStats.find(stat => stat.habitId === habit.id);
    }).filter(Boolean);
    
    // Prepare completion rate data for line chart (last 7 days)
    const last7Days = [];
    const completionRates = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = `${date.getMonth() + 1}/${date.getDate()}`;
      last7Days.push(dateString);
      
      // Calculate completion rate for this day
      const formattedDate = date.toISOString().split('T')[0];
      const dayLogs = habitLogs.filter(log => log.date === formattedDate);
      
      if (dayLogs.length === 0) {
        completionRates.push(0);
      } else {
        const completed = dayLogs.filter(log => log.status === 'done').length;
        const rate = (completed / dayLogs.length) * 100;
        completionRates.push(rate);
      }
    }
    
    setCompletionData({
      labels: last7Days,
      datasets: [{ data: completionRates }],
    });
    
    // Prepare category distribution data for pie chart
    const categories: Record<HabitCategory, number> = {
      health: 0,
      work: 0,
      personal: 0,
      education: 0,
      social: 0,
      other: 0,
    };
    
    filteredHabits.forEach(habit => {
      categories[habit.category]++;
    });
    
    const pieData = Object.entries(categories)
      .filter(([_, count]) => count > 0)
      .map(([category, count]) => ({
        name: category,
        count,
        color: theme.colors.categoryColors[category as HabitCategory],
        legendFontColor: theme.colors.text,
        legendFontSize: 12,
      }));
    
    setCategoryData(pieData);
    
    // Prepare streak data for bar chart
    const topStreaks = [...filteredStats]
      .sort((a, b) => (b?.currentStreak || 0) - (a?.currentStreak || 0))
      .slice(0, 5);
    
    const streakLabels = topStreaks.map(stat => {
      const habit = habits.find(h => h.id === stat?.habitId);
      return habit ? habit.name.substring(0, 6) : '';
    });
    
    const streakValues = topStreaks.map(stat => stat?.currentStreak || 0);
    
    setStreakData({
      labels: streakLabels,
      datasets: [{ data: streakValues }],
    });
  };
  
  // Calculate overall stats
  const totalHabits = habits.length;
  const completedToday = habitLogs.filter(
    log => log.date === getCurrentDate() && log.status === 'done'
  ).length;
  const averageCompletionRate =
    habitStats.reduce((sum, stat) => sum + stat.completionRate, 0) / (habitStats.length || 1);
  const longestStreak = Math.max(
    ...habitStats.map(stat => stat.longestStreak),
    0
  );
  
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading statistics...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Summary cards */}
      <View style={styles.summaryContainer}>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.summaryValue}>{totalHabits}</Text>
            <Text style={styles.summaryLabel}>Total Habits</Text>
          </Card.Content>
        </Card>
        
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.summaryValue}>{completedToday}</Text>
            <Text style={styles.summaryLabel}>Completed Today</Text>
          </Card.Content>
        </Card>
        
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.summaryValue}>{averageCompletionRate.toFixed(0)}%</Text>
            <Text style={styles.summaryLabel}>Avg. Completion</Text>
          </Card.Content>
        </Card>
        
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.summaryValue}>{longestStreak}</Text>
            <Text style={styles.summaryLabel}>Longest Streak</Text>
          </Card.Content>
        </Card>
      </View>
      
      {/* Category filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Chip
            selected={selectedCategory === 'health'}
            onPress={() => toggleCategory('health')}
            style={styles.filterChip}
            selectedColor={theme.colors.categoryColors.health}
          >
            Health
          </Chip>
          <Chip
            selected={selectedCategory === 'work'}
            onPress={() => toggleCategory('work')}
            style={styles.filterChip}
            selectedColor={theme.colors.categoryColors.work}
          >
            Work
          </Chip>
          <Chip
            selected={selectedCategory === 'personal'}
            onPress={() => toggleCategory('personal')}
            style={styles.filterChip}
            selectedColor={theme.colors.categoryColors.personal}
          >
            Personal
          </Chip>
          <Chip
            selected={selectedCategory === 'education'}
            onPress={() => toggleCategory('education')}
            style={styles.filterChip}
            selectedColor={theme.colors.categoryColors.education}
          >
            Education
          </Chip>
          <Chip
            selected={selectedCategory === 'social'}
            onPress={() => toggleCategory('social')}
            style={styles.filterChip}
            selectedColor={theme.colors.categoryColors.social}
          >
            Social
          </Chip>
          <Chip
            selected={selectedCategory === 'other'}
            onPress={() => toggleCategory('other')}
            style={styles.filterChip}
            selectedColor={theme.colors.categoryColors.other}
          >
            Other
          </Chip>
        </ScrollView>
      </View>
      
      {/* Completion rate chart */}
      <Card style={styles.chartCard}>
        <Card.Title title="Completion Rate (Last 7 Days)" />
        <Card.Content>
          {completionData.datasets[0].data.length > 0 ? (
            <LineChart
              data={completionData}
              width={width - 40}
              height={220}
              chartConfig={{
                backgroundColor: isDarkMode ? theme.colors.surface : theme.colors.background,
                backgroundGradientFrom: isDarkMode ? theme.colors.surface : theme.colors.background,
                backgroundGradientTo: isDarkMode ? theme.colors.surface : theme.colors.background,
                decimalPlaces: 0,
                color: (opacity = 1) => theme.colors.primary,
                labelColor: (opacity = 1) => theme.colors.text,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: theme.colors.primary,
                },
              }}
              bezier
              style={styles.chart}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text>No data available</Text>
            </View>
          )}
        </Card.Content>
      </Card>
      
      {/* Category distribution chart */}
      <Card style={styles.chartCard}>
        <Card.Title title="Habit Categories" />
        <Card.Content>
          {categoryData.length > 0 ? (
            <PieChart
              data={categoryData}
              width={width - 40}
              height={220}
              chartConfig={{
                backgroundColor: isDarkMode ? theme.colors.surface : theme.colors.background,
                backgroundGradientFrom: isDarkMode ? theme.colors.surface : theme.colors.background,
                backgroundGradientTo: isDarkMode ? theme.colors.surface : theme.colors.background,
                decimalPlaces: 0,
                color: (opacity = 1) => theme.colors.text,
                labelColor: (opacity = 1) => theme.colors.text,
                style: {
                  borderRadius: 16,
                },
              }}
              accessor="count"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text>No data available</Text>
            </View>
          )}
        </Card.Content>
      </Card>
      
      {/* Top streaks chart */}
      <Card style={styles.chartCard}>
        <Card.Title title="Top Streaks" />
        <Card.Content>
          {streakData.datasets[0].data.length > 0 ? (
            <BarChart
              data={streakData}
              width={width - 40}
              height={220}
              chartConfig={{
                backgroundColor: isDarkMode ? theme.colors.surface : theme.colors.background,
                backgroundGradientFrom: isDarkMode ? theme.colors.surface : theme.colors.background,
                backgroundGradientTo: isDarkMode ? theme.colors.surface : theme.colors.background,
                decimalPlaces: 0,
                color: (opacity = 1) => theme.colors.secondary,
                labelColor: (opacity = 1) => theme.colors.text,
                style: {
                  borderRadius: 16,
                },
              }}
              style={styles.chart}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text>No data available</Text>
            </View>
          )}
        </Card.Content>
      </Card>
      
      <View style={styles.footer} />
    </ScrollView>
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
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 8,
  },
  summaryCard: {
    width: '48%',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
  filtersContainer: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  filterChip: {
    marginHorizontal: 4,
    marginVertical: 4,
  },
  chartCard: {
    margin: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    height: 20,
  },
});

export default StatsScreen; 